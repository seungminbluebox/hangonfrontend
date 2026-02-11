export interface MarketData {
  name: string;
  value: string;
  krwValue?: string;
  change: string;
  changePercent: string;
  isUp: boolean;
  isDown: boolean;
  history: {
    value: number | null;
    time: string;
    fullDate?: string;
    label?: string;
  }[];
}

const SYMBOLS = [
  { name: "KOSPI", symbol: "^KS11" },
  { name: "KOSDAQ", symbol: "^KQ11" },
  { name: "S&P 500", symbol: "^GSPC" },
  { name: "나스닥", symbol: "NQ=F" },
  { name: "다우존스", symbol: "^DJI" },
  { name: "원/달러 환율", symbol: "USDKRW=X" },
  { name: "비트코인", symbol: "BTC-USD" },
  { name: "금 가격", symbol: "GC=F" },
  { name: "WTI 원유", symbol: "CL=F" },
];

async function fetchFromYahoo(
  symbol: string,
  range: string = "1d",
  interval: string = "1m",
) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}&includePrePost=true`;
    const response = await fetch(url, {
      next: { revalidate: 60 }, // 1분 간격으로 야후 Finance 데이터 갱신 (사용자 요청 반영)
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

// 날짜 포맷터 재사용으로 성능 최적화 (toLocaleString은 매우 느림)
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const fullDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "numeric",
  day: "numeric",
});

/**
 * 특정 심볼들에 대한 마켓 데이터를 가져옵니다.
 * names가 없으면 모든 SYMBOLS를 가져옵니다.
 */
export async function getMarketData(
  names?: string[],
  isFull: boolean = false,
): Promise<MarketData[]> {
  try {
    let exchangeRate = 1350; // 기본값

    // 요청된 이름이 있으면 해당 심볼만 필터링, 없으면 전체
    const targetSymbols = names
      ? SYMBOLS.filter((s) => names.includes(s.name))
      : SYMBOLS;

    // 데이터 범위 설정
    // full 모드일 때 5일치(나스닥은 사용자 요청으로 2일치)를 가져오며, 연속성을 위해 적절한 단위 설정
    const range = isFull ? (names?.includes("나스닥") ? "2d" : "5d") : "1d";
    // 나스닥은 2일치이므로 1분 단위로 가져와도 데이터량이 적당함 (더 실시간에 가까움)
    const interval = isFull ? (names?.includes("나스닥") ? "1m" : "5m") : "1m";

    // 모든 데이터를 동시에 가져오기 위해 Promise.all 사용
    const rawData = await Promise.all(
      targetSymbols.map(async (s) => {
        const data = await fetchFromYahoo(s.symbol, range, interval);
        return { ...s, data };
      }),
    );

    // 환율 정보가 포함되어 있다면 업데이트 (비트코인 KRW 환산용)
    const exchangeDataRaw = targetSymbols.find((s) => s.symbol === "USDKRW=X")
      ? rawData.find((d) => d.symbol === "USDKRW=X")?.data
      : null;

    if (exchangeDataRaw) {
      exchangeRate = exchangeDataRaw.meta.regularMarketPrice;
    } else if (targetSymbols.some((s) => s.symbol === "BTC-USD")) {
      // BTC가 있는데 환율이 없으면 환율만 별도로 살짝 가져오기 (캐시 활용됨)
      const exData = await fetchFromYahoo("USDKRW=X", "1d", "60m");
      if (exData) exchangeRate = exData.meta.regularMarketPrice;
    }

    const marketData = rawData
      .map(({ name, symbol, data }): MarketData | null => {
        if (!data) return null;

        const meta = data.meta;
        const currentPrice: number = meta.regularMarketPrice;
        const previousClose: number = meta.previousClose || currentPrice;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        const quote = data.indicators.quote[0];
        const timestamps = data.timestamp || [];
        const rawClose = quote.close || [];

        // 데이터 포인트 최적화: 차트용 데이터가 너무 많으면(500개 이상) 샘플링하여 렌더링 속도 향상
        // 서버에서의 처리 시간 및 클라이언트로 전송되는 JSON 크기를 줄여 응답 속도 확보
        const skip = Math.max(1, Math.floor(rawClose.length / 400));
        const history: MarketData["history"] = [];

        for (let i = 0; i < rawClose.length; i += skip) {
          // 마지막 데이터 포인트는 무조건 포함하도록 i 조정
          const actualIdx =
            i + skip >= rawClose.length ? rawClose.length - 1 : i;
          const val = rawClose[actualIdx];
          if (val === null) {
            if (actualIdx === rawClose.length - 1) break;
            continue;
          }

          const date = timestamps[actualIdx]
            ? new Date(timestamps[actualIdx] * 1000)
            : null;
          const formattedTime = date
            ? dateFormatter.format(date).split(" ").slice(2).join(" ")
            : "";
          const formattedDate = date ? fullDateFormatter.format(date) : "";

          history.push({
            value: val,
            time: formattedTime,
            fullDate: formattedDate,
            label: `${formattedDate} ${formattedTime}`,
          });

          // 마지막 포인트를 추가했다면 루프 종료
          if (actualIdx === rawClose.length - 1) break;
        }

        // 현재 가격이 히스토리의 마지막 가격과 다르거나, 마지막 데이터가 3분 이상 지연되었을 때 현재 포인트를 추가
        const lastTimestamp =
          timestamps.length > 0 ? timestamps[timestamps.length - 1] * 1000 : 0;
        const nowMs = Date.now();
        const gapMs = nowMs - lastTimestamp;

        if (
          history.length > 0 &&
          (currentPrice !== history[history.length - 1].value || gapMs > 180000)
        ) {
          const now = new Date();
          const formattedTime = dateFormatter
            .format(now)
            .split(" ")
            .slice(2)
            .join(" ");
          const formattedDate = fullDateFormatter.format(now);

          history.push({
            value: currentPrice,
            time: formattedTime,
            fullDate: formattedDate,
            label: `${formattedDate} ${formattedTime}`,
          });
        }

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
          history,
        };
      })
      .filter((item): item is MarketData => item !== null);

    return marketData;
  } catch (error) {
    console.error("Error in getMarketData:", error);
    return [];
  }
}
