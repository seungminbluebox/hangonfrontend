import React from "react";
import { Navigation } from "../../components/layout/Navigation";
import { MoneyFlowTracker } from "../../components/money-flow/MoneyFlowTracker";
import { Target } from "lucide-react";
import { BackButton } from "../../components/layout/BackButton";

export default async function MoneyFlowDetailPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  const typeMap: Record<string, "domestic" | "us" | "safe"> = {
    domestic: "domestic",
    us: "us",
    safe: "safe",
  };

  const selectedType = typeMap[type] || "domestic";
  const titleMap = {
    domestic: "국내 증시 자금흐름",
    us: "미국 증시 자금흐름",
    safe: "안전자산 자금흐름",
  };

  const descMap = {
    domestic: "국내 주요 지수와 섹터별 자금 유입 현황을 분석합니다.",
    us: "미국 시장의 주요 지수와 섹터별 트렌드를 추적합니다.",
    safe: "금, 채권, 달러 등 글로벌 안전자산의 자금 흐름을 모니터링합니다.",
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 md:pt-32 space-y-8 md:space-y-12">
        <BackButton />
        {/* Page Header */}
        <div className="space-y-3 md:space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-accent/10 border border-accent/20 text-accent mb-2">
            <Target className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
              Money Flow Insight
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter">
            {titleMap[selectedType].split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-accent">
              {titleMap[selectedType].split(" ").slice(-1)}
            </span>
          </h1>
          <p className="text-sm md:text-base text-foreground/50 font-bold max-w-lg mx-auto leading-relaxed px-4">
            {descMap[selectedType]}
          </p>
        </div>

        <MoneyFlowTracker type={selectedType} />
      </div>
    </main>
  );
}
