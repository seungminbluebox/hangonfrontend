import { FearGreedIndex } from "../components/fear-greed/FearGreedIndex";
import { Metadata } from "next";
import { BackButton } from "../components/layout/BackButton";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "코스피 공포와 탐욕 지수 분석",
  description: "코스피 지표를 바탕으로 산출된 시장 심리 분석 리포트입니다.",
};

export default function KospiFearGreedPage() {
  return (
    <main className="min-h-screen bg-background text-foreground max-w-6xl mx-auto px-2 sm:px-8 pb-20">
      <div className="pt-6 md:pt-32 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
        <BackButton />
        <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-xl w-fit">
          <Clock className="w-3 h-3 text-text-muted/40" />
          <span className="text-[10px] font-medium text-text-muted/50 tracking-tight">
            한국 정규시장 마감 이후 업데이트 (약 오후 4~5시)
          </span>
        </div>
      </div>

      <div className="pt-0">
        <FearGreedIndex type="kospi" />

        <div className="mt-5 pt-10 border-t border-border-subtle/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* 좌측: 지수 설명 및 공식 */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-text-muted">
                    산출 공식 및 차별점
                  </h2>
                </div>
                <p className="text-foreground/80 text-base font-bold leading-relaxed">
                  Hang on 코스피 공탐지수는 미국 CNN Business의 7대 지표 산출
                  방식을 <span className="text-accent">한국 시장(KOSPI)</span>에
                  맞게 로컬라이징하여 계산됩니다.
                </p>
                <div className="bg-card/50 border border-border-subtle rounded-3xl p-6 font-mono text-[13px] text-text-muted leading-relaxed">
                  <div className="text-accent font-bold mb-2">
                    Y (Index) = Σ (X₁ ~ X₇) / 7
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                    <li>X₁: 주가 모멘텀 (Market Momentum)</li>
                    <li>X₂: 주가 강도 (Stock Price Strength)</li>
                    <li>X₃: 시장 폭 (Stock Price Breadth)</li>
                    <li>X₄: 옵션 수요 (Put and Call Options)</li>
                    <li>X₅: 정크본드 수요 (Safe Haven)</li>
                    <li>X₆: 시장 변동성 (Market Volatility)</li>
                    <li>X₇: 안전자산 선호 (Demand Junk Bond Demand)</li>
                  </ul>
                </div>
                <p className="text-text-muted text-sm font-medium leading-relaxed">
                  단순히 미국 지수를 추종하는 것이 아니라, 국내 증시만의 특수한
                  변동성 지표인 <span className="font-bold">VKOSPI</span>와
                  국고채 금리 차이를 반영하여{" "}
                  <span className="text-foreground font-bold">
                    '국장(국내증시)'의 실제 체감 심리
                  </span>
                  를 가장 정확하게 포착하도록 설계되었습니다.
                </p>
              </div>
            </div>

            {/* 우측: 단계별 가이드 */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <h2 className="text-sm font-black uppercase tracking-widest text-text-muted">
                  단계별 가이드
                </h2>
              </div>
              <div className="bg-secondary/10 rounded-[2rem] p-6 border border-border-subtle/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-red-500">0 - 25: 극도의 공포</span>
                    <span className="text-text-muted">과매도/투매</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-orange-500">26 - 45: 공포</span>
                    <span className="text-text-muted">심리 위축</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-yellow-500">46 - 55: 중립</span>
                    <span className="text-text-muted">방향성 탐색</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-500">56 - 75: 탐욕</span>
                    <span className="text-text-muted">심리 개선</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-green-500">
                      76 - 100: 극도의 탐욕
                    </span>
                    <span className="text-text-muted">과열 주의</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
