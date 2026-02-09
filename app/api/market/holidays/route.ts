import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const country = searchParams.get("country");

    let query = supabase
      .from("market_holidays")
      .select("*")
      .order("date", { ascending: true });

    if (start && end) {
      query = query.gte("date", start).lte("date", end);
    }
    if (country) {
      query = query.eq("country", country.toUpperCase());
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("API error fetching holiday data:", error);
    return NextResponse.json(
      { error: "Failed to fetch holiday data" },
      { status: 500 },
    );
  }
}
