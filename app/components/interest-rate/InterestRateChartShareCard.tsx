"use client";

import React, { useRef, useState, useEffect } from "react";
import { toBlob } from "html-to-image";
import { X, Download, Share2, TrendingUp, ArrowRightLeft } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis } from "recharts";

interface HistoryPoint {
  date: string;
  kr: number | null;
  us: number | null;
  gap: string | null;
}

interface InterestRateChartShareCardProps {
  data: HistoryPoint[];
  currentGap: string;
  onClose: () => void;
}

export function InterestRateChartShareCard({
  data,
  currentGap,
  onClose,
}: InterestRateChartShareCardProps) {
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
        `hangon-rate-trend-${new Date().toISOString().split("T")[0]}.png`,
      );
    }
    setIsExporting(false);
  };

  const handleWebShare = async () => {
    const blob = await getBlob();
    if (!blob) return;

    const file = new File([blob], "rate-trend.png", { type: "image/png" });

    try {
      await navigator.share({
        files: [file],
        title: "[Hang on!] 한·미 금리 추이",
        text: `현재 한·미 금리 격차는 ${currentGap}%p 입니다.`,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        console.error("공유 실패:", err);
    }
  };

  const today = new Date();
  const dateString = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;

  // 최신 5개년 데이터만 추출하여 보여줌 (60개월)
  const recentData = data.slice(-60);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base">추이 리포트 공유</h3>
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
                <div className="flex items-center gap-1.5 opacity-30 grayscale">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black tracking-widest uppercase">
                    Hang On!
                  </span>
                </div>
                <p
                  className={`text-[9px] font-black uppercase tracking-[0.1em] ${shareTheme === "light" ? "text-neutral-400" : "text-white/40"}`}
                >
                  {dateString}
                </p>
              </div>

              {/* Minimal Gap Area */}
              <div className="relative z-10 flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <h2 className="text-xl font-black italic tracking-tighter leading-none mb-1">
                    한·미 금리 격차
                  </h2>
                  <div className="h-1 w-8 bg-orange-500 rounded-full" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black italic tracking-tighter text-orange-500">
                    {currentGap}
                  </span>
                  <span className="text-sm font-black italic text-orange-500/40">
                    %p
                  </span>
                </div>
              </div>

              {/* Simple Chart */}
              <div className="relative z-10 flex flex-col gap-2">
                <div
                  className={`h-[140px] w-full rounded-2xl p-4 ${shareTheme === "light" ? "bg-white/50 border border-neutral-100" : "bg-white/5 border border-white/5"}`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recentData}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={["dataMin - 0.5", "dataMax + 0.5"]} />
                      <Line
                        type="monotone"
                        dataKey="us"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="kr"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">
                      미국
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">
                      한국
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Info - Right Aligned as requested */}
              <div className="relative z-10 pt-4 border-t border-dashed border-neutral-200 dark:border-white/10">
                <div className="flex flex-col gap-1 items-end">
                  <span
                    className={`text-[8px] font-bold uppercase tracking-widest leading-none ${shareTheme === "light" ? "text-slate-500" : "text-slate-400"}`}
                  >
                    더 많은 정보는?
                  </span>
                  <span className="text-[12px] font-black text-accent tracking-tighter italic leading-none mt-0.5">
                    www.hangon.co.kr
                  </span>
                </div>
              </div>

              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.03] rounded-full -mr-16 -mt-16 blur-2xl p-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/[0.03] rounded-full -ml-16 -mb-16 blur-2xl p-10" />
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
              추이 이미지 저장
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
