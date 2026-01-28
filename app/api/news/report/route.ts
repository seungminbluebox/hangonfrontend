import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("daily_reports")
      .select("*")
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // 데이터가 없을 경우 에러 메시지와 함께 반환
      return NextResponse.json({ error: "No reports found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error fetching daily report:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily report" },
      { status: 500 },
    );
  }
}
