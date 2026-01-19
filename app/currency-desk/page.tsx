import { Navigation } from "../components/Navigation";
import { CurrencyDesk } from "../components/CurrencyDesk";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "환율분석 데스크 | Hang on!",
  description:
    "실시간 환율 현황 중계와 AI가 제안하는 스마트한 환전 전략을 확인하세요.",
};

export default function CurrencyDeskPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-24 md:pt-32 pb-20">
        <header className="mb-10 md:mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[2px] w-8 bg-blue-500 rounded-full" />
            <span className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">
              Currency Report
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            환율분석 <span className="text-blue-500 italic">데스크</span>
          </h1>
          <p className="mt-4 text-text-muted font-bold text-lg md:text-xl max-w-2xl leading-relaxed">
            환전 타이밍, 고민되시나요? 지금 가장 유리한 환전 전략을 데이터로
            읽어드립니다.
          </p>
        </header>

        <CurrencyDesk />
      </div>
    </main>
  );
}
