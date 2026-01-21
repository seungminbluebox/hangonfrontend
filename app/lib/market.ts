export interface MarketData {
  name: string;
  value: string;
  krwValue?: string;
  change: string;
  changePercent: string;
  isUp: boolean;
  isDown: boolean;
  history: { value: number | null; time: string }[];
}

const SYMBOLS = [
  { name: "KOSPI", symbol: "^KS11" },
  { name: "KOSDAQ", symbol: "^KQ11" },
  { name: "S&P 500", symbol: "^GSPC" },
  { name: "NASDAQ", symbol: "^IXIC" },
  { name: "나스닥 선물", symbol: "NQ=F" },
  { name: "다우존스", symbol: "^DJI" },
  { name: "원/달러 환율", symbol: "USDKRW=X" },
  { name: "비트코인", symbol: "BTC-USD" },
  { name: "금 가격(온스)", symbol: "GC=F" },
  { name: "WTI 원유", symbol: "CL=F" },
];

async function fetchFromYahoo(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=2d`;
    const response = await fetch(url, {
      next: { revalidate: 10 }, // 10초 간격 캐싱
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.chart.result[0];
  } catch (error) {
    console.error(`Error fetching ${symbol} from Yahoo:`, error);
    return null;
  }
}

export async function getMarketData(): Promise<MarketData[]> {
  try {
    let exchangeRate = 1350; // 기본값

    // 모든 데이터를 동시에 가져오기 위해 Promise.all 사용
    const rawData = await Promise.all(
      SYMBOLS.map(async (s) => {
        const data = await fetchFromYahoo(s.symbol);
        return { ...s, data };
      }),
    );

    // 환율 정보 먼저 찾기
    const exchangeData = rawData.find((d) => d.symbol === "USDKRW=X")?.data;
    if (exchangeData) {
      exchangeRate = exchangeData.meta.regularMarketPrice;
    }

    const marketData = rawData
      .map(({ name, symbol, data }): MarketData | null => {
        if (!data) return null;

        const meta = data.meta;
        const currentPrice: number = meta.regularMarketPrice;
        const previousClose: number = meta.previousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        const quote = data.indicators.quote[0];
        const timestamps = data.timestamp || [];
        const closePrices =
          quote.close
            ?.map((p: number | null, i: number) => ({
              value: p,
              time: timestamps[i]
                ? new Date(timestamps[i] * 1000).toLocaleString("ko-KR", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "",
            }))
            .filter((item: any) => item.value !== null) || [];

        let krwValue: string | undefined = undefined;
        if (symbol === "BTC-USD") {
          const converted = currentPrice * exchangeRate;
          krwValue = `₩${Math.floor(converted).toLocaleString()}`;
        }

        return {
          name,
          value: currentPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          krwValue,
          change: Math.abs(change).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          changePercent: `${change > 0 ? "+" : ""}${changePercent.toFixed(2)}%`,
          isUp: change > 0,
          isDown: change < 0,
          history: closePrices,
        };
      })
      .filter((item): item is MarketData => item !== null);

    return marketData;
  } catch (error) {
    console.error("Error in getMarketData:", error);
    return [];
  }
}
