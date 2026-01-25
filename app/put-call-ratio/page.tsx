import React from "react";
import { Navigation } from "../components/layout/Navigation";
import { BackButton } from "../components/layout/BackButton";
import { BarChart3, Library, Target } from "lucide-react";
import { PutCallRatioTracker } from "@/app/components/put-call-ratio/PutCallRatioTracker";

export default function PutCallRatioPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 md:pt-32 space-y-8 md:space-y-12">
        <BackButton />

        {/* Page Header */}
        <div className="space-y-6 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />

          {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent/5 border border-accent/10 text-accent mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
              Market Sentiment Intelligence
            </span>
          </div> */}

          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-none">
              <span className="text-foreground/20">미국 증시</span>
              <br />
              <span className="text-accent">풋/콜 분석 리포트</span>
            </h1>
            <p className="text-sm md:text-lg text-foreground/50 font-bold max-w-2xl mx-auto leading-relaxed px-4">
              미국 증시의 실시간 옵션 매매 실태를 분석하여
              <br />
              <span className="text-foreground/80">
                시장의 저점 매수 기회와 고점 경고 신호
              </span>
              를 포착합니다.
            </p>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="relative">
          <PutCallRatioTracker market="US" />
        </div>

        {/* Educational Content */}
        <div className="mt-24 space-y-12">
          <div className="relative overflow-hidden bg-card/30 border border-border-subtle rounded-[3rem] p-8 md:p-16">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] rotate-12">
              <BarChart3 className="w-64 h-64" />
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-black italic mb-10 flex items-center gap-3">
                <span className="text-accent">Tip. </span> 지표 읽는 법
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="group space-y-4">
                  <div className="flex items-center gap-3 text-red-400">
                    <div className="w-10 h-1 bg-current rounded-full" />
                    <span className="font-extrabold uppercase tracking-widest text-sm">
                      Extreme Fear (1.0 이상)
                    </span>
                  </div>
                  <p className="text-base text-foreground/70 font-bold leading-relaxed ">
                    풋 옵션(하락 배팅)이 콜 옵션을 압도하는 구간입니다.
                    <br className="hidden md:block" />
                    대중의 공포가 극에 달했을 때이며, 경험적으로{" "}
                    <span className="text-red-400">강력한 바닥 신호</span>로
                    간주됩니다.
                  </p>
                </div>

                <div className="group space-y-4">
                  <div className="flex items-center gap-3 text-green-400">
                    <div className="w-10 h-1 bg-current rounded-full" />
                    <span className="font-extrabold uppercase tracking-widest text-sm">
                      Extreme Greed (0.7 이하)
                    </span>
                  </div>
                  <p className="text-base text-foreground/70 font-bold leading-relaxed ">
                    콜 옵션(상승 배팅) 투기가 과열된 상태입니다.
                    <br className="hidden md:block" />
                    시장에 낙관론이 팽배하여{" "}
                    <span className="text-green-400">
                      단기 조정이나 고점 형성
                    </span>
                    의 가능성이 높은 구간입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "역발상 지표",
                desc: "PCR은 대표적인 역발상(Contrarian) 지표로, 대중과 반대로 행동할 때의 기회를 보여줍니다.",
                icon: "🎯",
              },
              {
                title: "시장 심리 파악",
                desc: "단순한 가격 흐름을 넘어, 실제 자금이 어디로 베팅되고 있는지 심층적인 데이터를 제공합니다.",
                icon: "📊",
              },
              {
                title: "활용 팁",
                desc: "지표가 극단값에 도달한 후 꺾이기 시작할 때가 종종 더 명확한 매매 타이밍이 됩니다.",
                icon: "💡",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card/20 border border-border-subtle p-8 rounded-[2rem] space-y-4 hover:bg-card/40 transition-colors"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h4 className="text-lg font-black italic">{item.title}</h4>
                <p className="text-sm text-foreground/50 font-bold leading-relaxed">
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
