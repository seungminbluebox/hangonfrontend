import React from "react";
import { Metadata } from "next";
import { MarketHolidays } from "../components/holidays/MarketHolidays";
import { BackButton } from "../components/layout/BackButton";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "휴장 일정 | Hang on!",
  description: "한국 및 미국 증시 휴장일 및 조기 종료 일정 안내",
};

export const revalidate = 86400; // 휴장일은 하루 단위로 갱신해도 충분

export default function MarketHolidaysPage() {
  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6 md:pt-32">
        <div className="mb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <BackButton />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-xl w-fit">
            <Clock className="w-3 h-3 text-text-muted/40" />
            <span className="text-[10px] font-medium text-text-muted/50 tracking-tight">
              매월 1일경 정기적으로 갱신됩니다.
            </span>
          </div>
        </div>
        <MarketHolidays />
      </div>
    </main>
  );
}
