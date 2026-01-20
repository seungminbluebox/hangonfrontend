"use client";

import React, { useRef, useState, useEffect } from "react";
import { toBlob } from "html-to-image";
import {
  X,
  Download,
  Share2,
  Landmark,
  ArrowRightLeft,
  TrendingUp,
  Clock,
} from "lucide-react";

interface RateHistory {
  date: string;
  value: number;
}

interface InterestRates {
  kr: {
    current: number;
    history: RateHistory[];
  };
  us: {
    current: number;
    history: RateHistory[];
  };
}

interface InterestRateShareCardProps {
  data: InterestRates;
  onClose: () => void;
}

export function InterestRateShareCard({
  data,
  onClose,
}: InterestRateShareCardProps) {
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
        width: "320px",
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
        `hangon-interest-rates-${new Date().toISOString().split("T")[0]}.png`,
      );
    }
    setIsExporting(false);
  };

  const handleWebShare = async () => {
    const blob = await getBlob();
    if (!blob) return;

    const file = new File([blob], "interest-rates.png", { type: "image/png" });

    try {
      await navigator.share({
        files: [file],
        title: "[Hang on!] 한·미 기준금리 현황",
        text: `미국: ${data.us.current}% | 한국: ${data.kr.current}%\n금리 격차: ${(data.us.current - data.kr.current).toFixed(2)}%p`,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        console.error("공유 실패:", err);
    }
  };

  const gap = (data.us.current - data.kr.current).toFixed(2);
  const today = new Date();
  const dateString = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base">금리 리포트 공유</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 bg-black/[0.02] dark:bg-white/[0.02] overflow-y-auto flex-1 flex flex-col items-center">
          <div className="pt-8 pb-12 flex flex-col items-center scale-[0.7] xs:scale-[0.85] sm:scale-100 origin-top transition-all duration-300">
            <div
              ref={cardRef}
              className={`w-[320px] p-7 rounded-[35px] shadow-2xl relative overflow-hidden transition-colors duration-300 border flex flex-col gap-6 ${
                shareTheme === "light"
                  ? "bg-[#F8F7F4] text-neutral-900 border-neutral-100"
                  : "bg-[#0f172a] text-white border-white/5"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col gap-0.5">
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${shareTheme === "light" ? "text-neutral-400" : "text-white/40"}`}
                  >
                    {dateString} (KST)
                  </p>
                  <div className="flex items-center gap-1.5 opacity-30 grayscale">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black tracking-widest uppercase">
                      Hang On!
                    </span>
                  </div>
                </div>
                <div
                  className={`w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center ${shareTheme === "light" ? "bg-orange-500/5 text-orange-500" : "text-orange-400"}`}
                >
                  <Landmark className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Title Area */}
              <div className="relative z-10">
                <h2 className="text-2xl font-black italic tracking-tighter leading-none mb-2">
                  한·미 금리 비교 리포트
                </h2>
                <div className="h-1 w-10 bg-orange-500 rounded-full" />
              </div>

              {/* Main Content: Rates & Gap */}
              <div className="flex flex-col gap-4 relative z-10">
                {/* Gap Highlighter */}
                <div
                  className={`p-4 rounded-3xl border flex items-center justify-between ${shareTheme === "light" ? "bg-white border-orange-500/20 shadow-sm" : "bg-white/5 border-orange-500/20"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <ArrowRightLeft className="w-4.5 h-4.5 text-orange-500" />
                    </div>
                    <span className="text-xs font-black italic opacity-60">
                      금리 격차
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black italic tracking-tighter text-orange-500">
                      {gap}
                    </span>
                    <span className="text-xs font-black italic text-orange-500/40">
                      %p
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* US Rate */}
                  <div
                    className={`p-4 rounded-3xl border flex flex-col gap-2 ${shareTheme === "light" ? "bg-white border-blue-500/10 shadow-sm" : "bg-white/5 border-blue-500/10"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <span className="text-[7px] font-black text-blue-500">
                          USA
                        </span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black italic tracking-tighter text-blue-500">
                        {data.us.current.toFixed(2)}
                      </span>
                      <span className="text-xs font-black italic text-blue-500/40">
                        %
                      </span>
                    </div>
                  </div>

                  {/* KR Rate */}
                  <div
                    className={`p-4 rounded-3xl border flex flex-col gap-2 ${shareTheme === "light" ? "bg-white border-emerald-500/10 shadow-sm" : "bg-white/5 border-emerald-500/10"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <span className="text-[7px] font-black text-emerald-500">
                          KOR
                        </span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black italic tracking-tighter text-emerald-500">
                        {data.kr.current.toFixed(2)}
                      </span>
                      <span className="text-xs font-black italic text-emerald-500/40">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Insight */}
              <div className="relative z-10 pt-5 border-t border-dashed border-neutral-300 dark:border-white/10">
                <div className="flex flex-col gap-1 items-end text-right">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest leading-none transition-colors ${
                      shareTheme === "light"
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    더 많은 정보는?
                  </span>
                  <span className="text-[14px] font-black text-accent tracking-tighter italic leading-none mt-0.5">
                    www.hangon.co.kr
                  </span>
                </div>
              </div>

              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/[0.03] rounded-full -mr-24 -mt-24 blur-3xl p-10" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/[0.04] rounded-full -ml-20 -mb-20 blur-2xl p-10" />
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
              이미지 다운로드
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
