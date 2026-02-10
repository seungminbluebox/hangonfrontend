import { NextRequest, NextResponse } from "next/server";
import { getKospiNightFuturesData } from "@/lib/market-night-futures";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const marketData = await getKospiNightFuturesData();

    if (!marketData) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    return NextResponse.json(marketData);
  } catch (error) {
    console.error("API error fetching night futures:", error);
    return NextResponse.json(
      { error: "Failed to fetch night futures data" },
      { status: 500 },
    );
  }
}
