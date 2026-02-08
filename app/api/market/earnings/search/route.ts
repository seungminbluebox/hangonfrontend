import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query || query.trim() === "") {
      return NextResponse.json([]);
    }

    const searchTerm = query.toLowerCase();

    // 전체 DB에서 검색 (범위 제한 없음)
    const { data, error } = await supabase
      .from("earnings_calendar")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;

    // 클라이언트 측 필터링: company_name 또는 symbol 포함
    const filteredData =
      data?.filter((record: any) => {
        const companyName = record.company_name?.toLowerCase() || "";
        const symbol = record.symbol?.toLowerCase() || "";
        return companyName.includes(searchTerm) || symbol.includes(searchTerm);
      }) || [];

    // snake_case → camelCase 변환
    const formattedData = filteredData.map((record: any) => {
      const price = record.current_price ?? record.currentPrice;
      return {
        ...record,
        currentPrice: price != null ? Number(price) : null,
        current_price: price != null ? Number(price) : null,
        epsPredicted: record.eps_estimate,
        epsActual: record.eps_actual,
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search earnings events" },
      { status: 500 },
    );
  }
}
