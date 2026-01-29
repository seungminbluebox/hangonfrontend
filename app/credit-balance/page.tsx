import React from "react";
import { Navigation } from "../components/layout/Navigation";
import { BackButton } from "../components/layout/BackButton";
import { BarChart3 } from "lucide-react";
import { CreditBalanceTracker } from "@/app/components/credit-balance/CreditBalanceTracker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "신용융자 잔고 추이",
  description:
    "국내 증시의 빚투 현황을 분석합니다. 신용융자 잔고의 증감 수치를 통해 시장의 과열과 공포를 읽어보세요.",
};

export default function CreditBalancePage() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 md:pt-32 space-y-8 md:space-y-12">
        <BackButton />

        {/* Content Wrapper */}
        <div className="relative">
          <CreditBalanceTracker />
        </div>

        {/* Educational Content */}
        <div className="mt-24 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "수급의 선행 지표",
                desc: "신용잔고는 기관/외인보다 개인의 심리를 직접적으로 보여주는 강력한 선행 지표입니다.",
                icon: "🎯",
              },
              {
                title: "반대매매 리스크",
                desc: "지수가 급락할 때 발생하는 반대매매는 추가 하락을 부채질하므로 항시 체크가 필요합니다.",
                icon: "⚠️",
              },
              {
                title: "고객예탁금의 조화",
                desc: "단순 잔고보다 예탁금 대비 신용 비중이 높을수록 실질적인 위험도가 높다고 판단합니다.",
                icon: "⚖️",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-[2rem] bg-card/10 border border-border-subtle flex flex-col items-center text-center space-y-4"
              >
                <div className="text-4xl">{item.icon}</div>
                <h4 className="text-sm font-black uppercase tracking-widest italic tracking-tighter">
                  {item.title}
                </h4>
                <p className="text-xs font-bold text-foreground/40 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
