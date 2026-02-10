import { supabase } from "./supabase";
import { MarketData } from "../app/lib/market";

export async function getKospiNightFuturesData(): Promise<MarketData | null> {
  try {
    const { data, error } = await supabase
      .from("market_night_futures")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (error || !data || data.length === 0) return null;

    const latest = data[0];
    const history = data
      .map((item: any) => {
        const date = new Date(item.recorded_at);
        return {
          value: parseFloat(item.price),
          time: date.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Seoul",
          }),
          fullDate: date.toLocaleDateString("ko-KR", {
            month: "numeric",
            day: "numeric",
            timeZone: "Asia/Seoul",
          }),
        };
      })
      .reverse();

    const change = parseFloat(latest.change);
    const diff = parseFloat(latest.diff);

    return {
      name: "코스피 야간선물",
      value: parseFloat(latest.price).toLocaleString(undefined, {
        minimumFractionDigits: 1,
      }),
      change:
        (change > 0 ? "+" : "") +
        change.toLocaleString(undefined, { minimumFractionDigits: 1 }),
      changePercent: (diff > 0 ? "+" : "") + diff.toFixed(2) + "%",
      isUp: change > 0,
      isDown: change < 0,
      history: history,
    };
  } catch (error) {
    console.error("Error fetching night futures:", error);
    return null;
  }
}
