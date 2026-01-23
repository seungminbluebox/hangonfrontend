import { Navigation } from "../components/layout/Navigation";
import { KospiFuturesInfo } from "../components/kospi-futures/KospiFuturesInfo";
import { Metadata } from "next";
import { BackButton } from "../components/layout/BackButton";
import { getMarketData } from "../lib/market";

export const metadata: Metadata = {
  title: "코스피 200 선물 리포트 | Hang on!",
  description:
    "국내 시장의 선행지표, 코스피 200 선물 실시간 흐름과 시장 통찰을 제공합니다.",
};

export default async function KospiFuturesPage() {
  const marketData = await getMarketData();
  const kospiFutures = marketData.find((m) => m.name === "코스피 200 선물");

  if (!kospiFutures) {
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
              국내 마켓 인사이트
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.9]">
            KOSPI 200{" "}
            <span className="text-accent font-serif lowercase tracking-normal">
              futures
            </span>
          </h1>
          <p className="mt-4 text-foreground/60 font-bold max-w-xl leading-relaxed">
            코스피 200 선물은 국내 시장의 향방을 가장 먼저 투영합니다. 외국인과
            기관의 치열한 수싸움이 벌어지는 선물의 흐름을 통해 내일의 시장을
            준비하세요.
          </p>
        </header>

        <KospiFuturesInfo data={kospiFutures} />
      </div>
    </main>
  );
}
