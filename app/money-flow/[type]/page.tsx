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
    safe: "글로벌 자금심리",
  };

  const descMap = {
    domestic: "국내 주요 지수와 섹터별 자금 유입 현황을 분석합니다.",
    us: "미국 시장의 주요 지수와 섹터별 트렌드를 추적합니다.",
    safe: "현제 국제 시장 상황의 위험자산 vs 안전자산 선호도를 분석합니다.",
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 md:pt-32 space-y-8 md:space-y-12">
        <BackButton />

        <MoneyFlowTracker type={selectedType} />
      </div>
    </main>
  );
}
