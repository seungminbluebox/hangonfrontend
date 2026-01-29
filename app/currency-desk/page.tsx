import { Navigation } from "../components/layout/Navigation";
import { CurrencyDesk } from "../components/currency/CurrencyDesk";
import { Metadata } from "next";
import { BackButton } from "../components/layout/BackButton";
import { getMarketData } from "../lib/market";

export const metadata: Metadata = {
  title: "원/달러 환율 리포트",
  description:
    "실시간 달러 환율 현황 중계와 AI가 분석하는 스마트한 달러 투자 전략을 확인하세요.",
};

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
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 md:pt-32 pb-20">
        <BackButton />

        <CurrencyDesk liveData={usdData} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
