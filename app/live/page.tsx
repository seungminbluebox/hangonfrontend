"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Zap,
  Clock,
  TrendingUp,
  Globe,
  AlertCircle,
  Loader2,
  Radio,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { BackButton } from "../components/layout/BackButton";
import { BreakingNewsShareCard } from "../components/news/BreakingNewsShareCard";
import { Share2 } from "lucide-react";

interface BreakingNews {
  id: number;
  title: string;
  content: string;
  importance_score: number;
  category: string;
  original_url: string;
  image_url?: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 20;

export default function LivePage() {
  const [news, setNews] = useState<BreakingNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedShareItem, setSelectedShareItem] =
    useState<BreakingNews | null>(null);

  useEffect(() => {
    fetchInitialNews();

    // Supabase Realtime 구독
    const channel = supabase
      .channel("breaking_news_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "breaking_news" },
        (payload) => {
          const newMsg = payload.new as BreakingNews;
          setNews((prev) => [newMsg, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInitialNews = async () => {
    try {
      const { data, error } = await supabase
        .from("breaking_news")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(ITEMS_PER_PAGE);

      if (error) throw error;
      setNews(data || []);
      if (data && data.length < ITEMS_PER_PAGE) setHasMore(false);
    } catch (err) {
      console.error("Initial fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    const from = nextPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      const { data, error } = await supabase
        .from("breaking_news")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      if (data && data.length > 0) {
        setNews((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const filteredNewData = data.filter(
            (item) => !existingIds.has(item.id),
          );
          return [...prev, ...filteredNewData];
        });
        setPage(nextPage);
        if (data.length < ITEMS_PER_PAGE) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Load more error:", err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "geopolitics":
        return <Globe className="w-3.5 h-3.5" />;
      case "indicator":
        return <TrendingUp className="w-3.5 h-3.5" />;
      case "market":
        return <Activity className="w-3.5 h-3.5" />;
      case "corporate":
        return <Zap className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const getImportanceColor = (score: number) => {
    if (score >= 9) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    if (score >= 8)
      return "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]";
    return "bg-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.3)]";
  };

  return (
    <main className="min-h-screen bg-background pb-32">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 md:pt-32 space-y-8 md:space-y-12">
        <BackButton />

        <div className="max-w-2xl mx-auto w-full">
          {/* 히어로 타이틀: 진입 시 페이지 성격 인지 */}
          <header className="mb-0 relative group">
            <div className="flex items-center justify-between mb-2">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-accent"
              >
                <Radio className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Global Data Feed
                </span>
              </motion.div>

              <div className="flex items-center gap-2">
                <div className="relative flex">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500 my-auto"></span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-foreground/40">
                  LIVE
                </span>
              </div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-black leading-tight tracking-tighter"
            >
              마켓 실시간 속보<span className="text-accent">.</span>
            </motion.h1>
          </header>

          {/* 타임라인 메인 섹션 */}
          <div className="relative">
            {/* 실크 스타일 수직선 */}
            <div className="absolute left-[7px] top-2 bottom-0 w-[1px] bg-gradient-to-b from-accent/40 via-border/20 to-transparent" />

            <div className="space-y-10 relative">
              {loading && news.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 grayscale opacity-30">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[11px] font-bold tracking-widest">
                    CONNECTING TO FEED...
                  </span>
                </div>
              ) : news.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                  <p className="text-sm font-bold">
                    현재 활성화된 속보가 없습니다.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {news.map((item, index) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="relative pl-8 group"
                    >
                      {/* 타임라인 포인트 */}
                      <div className="absolute left-[7px] top-[64px] transform -translate-x-1/2 z-10">
                        <div
                          className={`w-[14px] h-[14px] rounded-full border-[3px] border-background ${getImportanceColor(
                            item.importance_score,
                          )} transition-all duration-500 group-hover:scale-125`}
                        />
                        {item.importance_score >= 8 && (
                          <div className="absolute inset-0 w-[14px] h-[14px] rounded-full animate-ping bg-current opacity-20 pointer-events-none" />
                        )}
                      </div>

                      {/* 카드 디자인 */}
                      <div className="relative bg-card/10 hover:bg-card/30 backdrop-blur-sm p-6 rounded-2xl border border-white/[0.03] hover:border-accent/20 transition-all duration-500 overflow-hidden">
                        {item.image_url && (
                          <div className="mb-5 relative w-full h-40 sm:h-48 rounded-xl overflow-hidden border border-white/5">
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-60" />
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted/60">
                            <Clock className="w-3 h-3" />
                            {format(new Date(item.created_at), "HH:mm", {
                              locale: ko,
                            })}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedShareItem(item);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                          >
                            <Share2 className="w-3 h-3" />
                            공유
                          </button>
                        </div>

                        <h3 className="text-[17px] font-bold leading-snug mb-2.5 text-foreground/90 group-hover:text-foreground transition-colors break-keep">
                          {item.title}
                        </h3>
                        <p className="text-[14px] text-text-muted leading-relaxed font-normal break-keep opacity-80 group-hover:opacity-100 transition-opacity">
                          {item.content}
                        </p>

                        {item.original_url && (
                          <div className="mt-4  border-t border-white/[0.02]">
                            <Link
                              href={item.original_url}
                              target="_blank"
                              className="text-[10px] font-black uppercase tracking-widest text-accent hover:opacity-70 transition-opacity"
                            >
                              뉴스기사 →
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* 더 보기 버튼 */}
          {hasMore && news.length > 0 && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={loadMore}
                className="px-8 py-3 rounded-full border border-white/5 hover:border-accent/20 text-[11px] font-black uppercase tracking-widest transition-all hover:bg-accent/5"
              >
                Load Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedShareItem && (
        <BreakingNewsShareCard
          news={selectedShareItem}
          onClose={() => setSelectedShareItem(null)}
        />
      )}
    </main>
  );
}
