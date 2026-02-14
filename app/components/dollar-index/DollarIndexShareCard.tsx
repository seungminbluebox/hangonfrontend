"use client";

import React, { useRef, useState, useEffect } from "react";
import { toBlob } from "html-to-image";
import {
  Download,
  Copy,
  Check,
  Share2,
  X,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { LineChart, Line, YAxis, ResponsiveContainer } from "recharts";
import { MarketData } from "../../lib/market";

interface DXYAnalysis {
  title: string;
  analysis: string;
  updated_at: string;
}

interface DXYData extends MarketData {
  analysis: DXYAnalysis;
}

interface DollarIndexShareCardProps {
  data: DXYData;
  onClose: () => void;
}

export function DollarIndexShareCard({
  data,
  onClose,
}: DollarIndexShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
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
        margin: "0",
        left: "0",
        top: "0",
        width: "360px",
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
        `hangon-dollar-index-${new Date().toISOString().split("T")[0]}.png`,
      );
    }
    setIsExporting(false);
  };

  const handleWebShare = async () => {
    const blob = await getBlob();
    if (!blob) return;

    const file = new File([blob], "dollar-index.png", { type: "image/png" });

    try {
      await navigator.share({
        files: [file],
        title: "[Hang on!] 달러 인덱스 브리핑",
        text: `${data.analysis?.title || "달러 인덱스 분석"}\n현재 지수: ${data.value}`,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        console.error("공유 실패:", err);
    }
  };

  const isUp = data.value ? parseFloat(data.change || "0") >= 0 : true;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base">달러 인덱스 리포트 공유</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 bg-black/[0.02] dark:bg-white/[0.02] overflow-y-auto flex-1 flex flex-col items-center">
          <div className="py-6 flex flex-col items-center scale-[0.65] xs:scale-[0.8] sm:scale-95 origin-top transition-all duration-300">
            <div
              ref={cardRef}
              className={`w-[360px] h-[480px] p-8 rounded-[35px] shadow-2xl relative overflow-hidden transition-colors duration-300 border flex flex-col ${
                shareTheme === "light"
                  ? "bg-[#F8F7F4] text-neutral-900 border-neutral-100"
                  : "bg-[#0f172a] text-white border-white/5"
              }`}
            >
              {/* Header: Date and Logo */}
              <div className="flex justify-between items-start shrink-0">
                <div className="flex flex-col gap-1.5">
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                      shareTheme === "light"
                        ? "text-neutral-400"
                        : "text-white/40"
                    }`}
                  >
                    {new Date().toLocaleDateString("ko-KR")}
                  </p>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        shareTheme === "light" ? "bg-us/10" : "bg-us/20"
                      }`}
                    >
                      <DollarSign className="w-5 h-5 text-us" />
                    </div>
                    <p
                      className={`text-[18px] font-black tracking-tight leading-none ${
                        shareTheme === "light"
                          ? "text-neutral-900"
                          : "text-white"
                      }`}
                    >
                      Dollar Index
                      <span className="ml-2.5 opacity-30 font-black text-[11px] tracking-widest block mt-1">
                        달러 가치 지수
                      </span>
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 opacity-30 grayscale ${
                    shareTheme === "light" ? "text-neutral-900" : "text-white"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">
                    Hang on!
                  </span>
                </div>
              </div>

              {/* Main Content: Focused Value & Graph */}
              <div className="flex-1 flex flex-col items-center justify-center pt-2">
                <div className="text-center mb-4">
                  <div
                    className={`text-6xl font-black tracking-tighter tabular-nums leading-none ${
                      shareTheme === "light" ? "text-neutral-900" : "text-white"
                    }`}
                  >
                    {data.value}
                  </div>
                  <div
                    className={`flex items-center justify-center gap-2 mt-3 px-3 py-1 rounded-full font-black text-[12px] ${
                      isUp
                        ? "bg-rose-500/10 text-rose-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    <span>
                      {isUp ? "+" : "-"}
                      {Math.abs(parseFloat(data.change || "0")).toFixed(2)}
                    </span>
                    <span className="opacity-70">({data.changePercent})</span>
                  </div>
                </div>

                {/* Graph Section */}
                <div className="w-full h-44 mt-2 px-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.history}>
                      <YAxis domain={["auto", "auto"]} hide />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={isUp ? "#f43f5e" : "#3b82f6"}
                        strokeWidth={4}
                        dot={false}
                        animationDuration={0}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 text-center">
                  <p
                    className={`text-[11px] font-black uppercase tracking-[0.3em] opacity-40 ${
                      shareTheme === "light" ? "text-neutral-900" : "text-white"
                    }`}
                  >
                    Recent 5 Days Trend
                  </p>
                </div>
              </div>

              {/* Bottom: App Link & CTA */}
              <div className="mt-auto relative z-10 flex justify-center shrink-0">
                <p
                  className={`text-[13px] font-black tracking-tighter opacity-20 ${
                    shareTheme === "light" ? "text-neutral-900" : "text-white"
                  }`}
                >
                  www.hangon.co.kr
                </p>
              </div>
            </div>
          </div>
        </div>

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
