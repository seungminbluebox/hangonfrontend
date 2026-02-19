"use client";

import React, { useRef, useState, useEffect } from "react";
import { toBlob } from "html-to-image";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  XAxis,
  ReferenceLine,
} from "recharts";
import {
  Download,
  Copy,
  Check,
  Share2,
  X,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Sparkles,
  Zap,
  Lightbulb,
  Info,
  Wand2,
} from "lucide-react";

interface PutCallRatioShareCardProps {
  data: {
    latestVal: number;
    latestDate: string;
    isExtremeFear: boolean;
    isExtremeGreed: boolean;
    history: any[];
    analysis: {
      title: string;
      summary: string;
      recommendation: string[];
    } | null;
  };
  onClose: () => void;
}

export function PutCallRatioShareCard({
  data,
  onClose,
}: PutCallRatioShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [shareTheme, setShareTheme] = useState<"light" | "dark">("light");

  // Get status-based theme colors
  const statusTheme = data.isExtremeFear
    ? {
        label: "바닥권 (FEAR)",
        badgeBg: "bg-red-500",
        badgeShadow: "shadow-red-500/20",
        accent: "text-red-500",
        chart: "#ef4444",
        glow: "bg-red-500",
      }
    : data.isExtremeGreed
      ? {
          label: "고점권 (GREED)",
          badgeBg: "bg-emerald-500",
          badgeShadow: "shadow-emerald-500/20",
          accent: "text-emerald-500",
          chart: "#10b981",
          glow: "bg-emerald-500",
        }
      : {
          label: "중립 (NEUTRAL)",
          badgeBg: "bg-blue-500",
          badgeShadow: "shadow-blue-500/20",
          accent: "text-blue-500",
          chart: "#3b82f6",
          glow: "bg-blue-500",
        };

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
        height: "540px",
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
      saveAs(blob, `hangon-pcr-${new Date().toISOString().split("T")[0]}.png`);
    }
    setIsExporting(false);
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

    const file = new File([blob], "hangon-pcr.png", { type: "image/png" });

    try {
      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `[Hang on!] ${data.analysis?.title || "시장 풋/콜 비율 분석"}`,
          text:
            data.analysis?.summary ||
            "미국 증시 풋/콜 비율 데이터 분석 결과입니다.",
        });
      } else if (typeof navigator.share === "function") {
        await navigator.share({
          title: `[Hang on!] ${data.analysis?.title || "시장 풋/콜 비율 분석"}`,
          text: `${data.analysis?.title}\n\n${data.analysis?.summary}`,
          url: window.location.href,
        });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("공유 실패:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base italic">풋/콜 리포트 공유</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 bg-black/[0.02] dark:bg-white/[0.02] overflow-y-auto flex-1 flex flex-col items-center">
          <div className="pt-8 pb-12 flex flex-col items-center scale-[0.65] xs:scale-[0.8] sm:scale-95 origin-top transition-all duration-300">
            <div
              ref={cardRef}
              className={`w-[360px] h-[540px] p-7 rounded-[35px] shadow-2xl relative overflow-hidden transition-colors duration-300 border flex flex-col justify-between ${
                shareTheme === "light"
                  ? "bg-[#F8F7F4] text-neutral-900 border-neutral-100"
                  : "bg-[#0f172a] text-white border-white/5"
              }`}
            >
              {/* Decorative Background Elements */}
              <div
                className={`absolute top-[-10%] right-[-10%] w-[200px] h-[200px] rounded-full blur-[80px] opacity-20 ${statusTheme.glow}`}
              />

              {/* Header */}
              <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col">
                  <p
                    className={`text-[10px] font-bold ${
                      shareTheme === "light"
                        ? "text-neutral-900/40"
                        : "text-white/20"
                    }`}
                  >
                    {data.latestDate} 기준
                  </p>
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

              {/* Main Content */}
              <div className="flex flex-col gap-4 relative z-10 flex-1 justify-center py-2">
                {/* Value Display */}
                <div className="flex flex-col items-center">
                  <div className="mb-1 text-center">
                    <p
                      className={`text-[18px] font-black italic tracking-widest leading-none ${statusTheme.accent}`}
                    >
                      미국 증시 풋/콜 비율 (PCR)
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h1 className="text-[84px] font-black italic tracking-tighter leading-none mb-2">
                      {data.latestVal.toFixed(2)}
                    </h1>
                  </div>
                  <div
                    className={`px-6 py-2 rounded-full text-[13px] font-black uppercase tracking-[0.2em] shadow-lg text-white ${statusTheme.badgeBg} ${statusTheme.badgeShadow}`}
                  >
                    {statusTheme.label}
                  </div>
                </div>

                {/* Trend Graph */}
                <div className="h-28 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.history.slice(-20)}
                      margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="shareColor"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={statusTheme.chart}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={statusTheme.chart}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <YAxis
                        domain={["dataMin - 0.02", "dataMax + 0.02"]}
                        hide
                      />
                      <ReferenceLine
                        y={0.85}
                        stroke={
                          shareTheme === "light"
                            ? "rgba(0,0,0,0.25)"
                            : "rgba(255,255,255,0.25)"
                        }
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{
                          value: "",
                          position: "insideBottomRight",
                          fill:
                            shareTheme === "light"
                              ? "rgba(0,0,0,0.3)"
                              : "rgba(255,255,255,0.3)",
                          fontSize: 9,
                          fontWeight: 800,
                          offset: 5,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={statusTheme.chart}
                        strokeWidth={2}
                        fill="url(#shareColor)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* AI Analysis Box */}
                {data.analysis && (
                  <div
                    className={`px-5 py-5 rounded-[2.5rem] border shadow-sm ${
                      shareTheme === "light"
                        ? "bg-white border-neutral-100"
                        : "bg-white/[0.03] border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-3 flex-nowrap">
                      <Lightbulb
                        className={`w-3.5 h-3.5 shrink-0 ${statusTheme.accent}`}
                      />
                      <h4 className="text-[12px] font-black italic tracking-tight">
                        {data.analysis.title}
                      </h4>
                    </div>
                    <p
                      className={`text-[10px] font-bold leading-relaxed ${
                        shareTheme === "light"
                          ? "text-neutral-500"
                          : "text-white/60"
                      }`}
                    >
                      {data.analysis.summary}
                    </p>
                  </div>
                )}
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
