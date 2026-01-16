"use client";

import { useState, useEffect, useRef } from "react";
import {
  ExternalLink,
  Info,
  Newspaper,
  ChevronLeft,
  Share2,
  LayoutGrid,
} from "lucide-react";
import { ShareCard } from "./ShareCard";
import { DailyShareCard } from "./DailyShareCard";

interface NewsItem {
  id: string;
  category: string;
  keyword: string;
  summary: string;
  links: { title: string; url: string }[];
  created_at: string;
}

export function NewsDashboard({ news }: { news: NewsItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    news.length > 0 ? news[0].id : null
  );
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDailyShareModalOpen, setIsDailyShareModalOpen] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  // 뉴스 데이터(날짜)가 변경되면 선택된 아이디를 첫 번째 뉴스로 리셋
  useEffect(() => {
    if (news.length > 0) {
      setSelectedId(news[0].id);
    } else {
      setSelectedId(null);
    }
    // 상세 페이지가 열려있다면 닫아줌 (모바일 대응)
    setIsMobileDetailOpen(false);
  }, [news]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileDetailOpen(true);
    }
  };

  // 모바일에서 다른 소식을 선택할 때마다 상세 영역을 상단으로 스크롤
  useEffect(() => {
    if (!selectedId) return;

    if (typeof window === "undefined") return;

    if (window.innerWidth < 1024) {
      const el = detailRef.current;
      if (el) {
        // 일부 모바일 브라우저에서 smooth 동작이 불안정한 경우 대비해서 scrollTop 직접 설정
        el.scrollTop = 0;
        try {
          el.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
          // 지원하지 않는 브라우저는 silent fail
        }
      }

      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        // window 스크롤도 실패 시 무시
      }
    }
  }, [selectedId]);

  const selectedItem = news.find((item) => item.id === selectedId);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative pb-12">
      {/* Left: Search/List Area (Master) */}
      <div
        className={`w-full lg:flex-1 space-y-3 ${
          isMobileDetailOpen ? "hidden lg:block" : "block"
        }`}
      >
        {/* Daily Summary Button */}
        {news.length > 0 && (
          <button
            onClick={() => setIsDailyShareModalOpen(true)}
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-all group mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-accent text-sm tracking-tight">
                  오늘의 소식 한눈에 공유
                </h3>
                <p className="text-[11px] text-accent/60 font-medium">
                  5가지 주요 소식을 한 장의 카드에 담아보세요
                </p>
              </div>
            </div>
            <Share2 className="w-4 h-4 text-accent/40 group-hover:text-accent transition-colors" />
          </button>
        )}

        <div className="grid grid-cols-1 gap-2.5">
          {news.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`group flex flex-col p-5 rounded-2xl text-left transition-all duration-300 border ${
                selectedId === item.id
                  ? "bg-card border-accent shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] translate-x-1"
                  : "bg-card border-border-subtle/80 hover:border-accent/30 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border tracking-widest transition-all duration-300 shadow-sm ${
                    item.category === "KR"
                      ? "bg-blue-50 text-blue-700! border-blue-200 dark:bg-blue-500/10 dark:text-blue-300! dark:border-blue-500/20"
                      : item.category === "US"
                      ? "bg-red-50 text-red-700! border-red-200 dark:bg-red-500/10 dark:text-red-300! dark:border-red-500/20"
                      : "bg-emerald-50 text-emerald-700! border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300! dark:border-emerald-500/20"
                  }`}
                >
                  {item.category}
                </span>
                {selectedId === item.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                )}
              </div>
              <h2
                className={`font-bold transition-colors tracking-tight ${
                  selectedId === item.id
                    ? "text-accent text-xl font-black"
                    : "text-foreground/90 dark:text-foreground text-lg group-hover:text-accent/80"
                }`}
              >
                {item.keyword}
              </h2>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Detail Area */}
      <div
        ref={detailRef}
        className={`w-full lg:w-[500px] sticky top-10 ${
          isMobileDetailOpen
            ? "fixed inset-0 z-50 bg-background lg:relative lg:inset-auto lg:z-auto lg:bg-transparent overflow-y-auto p-4 lg:p-8"
            : "hidden lg:block"
        }`}
      >
        {isMobileDetailOpen && (
          <button
            onClick={() => setIsMobileDetailOpen(false)}
            className="lg:hidden mb-4 flex items-center gap-2 text-accent font-bold"
          >
            <ChevronLeft className="w-5 h-5" />
            목록으로 돌아가기
          </button>
        )}
        {selectedItem ? (
          <>
            <div className="flex flex-col p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-card border-2 border-border-subtle dark:border-border-subtle/50 shadow-[0_12px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_24px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col space-y-6">
                <div className="space-y-4">
                  <h3 className="text-3xl sm:text-3xl font-sans font-bold italic leading-tight tracking-tight text-foreground selection:bg-accent/20">
                    {selectedItem.keyword}
                  </h3>

                  <div className="flex items-center justify-between gap-3">
                    <div className="h-px flex-1 bg-accent/40" />
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="group flex items-center gap-2 px-4 py-2 bg-accent/5 hover:bg-accent text-accent hover:text-white rounded-full transition-all duration-300 transform active:scale-95"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-bold text-accent group-hover:text-white">
                        소식 공유
                      </span>
                    </button>
                    <div className="h-px flex-1 bg-accent/40" />
                  </div>

                  <p className="text-[15px] sm:text-[16.5px] leading-[1.7] font-normal text-foreground/70 dark:text-foreground/85 tracking-tight whitespace-pre-line selection:bg-accent/5">
                    {selectedItem.summary}
                  </p>
                </div>

                <div className="pt-6 border-t-2 border-border-subtle space-y-4">
                  <span className="text-[10px] font-black text-accent uppercase tracking-widest">
                    관련 기사
                  </span>
                  <div className="flex flex-col gap-2">
                    {selectedItem.links?.map((link, idx) => {
                      let finalUrl = link.url;

                      // 네이버 뉴스 모바일 최적화 대응
                      if (
                        typeof window !== "undefined" &&
                        finalUrl.includes("naver.com")
                      ) {
                        const isMobile = /iPhone|iPad|iPod|Android/i.test(
                          navigator.userAgent
                        );
                        if (isMobile) {
                          try {
                            const urlObj = new URL(finalUrl);
                            const articleId =
                              urlObj.searchParams.get("article_id") ||
                              urlObj.searchParams.get("aid");
                            const officeId =
                              urlObj.searchParams.get("office_id") ||
                              urlObj.searchParams.get("oid");

                            if (articleId && officeId) {
                              finalUrl = `https://n.news.naver.com/mnews/article/${officeId}/${articleId}`;
                            } else if (finalUrl.includes("finance.naver.com")) {
                              // 파이낸스 메인 뉴스 등 쿼리스트링이 다른 경우 대비
                              finalUrl = finalUrl.replace(
                                "finance.naver.com",
                                "m.finance.naver.com"
                              );
                            }
                          } catch (e) {
                            // URL 파싱 실패 시 원본 사용
                          }
                        }
                      }

                      return (
                        <a
                          key={idx}
                          href={finalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link flex items-center justify-between p-4 rounded-2xl border border-border-subtle bg-background hover:bg-accent hover:border-accent transition-all duration-300"
                        >
                          <span className="text-[13px] font-medium group-hover/link:text-white transition-colors line-clamp-1">
                            {link.title}
                          </span>
                          <ExternalLink className="w-4 h-4 text-text-muted group-hover/link:text-white transition-colors shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 모바일 하단 내비게이터 (다른 소식 둘러보기) */}
            <div className="lg:hidden mt-12 mb-12 space-y-5 px-1 pb-10">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-1 rounded-full bg-accent" />
                <h4 className="text-[13px] font-black text-foreground/40 uppercase tracking-[0.25em]">
                  다른 소식 둘러보기
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {news
                  .filter((n) => n.id !== selectedId)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className="flex flex-col p-4 rounded-2xl text-left transition-all duration-300 border bg-card border-border-subtle/80 hover:border-accent/40 hover:translate-x-1"
                    >
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border mb-2 w-fit ${
                          item.category === "KR"
                            ? "bg-blue-50 text-blue-700/80 border-blue-200 dark:bg-blue-500/5 dark:text-blue-400"
                            : item.category === "US"
                            ? "bg-red-50 text-red-700/80 border-red-200 dark:bg-red-500/5 dark:text-red-400"
                            : "bg-emerald-50 text-emerald-700/80 border-emerald-200 dark:bg-emerald-500/5 dark:text-emerald-400"
                        }`}
                      >
                        {item.category}
                      </span>
                      <p className="text-sm font-bold text-foreground/80 line-clamp-1 tracking-tight">
                        {item.keyword}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 h-[400px] rounded-[2.5rem] border border-dashed border-border-subtle opacity-40">
            <Newspaper className="w-12 h-12 mb-4" />
            <p className="text-sm font-medium">
              뉴스를 선택하시면 제가 자세히 알려드릴게요!
            </p>
          </div>
        )}
      </div>

      {isShareModalOpen && selectedItem && (
        <ShareCard
          title={selectedItem.keyword}
          category={selectedItem.category}
          summary={selectedItem.summary}
          date={selectedItem.created_at}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {isDailyShareModalOpen && (
        <DailyShareCard
          news={news}
          onClose={() => setIsDailyShareModalOpen(false)}
        />
      )}
    </div>
  );
}
