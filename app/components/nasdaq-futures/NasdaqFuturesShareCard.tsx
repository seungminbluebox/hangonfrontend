"use client";

import React, { useRef, useState, useEffect } from "react";
import { toBlob } from "html-to-image";
import {
  Download,
  Copy,
  Check,
  Share2,
  X,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { MarketData } from "../../lib/market";

interface NasdaqFuturesShareCardProps {
  data: MarketData;
  onClose: () => void;
}

export function NasdaqFuturesShareCard({
  data,
  onClose,
}: NasdaqFuturesShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [shareTheme, setShareTheme] = useState<"light" | "dark">("dark");

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
        width: "330px",
        height: "500px",
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
      saveAs(blob, `hangon-nasdaq-futures.png`);
    }
    setIsExporting(false);
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
      console.error("복사 실패:", err);
    }
  };

  const handleWebShare = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const file = new File([blob], "nasdaq-share.png", { type: "image/png" });
    try {
      await navigator.share({
        files: [file],
        title: "[HangOn] 나스닥 선물 실시간 리포트",
        text: `나스닥 선물 지수: ${data.value} (${data.changePercent})`,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        console.error("공유 실패:", err);
    }
  };

  const isUp = data.isUp;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base italic tracking-tight">
              나스닥 선물 리포트 공유
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-6">
          {/* Card Preview */}
          <div className="relative group shrink-0">
            <div className="scale-[0.85] xs:scale-90 sm:scale-100 origin-center shrink-0">
              <div
                ref={cardRef}
                className={`w-[330px] h-[500px] p-7 rounded-[35px] shadow-2xl relative overflow-hidden transition-colors duration-300 border flex flex-col justify-between ${
                  shareTheme === "light"
                    ? "bg-[#F8F7F4] text-neutral-900 border-neutral-100"
                    : "bg-[#0f172a] text-white border-white/5"
                }`}
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

                <div className="p-0 pt-2 flex-1 flex flex-col relative z-10">
                  <h2
                    className={`text-xl font-black italic mb-6 leading-tight ${shareTheme === "dark" ? "text-white" : "text-slate-900"}`}
                  >
                    Nasdaq 100 Futures
                  </h2>

                  <div className="space-y-6">
                    <div
                      className={`p-5 rounded-3xl ${shareTheme === "dark" ? "bg-white/5 border border-white/5" : "bg-white border border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          Live
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-4xl font-black tracking-tighter">
                          {data.value}
                        </span>
                        <span className="text-sm font-bold opacity-40 italic">
                          USD
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs font-black ${isUp ? "text-red-500" : "text-blue-500"}`}
                      >
                        {isUp ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {data.change} ({data.changePercent})
                      </div>

                      <div className="h-24 mt-6 -mx-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.history}>
                            <defs>
                              <linearGradient
                                id="colorValue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor={isUp ? "#ef4444" : "#3b82f6"}
                                  stopOpacity={0.1}
                                />
                                <stop
                                  offset="95%"
                                  stopColor={isUp ? "#ef4444" : "#3b82f6"}
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke={isUp ? "#ef4444" : "#3b82f6"}
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorValue)"
                              dot={false}
                            />
                            <YAxis
                              hide
                              domain={["dataMin - 10", "dataMax + 10"]}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Insight Marker */}
                  <div className="mt-6 pt-6 border-t border-dashed opacity-50 border-gray-400">
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-black uppercase letter-spacing-1">
                      <Activity className="w-3 h-3 text-accent" />
                      Market Pulse
                    </div>
                    <p
                      className={`text-[11px] font-bold leading-relaxed ${shareTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}
                    >
                      미국 기술주의 미래를 보여주는 실시간 시장 지표입니다.
                    </p>
                  </div>

                  {/* Bottom: App Link & CTA */}
                  <div className="mt-auto relative z-10 flex justify-center pt-2">
                    <p
                      className={`text-[13px] font-black tracking-tighter opacity-30 ${
                        shareTheme === "light"
                          ? "text-neutral-900"
                          : "text-white"
                      }`}
                    >
                      www.hangon.co.kr
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border-subtle bg-muted/20 flex flex-col gap-3 shrink-0">
          <div className="flex gap-2 p-1 bg-secondary rounded-2xl border border-border-subtle mb-1">
            <button
              onClick={() => setShareTheme("light")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                shareTheme === "light"
                  ? "bg-white shadow-sm text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              라이트 모드
            </button>
            <button
              onClick={() => setShareTheme("dark")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                shareTheme === "dark"
                  ? "bg-neutral-800 shadow-sm text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              다크 모드
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background rounded-2xl font-black text-xs hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              이미지 저장
            </button>
            {canShare ? (
              <button
                onClick={handleWebShare}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-2xl font-black text-xs hover:bg-blue-600 transition-all"
              >
                <Share2 className="w-4 h-4" />
                SNS 공유
              </button>
            ) : (
              <button
                onClick={handleCopyImage}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary border border-border-subtle rounded-2xl font-black text-xs hover:bg-muted transition-all"
              >
                {isImageCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500">복사 완료</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    이미지 복사
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
