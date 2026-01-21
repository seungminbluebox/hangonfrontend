import { FearGreedIndex } from "../components/fear-greed/FearGreedIndex";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "공포와 탐욕 지수 AI 분석",
  description:
    "CNN Fear & Greed Index를 바탕으로 한 AI 시장 심리 분석 리포트입니다.",
};

export default function FearGreedPage() {
  return (
    <main className="min-h-screen bg-background text-foreground max-w-6xl mx-auto px-4 sm:px-8 pb-20">
      <div className="pt-8 sm:pt-16 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Back to Dashboard
          </span>
        </Link>
      </div>

      <div className="pt-2 sm:pt-5">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter italic">
            Fear <span className="text-accent">&</span> Greed
          </h1>
        </header>

        <FearGreedIndex />

        {/* 설명 섹션을 하단으로 이동 */}
        <div className="mt-5 pt-10 border-t border-border-subtle/50">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <h2 className="text-sm font-black uppercase tracking-widest text-text-muted">
              지수 가이드
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-text-muted text-base font-medium leading-relaxed">
                공포와 탐욕 지수(Fear & Greed Index)는 시장의 변동성, 주가 강도,
                거래량 등 여러 지표를 종합하여 투자자들의 심리 상태를
                나타냅니다.
              </p>
              <p className="text-text-muted text-base font-medium leading-relaxed italic">
                "남들이 탐욕스러워할 때 두려워하고, 남들이 두려워할 때
                탐욕스러워져라." — 워런 버핏
              </p>
            </div>
            <div className="bg-secondary/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-red-500">0 - 25: 극도의 공포</span>
                  <span className="text-text-muted">
                    시장 투매 및 저평가 구간
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-orange-500">26 - 45: 공포</span>
                  <span className="text-text-muted">투자 심리 위축 단계</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-yellow-500">46 - 55: 중립</span>
                  <span className="text-text-muted">방향성 탐색 구간</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-500">56 - 75: 탐욕</span>
                  <span className="text-text-muted">
                    투자 심리 개선 및 상승 단계
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-green-500">76 - 100: 극도의 탐욕</span>
                  <span className="text-text-muted">
                    시장 과열 및 고평가 주의
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
