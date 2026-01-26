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
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-6 md:pt-32 pb-20">
        <BackButton />

        <InterestRateInfo initialData={rates} />
      </div>
    </main>
  );
}
