import { NextResponse } from "next/server";
import { getMarketData } from "../../../lib/market";
import { supabase } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. 야후 파이낸스에서 실시간 지수 및 5일치 히스토리 가져오기 (1분 캐시 설정됨)
    let dxy: any = null;
    try {
      const marketData = await getMarketData(["달러 인덱스"], true);
      dxy = marketData?.[0] || null;
    } catch (e) {
      console.error("marketData fetch error:", e);
    }

    // 2. Supabase에서 AI 분석 결과 가져오기
    let analysisData = null;
    try {
      // route handler에서는 브라우저 환경이 아니므로 캐시 수동 제어가 필요할 수 있음
      const { data, error: dbError } = await supabase
        .from("dollar_index")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (dbError) {
        console.error("DB fetching error for DXY:", dbError);
      } else {
        analysisData = data;
      }
    } catch (e) {
      console.error("Supabase connection error:", e);
    }

    // 데이터가 둘 다 없는 경우에만 에러 반환
    if (!dxy && !analysisData) {
      return NextResponse.json(
        {
          error: "데이터를 불러올 수 없습니다. 외부 서비스 연결을 확인하세요.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ...dxy,
      analysis: analysisData || {
        title: "분석 데이터를 불러올 수 없습니다.",
        analysis: "현재 AI 분석 결과를 가져오는 중입니다.",
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Dollar Index API Global Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}
