"use client";

import React, { useRef, useState, useEffect } from "react";
import { toBlob } from "html-to-image";
import { X, Download, Share2, TrendingUp, Clock, Zap } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

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

interface BreakingNewsShareCardProps {
  news: BreakingNews;
  onClose: () => void;
}

export function BreakingNewsShareCard({
  news,
  onClose,
}: BreakingNewsShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [shareTheme, setShareTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (
      isMobile ||
      (typeof navigator !== "undefined" &&
        typeof navigator.share === "function")
    ) {
      setCanShare(true);
    }
  }, []);

  const getBlob = async () => {
    if (!cardRef.current) return null;

    return await toBlob(cardRef.current, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: "rgba(0,0,0,0)",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        margin: "0",
        left: "0",
        top: "0",
        width: "300px",
        height: "420px",
        position: "relative",
        borderRadius: "35px",
        boxShadow: "none",
        border: "none",
        backgroundColor: shareTheme === "light" ? "#F8F7F4" : "#0f172a",
      },
    });
  };

  const handleDownload = async () => {
    setIsExporting(true);
    const blob = await getBlob();
    if (blob) {
      // @ts-ignore
      const { saveAs } = await import("file-saver");
      saveAs(
        blob,
        `hangon-breaking-${format(new Date(news.created_at), "MMdd-HHmm")}.png`,
      );
    }
    setIsExporting(false);
  };

  const handleWebShare = async () => {
    const blob = await getBlob();
    if (!blob) return;

    const file = new File([blob], "breaking-news.png", { type: "image/png" });

    try {
      await navigator.share({
        files: [file],
        title: `[속보] ${news.title}`,
        text: news.content,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        console.error("공유 실패:", err);
    }
  };

  const displayDate = format(new Date(news.created_at), "MM/dd", {
    locale: ko,
  });
  const displayTime = format(new Date(news.created_at), "HH:mm");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base italic">실시간 속보 공유</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 bg-black/[0.02] dark:bg-white/[0.02] overflow-y-auto flex-1 flex flex-col items-center">
          <div className="pt-6 pb-10 flex flex-col items-center scale-[0.7] xs:scale-[0.8] sm:scale-90 origin-top transition-all duration-300">
            <div
              ref={cardRef}
              className={`w-[300px] h-[420px] p-8 rounded-[35px] shadow-2xl relative overflow-hidden transition-colors duration-300 border flex flex-col ${
                shareTheme === "light"
                  ? "bg-[#F8F7F4] text-neutral-900 border-neutral-100"
                  : "bg-[#0f172a] text-white border-white/5"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 bg-red-600 rounded-lg flex items-center gap-1.5 shadow-lg shadow-red-600/20">
                    <Zap className="w-3 h-3 text-white fill-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">
                      속보 • Breaking
                    </span>
                  </div>
                </div>
                <p
                  className={`text-[11px] font-black tracking-[0.1em] opacity-40 ${
                    shareTheme === "light" ? "text-neutral-900" : "text-white"
                  }`}
                >
                  {format(new Date(news.created_at), "MM. dd (eee)", {
                    locale: ko,
                  })}
                </p>
              </div>

              {/* Main Image */}
              {news.image_url && (
                <div className="mb-6 relative w-full h-40 rounded-2xl overflow-hidden border border-black/5">
                  <img
                    src={news.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t opacity-20 ${shareTheme === "light" ? "from-black/20" : "from-black/60"}`}
                  />
                </div>
              )}

              {/* Title Area */}
              <div className="mb-5 relative">
                <h2 className="text-[24px] font-[900] leading-[1.25] tracking-tight break-keep mb-3">
                  {news.title}
                </h2>
                <div className="w-12 h-1.5 bg-red-600 rounded-full" />
              </div>

              {/* Content Area */}

              <p
                className={`text-[15px] leading-[1.6] font-bold break-keep ${
                  shareTheme === "light"
                    ? "text-neutral-700"
                    : "text-neutral-300"
                }`}
              >
                {news.content}
              </p>

              {/* Bottom: Domain */}
              <div className="mt-auto relative z-10 flex flex-col items-center pt-2">
                <div className={`w-10 h-1 bg-accent/20 rounded-full mb-4`} />
                <p
                  className={`text-[12px] font-black tracking-widest opacity-25 ${
                    shareTheme === "light" ? "text-neutral-900" : "text-white"
                  }`}
                >
                  www.hangon.co.kr
                </p>
              </div>

              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/[0.03] rounded-full -mr-24 -mt-24 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/[0.04] rounded-full -ml-20 -mb-20 blur-2xl" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-card border-t border-border-subtle flex flex-col gap-4 shrink-0">
          <div className="flex bg-muted/50 p-1 rounded-2xl w-full">
            <button
              onClick={() => setShareTheme("light")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                shareTheme === "light"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              라이트 모드
            </button>
            <button
              onClick={() => setShareTheme("dark")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                shareTheme === "dark"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              다크 모드
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 py-4 bg-accent text-white hover:bg-accent/90 rounded-2xl font-black text-base transition-all active:scale-[0.98] shadow-lg shadow-accent/20"
            >
              {isExporting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              이미지 저장
            </button>
            {canShare && (
              <button
                onClick={handleWebShare}
                className="flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted/80 rounded-2xl font-bold text-sm transition-all"
              >
                <Share2 className="w-4 h-4" />
                다른 앱으로 공유
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
