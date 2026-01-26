import { Navigation } from "../components/layout/Navigation";
import { NasdaqFuturesInfo } from "../components/nasdaq-futures/NasdaqFuturesInfo";
import { Metadata } from "next";
import { BackButton } from "../components/layout/BackButton";
import { getMarketData } from "../lib/market";

export const metadata: Metadata = {
  title: "나스닥 100 선물 리포트 | Hang on!",
  description:
    "글로벌 시장의 온도계, 나스닥 100 선물 실시간 흐름과 기초 지식을 전해드립니다.",
};

export default async function NasdaqFuturesPage() {
  const marketData = await getMarketData(["나스닥"], true);
  const nasdaqFutures = marketData.find((m) => m.name === "나스닥");

  if (!nasdaqFutures) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 md:pt-32 pb-20">
          <BackButton />
          <p className="text-foreground/50 font-bold">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 md:pt-32 pb-20">
        <BackButton />

        <NasdaqFuturesInfo data={nasdaqFutures} />
      </div>
    </main>
  );
}
