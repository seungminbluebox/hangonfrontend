import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase credentials not configured" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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

    return NextResponse.json({
      analysis: analysisData,
      history: historyData,
    });
  } catch (error: any) {
    console.error("Error fetching credit balance data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
