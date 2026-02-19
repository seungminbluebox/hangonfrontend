import { Navigation } from "../components/layout/Navigation";
import { InterestRateInfo } from "../components/interest-rate/InterestRateInfo";
import { Metadata } from "next";
import { BackButton } from "../components/layout/BackButton";
import { getInterestRates } from "../lib/rates";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "한·미 금리 정보",
  description:
    "한국과 미국의 기준금리 현황과 금리에 대한 기본 지식을 전해드립니다.",
};

export const revalidate = 3600;

export default async function InterestRatePage() {
  const rates = await getInterestRates();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-6 md:pt-32 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
          <BackButton />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-xl w-fit">
            <Clock className="w-3 h-3 text-text-muted/40" />
            <span className="text-[10px] font-medium text-text-muted/50 tracking-tight">
              미국 정규시장 마감 이후 업데이트 (약 오전 7~8시)
            </span>
          </div>
        </div>

        <InterestRateInfo initialData={rates} />
      </div>
    </main>
  );
}
