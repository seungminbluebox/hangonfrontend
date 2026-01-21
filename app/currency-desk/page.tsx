import { Navigation } from "../components/layout/Navigation";
import { CurrencyDesk } from "../components/currency/CurrencyDesk";
import { Metadata } from "next";
import { getMarketData } from "../lib/market";

export const metadata: Metadata = {
  title: "원/달러 환율 리포트 | Hang on!",
  description:
    "실시간 달러 환율 현황 중계와 AI가 분석하는 스마트한 달러 투자 전략을 확인하세요.",
};

export default async function CurrencyDeskPage() {
  const marketData = await getMarketData();
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
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-24 md:pt-32 pb-20">
        <header className="mb-10 md:mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[2px] w-8 bg-blue-500 rounded-full" />
            <span className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">
              환율 데스크
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.9]">
            USD<span className="text-blue-500">/KRW</span>
          </h1>
          <p className="mt-4 text-text-muted font-bold max-w-lg leading-relaxed">
            원/달러 환율의 흐름을 추적하여 실시간 현황을 중계하고, 환율 분석
            리포트를 제공합니다.
          </p>
        </header>

        <CurrencyDesk liveData={usdData} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
