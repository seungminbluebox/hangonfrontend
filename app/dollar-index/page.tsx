import { DollarIndexTracker } from "../components/dollar-index/DollarIndexTracker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "달러 인덱스 (DXY) 리포트 | 한온",
  description:
    "글로벌 달러 가치 변동 추이와 AI 매크로 분석 리포트를 확인하세요.",
};

export default function DollarIndexPage() {
  return (
    <main className="container mx-auto px-1 py-8">
      <DollarIndexTracker />
    </main>
  );
}
