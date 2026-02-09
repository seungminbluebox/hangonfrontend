import React from "react";
import { Metadata } from "next";
import { MarketHolidays } from "../components/holidays/MarketHolidays";
import { BackButton } from "../components/layout/BackButton";

export const metadata: Metadata = {
  title: "휴장 일정 | Hang on!",
  description: "한국 및 미국 증시 휴장일 및 조기 종료 일정 안내",
};

export default function MarketHolidaysPage() {
  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 mt-8">
        <div className="mb-6">
          <BackButton />
        </div>
        <MarketHolidays />
      </div>
    </main>
  );
}
