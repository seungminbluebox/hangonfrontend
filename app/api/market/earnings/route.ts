import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let query = supabase
      .from("earnings_calendar")
      .select("*")
      .order("date", { ascending: true });

    if (date) {
      query = query.eq("date", date);
    } else if (start && end) {
      query = query.gte("date", start).lte("date", end);
    } else {
      // 기본값: 오늘 기준 앞뒤 2주치 데이터를 가져옴
      const today = new Date();
      const past = new Date(today);
      past.setDate(today.getDate() - 14);
      const future = new Date(today);
      future.setDate(today.getDate() + 30);

      query = query
        .gte("date", past.toISOString().split("T")[0])
        .lte("date", future.toISOString().split("T")[0])
        .limit(200);
    }

    const { data, error } = await query;

    if (error) throw error;

    // snake_case → camelCase 변환
    const formattedData =
      data?.map((record: any) => {
        const price = record.current_price ?? record.currentPrice;
        return {
          ...record,
          // 보수적으로 모든 가격 필드를 숫자로 변환
          currentPrice: price != null ? Number(price) : null,
          current_price: price != null ? Number(price) : null,
          epsPredicted: record.eps_estimate,
          epsActual: record.eps_actual,
          revenueEstimate: record.revenue_estimate,
          revenueEstimateFormatted: record.revenue_estimate_formatted,
          revenueActual: record.revenue_actual,
          revenueActualFormatted: record.revenue_actual_formatted,
          companyName: record.company_name,
          logoUrl: record.logo_url,
          updatedAt: record.updated_at,
        };
      }) || [];

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("API error fetching earnings data:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings data" },
      { status: 500 },
    );
  }
}
