import { Navigation } from "../components/layout/Navigation";
import { NasdaqFuturesInfo } from "../components/nasdaq-futures/NasdaqFuturesInfo";
import { Metadata } from "next";
import { BackButton } from "../components/layout/BackButton";
import { getMarketData } from "../lib/market";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "나스닥 100 선물 리포트",
  description:
    "글로벌 시장의 온도계, 나스닥 100 선물 실시간 흐름과 기초 지식을 전해드립니다.",
};

export const revalidate = 3600;

export default async function NasdaqFuturesPage() {
  const marketData = await getMarketData(["나스닥"], true);
  const nasdaqFutures = marketData.find((m) => m.name === "나스닥");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 md:pt-32 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
          <BackButton />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-xl w-fit">
            <Clock className="w-3 h-3 text-text-muted/40" />
            <span className="text-[10px] font-medium text-text-muted/50 tracking-tight">
              실시간 데이터로 제공됩니다.
            </span>
          </div>
        </div>

        {!nasdaqFutures ? (
          <p className="text-foreground/50 font-bold">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        ) : (
          <NasdaqFuturesInfo data={nasdaqFutures} />
        )}
      </div>
    </main>
  );
}
