import { DollarIndexTracker } from "../components/dollar-index/DollarIndexTracker";
import { BackButton } from "../components/layout/BackButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "달러 인덱스 (DXY) 리포트 | 한온",
  description:
    "글로벌 달러 가치 변동 추이와 AI 매크로 분석 리포트를 확인하세요.",
};

export default function DollarIndexPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-2 sm:px-8 pt-6 md:pt-32 pb-20">
        <BackButton />
        <DollarIndexTracker />
      </div>
    </main>
  );
}
