import React from "react";
import { Metadata } from "next";
import { EarningsCalendar } from "../components/earnings/EarningsCalendar";
import { BackButton } from "../components/layout/BackButton";
import { Share2, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "실적 캘린더 | Hang on!",
  description: "미국 및 한국 주요 기업들의 실적 발표 일정과 예상치 정보",
};

export default function EarningsPage() {
  return (
    <main className="min-h-screen pb-20">
      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 mt-8">
        <EarningsCalendar />
      </div>
    </main>
  );
}
