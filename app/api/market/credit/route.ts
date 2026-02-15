import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. 분석 데이터 가져오기 (가장 최신 분석 결과 1건)
    const { data: analysisData, error: analysisError } = await supabase
      .from("credit_balance_analysis")
      .select("*")
      .eq("id", 1)
      .single();

    if (analysisError) throw analysisError;

    // 2. 히스토리 데이터 가져오기 (최근 1년 추세 - 약 250 영업일)
    const { data: historyData, error: historyError } = await supabase
      .from("credit_balance_history")
      .select("date, total, customer_deposit")
      .order("date", { ascending: true })
      .limit(300); // 넉넉하게 300일치 (약 1년의 영업일)

    if (historyError) throw historyError;

    return NextResponse.json(
      {
        analysis: analysisData,
        history: historyData,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      },
    );
  } catch (error: any) {
    console.error("Error fetching credit balance data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
