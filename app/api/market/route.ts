import { NextRequest, NextResponse } from "next/server";
import { getMarketData } from "../../lib/market";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");
    const isFull = searchParams.get("full") === "true";

    const symbols = symbolsParam ? symbolsParam.split(",") : undefined;

    const marketData = await getMarketData(symbols, isFull);

    // 에지 캐싱 추가: 1분 동안 에지 서버에서 캐시, 이후 30초 동안 백그라운드 갱신 허용
    return NextResponse.json(marketData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("API error fetching market data:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 },
    );
  }
}
