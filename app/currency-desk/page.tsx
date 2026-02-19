import { Navigation } from "../components/layout/Navigation";
import { CurrencyDesk } from "../components/currency/CurrencyDesk";
import { Metadata } from "next";
import { BackButton } from "../components/layout/BackButton";
import { getMarketData } from "../lib/market";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "원/달러 환율 리포트",
  description:
    "실시간 달러 환율 현황 중계와 스마트한 달러 투자 전략을 확인하세요.",
};

// 1시간 주기로 정적 페이지 생성 (On-Demand로 백엔드에서 갱신 가능)
export const revalidate = 3600;

export default async function CurrencyDeskPage() {
  const marketData = await getMarketData(["원/달러 환율"], true);
  const usdData = marketData.find((m) => m.name === "원/달러 환율");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://hangon.co.kr",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "환율 데스크",
        item: "https://hangon.co.kr/currency-desk",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-2 sm:px-8 pt-6 md:pt-32 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
          <BackButton />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-xl w-fit">
            <Clock className="w-3 h-3 text-text-muted/40" />
            <span className="text-[10px] font-medium text-text-muted/50 tracking-tight">
              미국 정규시장 마감 이후 업데이트 (약 오전 7~8시)
            </span>
          </div>
        </div>

        <CurrencyDesk liveData={usdData} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
