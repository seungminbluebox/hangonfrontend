import { NextRequest, NextResponse } from "next/server";
import { getMarketData } from "../../lib/market";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");
    const isFull = searchParams.get("full") === "true";

    const symbols = symbolsParam ? symbolsParam.split(",") : undefined;

    const marketData = await getMarketData(symbols, isFull);
    return NextResponse.json(marketData);
  } catch (error) {
    console.error("API error fetching market data:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 },
    );
  }
}
