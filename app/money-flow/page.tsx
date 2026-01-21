import React from "react";
import { Navigation } from "../components/layout/Navigation";
import { MoneyFlowTracker } from "../components/money-flow/MoneyFlowTracker";
import { Target } from "lucide-react";
import { BackButton } from "../components/layout/BackButton";
import { ArrowRightLeft } from "lucide-react";

export default function MoneyFlowPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 md:pt-32 space-y-8 md:space-y-12">
        <BackButton />
        {/* Page Header */}
        <div className="space-y-3 md:space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-accent/10 border border-accent/20 text-accent mb-2">
            <Target className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
              Money Flow Insight
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter">
            자금 흐름 <span className="text-accent">네비게이터</span>
          </h1>
          <p className="text-sm md:text-base text-foreground/50 font-bold max-w-lg mx-auto leading-relaxed px-4">
            전 세계 자산군부터 국내 세부 섹터까지,
            <br />
            진짜 돈이 어디로 쏠리고 있는지 스마트하게 추적합니다.
          </p>
        </div>

        {/* Content */}
        <MoneyFlowTracker />

        {/* Technical Guide Section */}
        <div className="bg-card/30 border border-border-subtle rounded-[2.5rem] p-10 mt-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />

          <h3 className="text-xl font-black italic mb-8 relative z-10 flex items-center gap-3">
            <ArrowRightLeft className="w-5 h-5 text-accent" />
            어떻게 측정하나요?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            <div className="space-y-4">
              <h4 className="text-sm font-black text-accent uppercase tracking-widest">
                분석 데이터 소스
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-1.5 shrink-0" />
                  <p className="text-sm font-medium text-foreground/70 leading-relaxed">
                    <strong>Global Asset:</strong> 주식(S&P500), 안전자산(금,
                    달러), 금리(미 10년물) 등 주요 지표를 실시간 추적합니다.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-1.5 shrink-0" />
                  <p className="text-sm font-medium text-foreground/70 leading-relaxed">
                    <strong>K-Sector Flow:</strong> 국내 주요 산업군(반도체,
                    바이오, 이차전지 등)의 대표 ETF 거래대금을 분석합니다.
                  </p>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-accent uppercase tracking-widest">
                핵심 지표: 상대 거래량
              </h4>
              <p className="text-sm font-medium text-foreground/70 leading-relaxed">
                단순한 가격 변화보다 <strong>거래량의 변화</strong>가 더
                중요합니다. 20일 평균 거래량 대비 현재의 비율(Rel Vol)이
                높을수록, 시장 참여자들의 실제 자금이 해당 자산으로 집중되고
                있음을 의미합니다.
              </p>
              <p className="text-xs font-bold text-foreground/40 bg-foreground/5 p-3 rounded-xl italic">
                "가격은 거짓말을 할 수 있어도, 거래량은 시장의 진심을
                보여줍니다."
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
