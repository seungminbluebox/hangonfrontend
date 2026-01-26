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
  const marketData = await getMarketData(["코스피 200 선물"], true);
  const kospiFutures = marketData.find((m) => m.name === "코스피 200 선물");

  if (!kospiFutures) {
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

        <KospiFuturesInfo data={kospiFutures} />
      </div>
    </main>
  );
}
