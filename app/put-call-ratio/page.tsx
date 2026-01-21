import React from "react";
import { Navigation } from "../components/layout/Navigation";
import { BackButton } from "../components/layout/BackButton";
import { BarChart3 } from "lucide-react";
import { PutCallRatioTracker } from "@/app/components/put-call-ratio/PutCallRatioTracker";

export default function PutCallRatioPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 md:pt-32 space-y-8 md:space-y-12">
        <BackButton />

        {/* Page Header */}
        <div className="space-y-3 md:space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-accent/10 border border-accent/20 text-accent mb-2">
            <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
              Market Sentiment PCR
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter">
            미국 증시 <span className="text-accent">풋/콜 옵션 지표</span>
          </h1>
          <p className="text-sm md:text-base text-foreground/50 font-bold max-w-lg mx-auto leading-relaxed px-4">
            CBOE 풋/콜 비율(Put/Call Ratio)을 통해 글로벌 투자자들의
            <br />
            실제 매매 심리와 시장의 바닥/고점을 포착합니다.
          </p>
        </div>

        {/* Content Wrapper */}
        <PutCallRatioTracker />

        {/* Educational Content */}
        <div className="mt-12 space-y-8">
          <div className="bg-card/30 border border-border-subtle rounded-[2.5rem] p-8 md:p-12">
            <h3 className="text-xl font-black italic mb-6">지표 읽는 법</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  <span className="font-extrabold uppercase tracking-widest text-xs">
                    Extreme Fear (Over 1.0)
                  </span>
                </div>
                <p className="text-sm text-foreground/70 font-bold leading-relaxed">
                  풋 옵션(하락 배팅)이 콜 옵션(상승 배팅)보다 훨씬 많을
                  때입니다. 대중이 공포에 질려 있으며, 종종 시장의 바닥 신호로
                  해석됩니다.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  <span className="font-extrabold uppercase tracking-widest text-xs">
                    Extreme Greed (Under 0.7)
                  </span>
                </div>
                <p className="text-sm text-foreground/70 font-bold leading-relaxed">
                  콜 옵션이 풋 옵션에 비해 압도적으로 많을 때입니다. 시장이
                  과열되었음을 의미하며, 단기 고점 신호로 주의가 필요합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
