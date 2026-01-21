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
  const marketData = await getMarketData();
  const nasdaqFutures = marketData.find((m) => m.name === "나스닥 선물");

  if (!nasdaqFutures) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-24 md:pt-32 pb-20">
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
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-24 md:pt-32 pb-20">
        <BackButton />

        <header className="mb-10 md:mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[2px] w-8 bg-accent rounded-full" />
            <span className="text-xs font-black text-accent uppercase tracking-[0.3em]">
              마켓 인사이트
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.9]">
            NASDAQ 100{" "}
            <span className="text-accent font-serif lowercase tracking-normal">
              futures
            </span>
          </h1>
          <p className="mt-4 text-foreground/60 font-bold max-w-xl leading-relaxed">
            나스닥 선물은 기술 혁신의 심장 박동과 같습니다. 24시간 움직이는
            선물의 흐름을 통해 글로벌 자본의 심도 있는 움직임을 파악해보세요.
          </p>
        </header>

        <NasdaqFuturesInfo data={nasdaqFutures} />
      </div>
    </main>
  );
}
