"use client";

import React, { useRef, useState, useEffect } from "react";
import { toPng, toBlob } from "html-to-image";
import {
  Download,
  Copy,
  Check,
  Share2,
  Quote,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";

interface NewsItem {
  id: string;
  category: string;
  keyword: string;
  summary: string;
  created_at: string;
}

interface DailyShareCardProps {
  news: NewsItem[];
  onClose: () => void;
}

export function DailyShareCard({ news, onClose }: DailyShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
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
        width: "360px",
        height: "540px",
        backgroundColor: shareTheme === "light" ? "#F8F7F4" : "#0f172a",
        borderRadius: "35px",
        boxShadow: "none",
        border: "none",
        position: "relative",
      },
    });
  };

  const handleWebShare = async () => {
    if (typeof navigator.share !== "function") {
      alert(
        "현재 브라우저 환경에서는 바로 공유 기능을 사용할 수 없습니다. '이미지 저장'을 이용해 주세요!",
      );
      return;
    }

    const blob = await getBlob();
    if (!blob) return;

    const file = new File([blob], "hangon-daily.png", { type: "image/png" });
    const dateStr = new Date().toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });

    try {
      await navigator.share({
        files: [file],
        title: `[데일리] ${dateStr} 글로벌 소식 요약`,
        text: news.map((n, i) => `${i + 1}. ${n.keyword}`).join("\n"),
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        console.error("공유 실패:", err);
    }
  };

  const handleCopyImage = async () => {
    const blob = await getBlob();
    if (!blob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setIsImageCopied(true);
      setTimeout(() => setIsImageCopied(false), 2000);
    } catch (err) {
      console.error("이미지 복사 실패:", err);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "rgba(0, 0, 0, 0)",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          width: "360px",
          height: "540px",
          backgroundColor: shareTheme === "light" ? "#F8F7F4" : "#0f172a",
          borderRadius: "35px",
          boxShadow: "none",
          border: "none",
          position: "relative",
        },
      });
      const link = document.createElement("a");
      link.download = `hangon-daily-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("이미지 생성 실패:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20">
          <div className="pl-2">
            <h3 className="font-black text-base">오늘의 소식 모아보기</h3>
            <p className="text-[10px] text-text-muted font-medium">
              하루의 핵심 뉴스를 한 장에 담았습니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors mr-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-4 bg-black/[0.02] dark:bg-white/[0.02] overflow-y-auto flex-1 flex flex-col items-center">
          <div className="pt-8 pb-12 flex flex-col items-center scale-[0.65] xs:scale-[0.8] sm:scale-95 origin-center transition-all duration-300">
            <div
              ref={cardRef}
              className={`w-[360px] h-[540px] p-7 rounded-[35px] shadow-2xl relative overflow-hidden flex flex-col justify-between border transition-colors duration-300 ${
                shareTheme === "light"
                  ? "bg-[#F8F7F4] text-slate-900 border-slate-100"
                  : "bg-[#0f172a] text-slate-100 border-slate-800"
              }`}
              style={{
                fontFamily: "var(--font-sans)",
                borderRadius: "35px",
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2 relative z-10">
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${shareTheme === "light" ? "text-neutral-400" : "text-white/40"}`}
                >
                  {new Date().toLocaleDateString("ko-KR")}
                </p>
                <div
                  className={`flex items-center gap-1.5 opacity-30 grayscale ${shareTheme === "light" ? "text-neutral-900" : "text-white"}`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">
                    Hang on!
                  </span>
                </div>
              </div>

              <div
                className={`flex items-center justify-between relative z-10 border-b pb-4 transition-colors ${
                  shareTheme === "light"
                    ? "border-slate-100"
                    : "border-slate-800"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <h2
                    className={`text-xl font-black tracking-tight leading-none transition-colors ${
                      shareTheme === "light"
                        ? "text-slate-800"
                        : "text-slate-100"
                    }`}
                  >
                    데일리 경제 뉴스
                  </h2>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-3 flex-1 justify-center py-4">
                {news.slice(0, 5).map((item, idx) => (
                  <div key={item.id} className="flex gap-4 items-center py-1">
                    <span className="text-sm font-black text-accent/40">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <h4
                        className={`text-[14px] font-black leading-snug break-keep transition-colors ${
                          shareTheme === "light"
                            ? "text-slate-800"
                            : "text-slate-200"
                        }`}
                      >
                        {item.keyword}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom: App Link & CTA */}
              <div className="mt-auto relative z-10 flex justify-center pt-2">
                <p
                  className={`text-[13px] font-black tracking-tighter opacity-30 ${
                    shareTheme === "light" ? "text-neutral-900" : "text-white"
                  }`}
                >
                  www.hangon.co.kr
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border-t border-border-subtle flex flex-col gap-4">
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

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={canShare ? handleWebShare : handleCopyImage}
              className="col-span-2 flex items-center justify-center gap-2 py-3.5 bg-accent text-white hover:bg-accent/90 rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-lg shadow-accent/20"
            >
              {canShare ? (
                <Share2 className="w-4 h-4" />
              ) : isImageCopied ? (
                <Check className="w-4 h-4" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              {canShare
                ? "전체 요약 공유하기"
                : isImageCopied
                  ? "요약 이미지 복사됨!"
                  : "요약 이미지 복사하기"}
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="col-span-2 flex items-center justify-center gap-2 py-3.5 bg-muted hover:bg-muted/80 rounded-2xl font-bold text-[13px] transition-all"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              이미지 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
