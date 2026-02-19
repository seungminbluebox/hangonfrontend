import React from "react";
import { Navigation } from "../components/layout/Navigation";
import { BackButton } from "../components/layout/BackButton";
import { BarChart3, Library, Target, Clock } from "lucide-react";
import { PutCallRatioTracker } from "@/app/components/put-call-ratio/PutCallRatioTracker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "풋/콜 옵션 비율(PCR)",
  description:
    "시장의 심리를 가장 빠르게 반영하는 풋/콜 옵션 비율을 확인하세요. 투자자들의 베팅 방향을 통해 향후 주가 방향을 예측합니다.",
};

export const revalidate = 3600;

export default function PutCallRatioPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-4xl mx-auto px-2 md:px-6 pt-6 md:pt-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
          <BackButton />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-xl w-fit">
            <Clock className="w-3 h-3 text-text-muted/40" />
            <span className="text-[10px] font-medium text-text-muted/50 tracking-tight">
              미국 정규시장 마감 이후 업데이트 (약 오후 4~5시)
            </span>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="relative">
          <PutCallRatioTracker market="US" />
        </div>
      </div>
    </main>
  );
}
