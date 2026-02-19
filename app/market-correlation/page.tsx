import React from "react";
import { Navigation } from "../components/layout/Navigation";
import { BackButton } from "../components/layout/BackButton";
import { Link as LinkIcon, Clock } from "lucide-react";
import { MarketCorrelationTracker } from "@/app/components/market-correlation/MarketCorrelationTracker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "한-미 증시 동조화 분석 (Coupling)",
  description:
    "KOSPI와 S&P 500의 20일 이동 상관계수를 통해 시장이 미국 증시를 따라가는지(커플링), 아니면 독자적으로 움직이는지(디커플링) 분석합니다.",
};

export const revalidate = 3600;

export default function MarketCorrelationPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-4xl mx-auto px-2 md:px-6 pt-6 md:pt-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
          <BackButton />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-xl w-fit">
            <Clock className="w-3 h-3 text-text-muted/40" />
            <span className="text-[10px] font-medium text-text-muted/50 tracking-tight">
              한국 정규시장 개장 전 업데이트 (약 오전 8~9시)
            </span>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="relative">
          <MarketCorrelationTracker />
        </div>

        {/* Educational Content */}
        <div className="mt-24 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "상관계수란?",
                desc: "+1에 가까울수록 미국과 똑같이 움직이고, 0에 가까우면 아무 상관이 없으며, -1에 가까우면 정반대로 움직임을 뜻합니다.",
                icon: "📈",
              },
              {
                title: "커플링 (Coupling)",
                desc: "보통 0.5 이상의 높은 상관계수를 보일 때 '동조화'되었다고 하며, 해외 증시의 영향력이 매우 클 때 나타납니다.",
                icon: "🔗",
              },
              {
                title: "디커플링 (Decoupling)",
                desc: "상관계수가 낮아지면 한국 증시만의 개별 호재나 악재(금투세, 실적 등)가 더 강하게 작용하고 있음을 시사합니다.",
                icon: "✂️",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-card/10 border border-border-subtle flex flex-row md:flex-col items-center md:text-center gap-4 md:space-y-4"
              >
                <div className="text-2xl md:text-4xl shrink-0">{item.icon}</div>
                <div className="flex flex-col items-start md:items-center">
                  <h4 className="text-[11px] md:text-sm font-black uppercase tracking-widest italic md:tracking-tighter">
                    {item.title}
                  </h4>
                  <p className="text-[10px] md:text-xs font-bold text-foreground/40 leading-relaxed mt-1 md:mt-0">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
