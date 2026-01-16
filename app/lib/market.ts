export interface MarketData {
  name: string;
  value: string;
  krwValue?: string; // 원화 환산 가격 (필수 아님)
  change: string;
  changePercent: string;
  isUp: boolean;
  isDown: boolean;
  history: { value: number }[];
}

export async function getMarketData(): Promise<MarketData[]> {
  const symbols = [
    { name: "KOSPI", symbol: "^KS11" },
    { name: "KOSDAQ", symbol: "^KQ11" },
    { name: "S&P 500", symbol: "^GSPC" },
    { name: "NASDAQ", symbol: "^IXIC" },
    { name: "다우존스", symbol: "^DJI" },
    { name: "원/달러 환율", symbol: "USDKRW=X" },
    { name: "비트코인", symbol: "BTC-USD" },
    { name: "금 가격(온스)", symbol: "GC=F" },
    { name: "WTI 원유", symbol: "CL=F" },
  ];

  // 1. 환율 데이터를 먼저 가져오거나 symbols 리스트 순회 중에 찾아서 저장해야 함
  // 여기서는 병렬 처리 후 나중에 환율을 찾아 비트코인 등에 적용
  const results = await Promise.all(
    symbols.map(async ({ name, symbol }) => {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=30m&range=1d`,
          { next: { revalidate: 300 } } // 5분마다 캐시 갱신
        );
        const data = await response.json();

        const result = data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];
        const closePrices = quote.close.filter(
          (p: number | null): p is number => p !== null
        );

        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        return {
          name,
          symbol,
          currentPriceNumeric: currentPrice, // 계산을 위해 숫자형 유지
          value: currentPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          change: Math.abs(change).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          changePercent: `${
            changePercent > 0 ? "+" : ""
          }${changePercent.toFixed(2)}%`,
          isUp: change > 0,
          isDown: change < 0,
          history: closePrices.map((p: number) => ({ value: p })),
        };
      } catch (error) {
        console.error(`Error fetching ${name}:`, error);
        return null;
      }
    })
  );

  const filteredResults = results.filter((item): item is any => item !== null);

  // 2. 환율 값 찾기
  const exchangeRateItem = filteredResults.find((r) => r.symbol === "USDKRW=X");
  const exchangeRate = exchangeRateItem
    ? exchangeRateItem.currentPriceNumeric
    : null;

  // 3. 달러 표시 지표들에 원화 환산 가격 추가
  return filteredResults.map((item) => {
    const { symbol, currentPriceNumeric, ...rest } = item;
    let krwValue;

    // 비트코인(BTC-USD)만 원화 환산 가격 추가
    if (exchangeRate && symbol === "BTC-USD") {
      const converted = currentPriceNumeric * exchangeRate;
      krwValue = converted.toLocaleString("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
      });
    }

    return {
      ...rest,
      krwValue,
    };
  });
}
