import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 현재 주가를 조회하는 API
 * ?symbols=AAPL,005930.KS,MSFT 형식으로 요청
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");

    if (!symbolsParam) {
      return NextResponse.json(
        { error: "Missing symbols parameter" },
        { status: 400 },
      );
    }

    const symbols = symbolsParam.split(",").map((s) => s.trim());
    const prices: Record<
      string,
      { price: number | null; currency: string; error?: string }
    > = {};

    // 병렬로 주가 조회 (타임아웃 8초)
    const pricePromises = symbols.map(async (symbol) => {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 8000);

      try {
        // Yahoo Finance API (CORS Proxy 사용)
        const yahooUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`;

        const response = await fetch(proxyUrl, {
          signal: abortController.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          prices[symbol] = {
            price: null,
            currency:
              symbol.includes(".KS") || symbol.includes(".KQ") ? "KRW" : "USD",
            error: `HTTP ${response.status}`,
          };
          return;
        }

        const data = await response.json();
        const priceData = data.quoteSummary?.result?.[0]?.price;

        if (priceData?.regularMarketPrice) {
          prices[symbol] = {
            price: priceData.regularMarketPrice.raw || null,
            currency:
              priceData.currency ||
              (symbol.includes(".KS") || symbol.includes(".KQ")
                ? "KRW"
                : "USD"),
          };
        } else {
          prices[symbol] = {
            price: null,
            currency:
              symbol.includes(".KS") || symbol.includes(".KQ") ? "KRW" : "USD",
            error: "Price data not found",
          };
        }
      } catch (error) {
        clearTimeout(timeoutId);
        prices[symbol] = {
          price: null,
          currency:
            symbol.includes(".KS") || symbol.includes(".KQ") ? "KRW" : "USD",
          error:
            error instanceof Error
              ? error.message.substring(0, 50)
              : "Unknown error",
        };
      }
    });

    await Promise.all(pricePromises);

    return NextResponse.json(prices);
  } catch (error) {
    console.error("API error fetching stock prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock prices" },
      { status: 500 },
    );
  }
}
