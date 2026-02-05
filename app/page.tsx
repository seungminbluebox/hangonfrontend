import { supabase } from "@/lib/supabase";
import { DateNavigation } from "./components/layout/DateNavigation";
import { NewsDashboard } from "./components/news/NewsDashboard";
import { MarketTicker } from "./components/layout/MarketTicker";
import { getMarketData } from "./lib/market";
import { TrendingUp, Globe, Calendar, Mail, Library } from "lucide-react";
import { Metadata } from "next"; // 상단 import 추가
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

// 동적 메타데이터 생성 함수 (SEO 핵심)
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { date } = await searchParams;
  const targetDate = date || new Date().toISOString().split("T")[0];

  return {
    title: `오늘의 경제 요약`,
    description: `한국, 미국, 글로벌 주요 경제 뉴스 핵심 요약 모음입니다.`,
    openGraph: {
      title: `${targetDate} 경제를 붙잡다, Hang on!`,
      description: "오늘의 핵심 경제 이슈를 확인하세요.",
      url: `https://hangon.co.kr${date ? `?date=${date}` : ""}`,
      siteName: "Hang on!",
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: "https://hangon.co.kr/icon-512.png",
          width: 1200,
          height: 630,
          alt: "Hang on! Dashboard Preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${targetDate} 경제를 붙잡다, Hang on!`,
      description: "오늘의 핵심 경제 이슈를 확인하세요.",
      images: ["https://hangon.co.kr/og-image.png"],
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: selectedDate } = await searchParams;
  const targetDate = selectedDate || new Date().toISOString().split("T")[0];

  // targetDate의 시작과 끝 범위를 설정 (UTC 기준)
  const startOfDay = `${targetDate}T00:00:00Z`;
  const endOfDay = `${targetDate}T23:59:59Z`;

  // 데이터 페칭 병렬화 및 필요한 마켓 데이터만 요청
  const [newsResponse, marketData] = await Promise.all([
    supabase
      .from("daily_news")
      .select("*") // 상세 JOIN은 하단에서 별도 처리 (안정성 확보)
      .filter("created_at", "gte", startOfDay)
      .filter("created_at", "lte", endOfDay)
      .order("created_at", { ascending: false }),
    getMarketData([
      "KOSPI",
      "S&P 500",
      "나스닥",
      "원/달러 환율",
      "비트코인",
      "금 가격",
    ]),
  ]);

  let { data: news, error } = newsResponse;

  // [추가] 각 뉴스 아이템별 실제 반응 데이터를 안전하게 병합
  if (news && news.length > 0) {
    const newsIds = news.map((n) => n.id);
    const { data: reactions } = await supabase
      .from("news_reactions")
      .select("*")
      .in("news_id", newsIds);

    if (reactions) {
      news = news.map((item) => ({
        ...item,
        news_reactions: reactions.filter((r) => r.news_id === item.id),
      }));
    }
  }

  // [추가] 검색 엔진을 위한 구조화된 데이터 (JSON-LD) 생성
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: `${targetDate} 글로벌 경제 핵심 요약`,
    image: ["https://hangon.co.kr/og-image.png"],
    datePublished: startOfDay,
    dateModified: new Date().toISOString(),
    author: [
      {
        "@type": "Organization",
        name: "Hang on!",
        url: "https://hangon.co.kr",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "Hang on!",
      logo: {
        "@type": "ImageObject",
        url: "https://hangon.co.kr/logo.png",
      },
    },
    description:
      "오늘의 한국, 미국, 글로벌 경제 주요 이슈를 핵심요약해 드립니다.",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://hangon.co.kr${selectedDate ? `?date=${selectedDate}` : ""}`,
    },
  };

  if (error) {
    console.error("Supabase news fetch error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center">
        <p className="text-red-500 font-medium mb-2">Error</p>
        <p className="text-text-muted">
          데이터를 불러오는 중 문제가 발생했습니다.
        </p>
      </div>
    );
  }

  const displayDate = new Date(targetDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <main className="min-h-screen bg-background text-foreground max-w-6xl mx-auto px-4 sm:px-8 transition-colors duration-500">
      <header className="pt-8 pb-4 sm:pt-20 sm:pb-10 flex flex-col items-center">
        {/* 브랜딩 영역 - 중앙 정렬로 시각적 무게중심 확보 */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-accent/80">
              Daily Insights
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter italic">
            Hang on<span className="text-accent dark:text-accent">!</span>
          </h1>
          <p className="hidden sm:block text-text-muted text-xl font-medium tracking-wide mt-3">
            잠깐의 시간, 글로벌 경제 흐름을 꽉 잡다
          </p>
        </div>

        {/* [개선] 모바일 전용 레이아웃 (세로형 배치) */}
        <div className="w-full flex flex-col items-center gap-5 sm:hidden">
          {/* 1. 마켓 상태 카드 */}
          <div className="w-full">
            <MarketTicker data={marketData} />
          </div>

          {/* 2. 날짜 조정 (뉴스 바로 위 - 헤더의 마지막 요소) */}
          <div className="w-full pt-4 border-t border-border-subtle/30 flex justify-center">
            <DateNavigation currentDate={targetDate} />
          </div>
        </div>

        {/* 데스크탑 레이아웃 (안정적인 기존 레이아웃 유지 및 정돈) */}
        <div className="hidden sm:flex flex-col items-center gap-6 mb-10 w-full max-w-4xl">
          <MarketTicker data={marketData} />
          <div className="flex items-center justify-center bg-secondary/10 p-2 px-6 rounded-3xl border border-border-subtle/20">
            <DateNavigation currentDate={targetDate} />
          </div>
        </div>

        {/* 데스크탑 데일리 리포트 배너 */}
        <div className="hidden sm:block w-full max-w-4xl mx-auto px-4">
          <Link href="/news/daily-report" className="group block">
            <div className="relative overflow-hidden bg-gradient-to-br from-accent/90 to-accent rounded-2xl p-6 text-white shadow-xl shadow-accent/20 transition-all duration-300 group-hover:scale-[1.01] group-hover:shadow-2xl">
              <div className="relative z-10 flex flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-white/80">
                    <Library className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Market Analysis
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">
                    오늘의 마켓 데일리 브리핑
                  </h2>
                  <p className="text-white/70 text-sm font-medium">
                    거시경제 맥락으로 파악하는 시장 요약 보고서
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold group-hover:bg-white group-hover:text-accent transition-colors">
                  리포트 읽기 <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </header>

      <div className="scroll-mt-24">
        {news && news.length > 0 ? (
          <NewsDashboard news={news} />
        ) : (
          <div className="col-span-full py-32 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-card border border-border-subtle flex items-center justify-center">
              <Calendar className="w-6 h-6 text-text-muted opacity-20" />
            </div>
            <p className="text-text-muted font-medium text-sm">
              이 날짜에는 등록된 뉴스가 없네요😅
            </p>
            <p className="text-text-muted font-medium text-sm">
              다른 날짜를 확인해보세요!
            </p>
          </div>
        )}
      </div>

      <footer className="py-20 text-center space-y-4 border-t border-border-subtle">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2 opacity-50">
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Hang on! News Network
            </span>
          </div>
          <a
            href="mailto:boxmagic25@gmail.com"
            className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium tracking-tight">
              Contact & Feedback
            </span>
          </a>
          {/* [추가] 개인정보처리방침 링크 */}
          <div className="text-[11px] font-medium text-text-muted/80 mt-1">
            <Link
              href="/privacy"
              className="hover:text-accent transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
        <p className="text-text-muted text-[10px] font-medium">
          © {new Date().getFullYear()} Hang on! All rights reserved.
        </p>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
