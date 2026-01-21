import { Navigation } from "../components/layout/Navigation";
import { InterestRateInfo } from "../components/interest-rate/InterestRateInfo";
import { Metadata } from "next";
import { BackButton } from "../components/layout/BackButton";
import { getInterestRates } from "../lib/rates";

export const metadata: Metadata = {
  title: "한·미 금리 정보 | Hang on!",
  description:
    "한국과 미국의 기준금리 현황과 금리에 대한 기본 지식을 전해드립니다.",
};

export default async function InterestRatePage() {
  const rates = await getInterestRates();

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-6 md:pt-32 pb-20">
        <BackButton />

        <header className="mb-10 md:mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[2px] w-8 bg-emerald-500 rounded-full" />
            <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">
              금리 지식 베이스
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.9]">
            INTEREST{" "}
            <span className="text-emerald-500 font-serif lowercase tracking-normal">
              rate
            </span>
          </h1>
          <p className="mt-4 text-foreground/60 font-bold max-w-xl leading-relaxed">
            금리는 돈의 가치를 결정하는 가장 중요한 지표입니다. 한국과 미국의
            현재 금리 현황을 비교하고, 금리가 경제에 미치는 영향에 대한 기초
            지식을 알아보세요.
          </p>
        </header>

        <InterestRateInfo initialData={rates} />
      </div>
    </main>
  );
}
