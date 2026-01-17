import { createClient } from "@supabase/supabase-js";

export interface MarketData {
  name: string;
  value: string;
  krwValue?: string;
  change: string;
  changePercent: string;
  isUp: boolean;
  isDown: boolean;
  history: { value: number }[];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getMarketData(): Promise<MarketData[]> {
  try {
    const { data, error } = await supabase
      .from("market_data")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching market data from Supabase:", error);
      return [];
    }

    return (data || []).map((item) => ({
      name: item.name,
      value: item.value,
      krwValue: item.krw_value,
      change: item.change,
      changePercent: item.change_percent,
      isUp: item.is_up,
      isDown: item.is_down,
      history: item.history,
    }));
  } catch (error) {
    console.error("Error in getMarketData:", error);
    return [];
  }
}
