import { DollarIndexTracker } from "../components/dollar-index/DollarIndexTracker";
import { BackButton } from "../components/layout/BackButton";
import { Metadata } from "next";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "달러 인덱스 (DXY) 리포트 | 한온",
  description:
    "글로벌 달러 가치 변동 추이와 AI 매크로 분석 리포트를 확인하세요.",
};

export const revalidate = 3600;

export default function DollarIndexPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-2 sm:px-8 pt-6 md:pt-32 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
          <BackButton />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-xl w-fit">
            <Clock className="w-3 h-3 text-text-muted/40" />
            <span className="text-[10px] font-medium text-text-muted/50 tracking-tight">
              미국 정규시장 마감 이후 업데이트 (약 오전 7~8시)
            </span>
          </div>
        </div>
        <DollarIndexTracker />
      </div>
    </main>
  );
}
