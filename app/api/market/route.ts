import { NextResponse } from "next/server";
import { getMarketData } from "../../lib/market";

export async function GET() {
  try {
    const marketData = await getMarketData();
    return NextResponse.json(marketData);
  } catch (error) {
    console.error("API error fetching market data:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 },
    );
  }
}
