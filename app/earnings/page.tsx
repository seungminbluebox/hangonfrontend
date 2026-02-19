import React from "react";
import { Metadata } from "next";
import { EarningsCalendar } from "../components/earnings/EarningsCalendar";
import { BackButton } from "../components/layout/BackButton";
import { Share2, Info, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "실적 캘린더 | Hang on!",
  description: "미국 및 한국 주요 기업들의 실적 발표 일정과 예상치 정보",
};

export const revalidate = 3600;

export default function EarningsPage() {
  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
        <BackButton />
        <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-xl w-fit">
          <Clock className="w-3 h-3 text-text-muted/40" />
          <span className="text-[10px] font-medium text-text-muted/50 tracking-tight">
            매일 오전 8~9시경 정기적으로 업데이트됩니다.
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-2xl mx-auto px-4">
        <EarningsCalendar />
      </div>
    </main>
  );
}
