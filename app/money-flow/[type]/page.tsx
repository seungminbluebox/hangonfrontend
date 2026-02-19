import React from "react";
import { Navigation } from "../../components/layout/Navigation";
import { MoneyFlowTracker } from "../../components/money-flow/MoneyFlowTracker";
import { Target, Clock } from "lucide-react";
import { BackButton } from "../../components/layout/BackButton";
import { Metadata } from "next";

type Props = {
  params: Promise<{ type: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;

  const titles: Record<string, string> = {
    domestic: "국내 시장 자금 흐름",
    us: "미국 시장 자금 흐름",
    safe: "안전자산 자금 흐름",
  };

  const descriptions: Record<string, string> = {
    domestic:
      "국내 주식 시장의 주요 섹터별 자금 유입 및 유출 현황을 분석합니다.",
    us: "미국 증시의 주요 지수 및 섹터로의 자금 흐름을 실시간으로 확인하세요.",
    safe: "금, 채권, 달러 등 안전자산으로의 자금 대피 현황을 파악하여 리스크에 대비하세요.",
  };

  const title = titles[type] || "시장 자금 흐름 분석";
  const description =
    descriptions[type] || "글로벌 자산 시장의 자금 이동 경로를 추적합니다.";

  return {
    title,
    description,
  };
}

export const revalidate = 3600;

export default async function MoneyFlowDetailPage({ params }: Props) {
  const { type } = await params;

  const typeMap: Record<string, "domestic" | "us" | "safe"> = {
    domestic: "domestic",
    us: "us",
    safe: "safe",
  };

  const selectedType = typeMap[type] || "domestic";

  const updateMessage = {
    domestic: "한국 정규시장 마감 이후 업데이트 (약 오후 4~5시)",
    us: "미국 정규시장 마감 이후 업데이트 (약 오전 7~8시)",
    safe: "미국 정규시장 마감 이후 업데이트 (약 오전 7~8시)",
  }[selectedType];

  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-4xl mx-auto px-2 md:px-6 pt-6 md:pt-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
          <BackButton />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-xl w-fit">
            <Clock className="w-3 h-3 text-text-muted/40" />
            <span className="text-[10px] font-medium text-text-muted/50 tracking-tight">
              {updateMessage}
            </span>
          </div>
        </div>

        <MoneyFlowTracker type={selectedType} />
      </div>
    </main>
  );
}
