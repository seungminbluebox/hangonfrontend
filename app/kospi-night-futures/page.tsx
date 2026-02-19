import { KospiNightFuturesInfo } from "../components/kospi-futures/KospiNightFuturesInfo";
import { Metadata } from "next";
import { BackButton } from "../components/layout/BackButton";
import { getKospiNightFuturesData } from "@/lib/market-night-futures";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "코스피 야간선물",
  description:
    "밤사이의 시장 심리를 읽는 핵심 지표, 코스피 야간선물 실시간 지수와 추세를 제공합니다.",
  keywords: [
    "코스피 야간선물",
    "야선",
    "코스피 야선",
    "코스피 200 야간선물",
    "HangOn",
  ],
  openGraph: {
    title: "실시간 코스피 야간선물 | HangOn",
    description: "내일의 국장 방향을 미리 보는 야간 시장 심리 분석.",
    type: "website",
  },
};

export const revalidate = 3600;

export default async function KospiNightFuturesPage() {
  const nightFutures = await getKospiNightFuturesData();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 md:pt-32 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
          <BackButton />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-xl w-fit">
            <Clock className="w-3 h-3 text-text-muted/40" />
            <span className="text-[10px] font-medium text-text-muted/50 tracking-tight">
              실시간 데이터로 제공됩니다 (야간 개장 시간 기준)
            </span>
          </div>
        </div>

        {!nightFutures ? (
          <p className="text-foreground/50 font-bold">
            야간선물 데이터를 불러오는 중 오류가 발생했습니다. (현재 거래 시간이
            아닐 수 있습니다)
          </p>
        ) : (
          <KospiNightFuturesInfo data={nightFutures} />
        )}
      </div>
    </main>
  );
}
