import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("market_correlations")
      .select("*")
      .eq("type", "KOSPI_SP500_20D")
      .order("date", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error: any) {
    console.error("Error fetching correlation data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
