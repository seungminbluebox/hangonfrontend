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
  ArrowUpRight,
  ArrowDownRight,
  Info,
  RefreshCcw,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { MarketData } from "../../lib/market";

interface CurrencyItem {
  price: number;
  change: number;
  prev_close: number;
  history?: { date: string; value: number }[];
}

interface CurrencyData {
  currency_data: Record<string, CurrencyItem>;
  title: string;
  analysis: string;
}

interface CurrencyShareCardProps {
  data: CurrencyData;
  liveData?: MarketData;
  onClose: () => void;
}

export function CurrencyShareCard({
  data,
  liveData,
  onClose,
}: CurrencyShareCardProps) {
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
        width: "320px",
        backgroundColor: shareTheme === "light" ? "#F8F7F4" : "#0f172a",
        borderRadius: "35px",
        boxShadow: "none",
        border: "none",
        position: "relative",
      },
    });
  };

  const handleDownload = async () => {
    setIsExporting(true);
    const blob = await getBlob();
    if (blob) {
      // @ts-ignore
      const { saveAs } = await import("file-saver");
      saveAs(blob, `hangon-currency-share.png`);
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
    const file = new File([blob], "currency-share.png", { type: "image/png" });
    try {
      await navigator.share({
        files: [file],
        title: "[HangOn] 글로벌 환율 리포트",
        text: `${data.title}`,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        console.error("공유 실패:", err);
    }
  };

  const usdData = data.currency_data["USD/KRW"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base">환율 분석 리포트 공유</h3>
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
              className={`w-[360px] h-[500px] p-7 rounded-[35px] shadow-2xl relative overflow-hidden transition-colors duration-300 border flex flex-col justify-between ${
                shareTheme === "light"
                  ? "bg-[#F8F7F4] text-neutral-900 border-neutral-100"
                  : "bg-[#0f172a] text-white border-white/5"
              }`}
            >
              {/* Header: Date and Logo */}
              <div className="flex justify-between items-center mb-2">
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    shareTheme === "light"
                      ? "text-neutral-400"
                      : "text-white/40"
                  }`}
                >
                  {new Date().toLocaleDateString("ko-KR")}
                </p>
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

              <div className="flex flex-col flex-1">
                <h2
                  className={`text-xl font-black italic mb-6 leading-tight ${
                    shareTheme === "light" ? "text-slate-900" : "text-white"
                  }`}
                >
                  USD/KRW 추이
                </h2>

                {usdData && (
                  <div className="space-y-6">
                    <div
                      className={`p-5 rounded-3xl ${shareTheme === "dark" ? "bg-white/5 border border-white/5" : "bg-white border border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase">
                          Live
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-4xl font-black tracking-tighter">
                          {liveData
                            ? Math.floor(
                                parseFloat(liveData.value.replace(/,/g, "")),
                              ).toLocaleString()
                            : Math.floor(usdData.price).toLocaleString()}
                        </span>
                        <span className="text-sm font-bold opacity-40 italic">
                          KRW
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs font-black ${
                          liveData
                            ? liveData.isUp
                              ? "text-red-500"
                              : "text-blue-500"
                            : usdData.change >= 0
                              ? "text-red-500"
                              : "text-blue-500"
                        }`}
                      >
                        {liveData ? (
                          liveData.isUp ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )
                        ) : usdData.change >= 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {liveData
                          ? liveData.changePercent
                              .replace("+", "")
                              .replace("-", "")
                          : Math.abs(usdData.change) + "%"}{" "}
                        (전일대비)
                      </div>

                      <div className="h-20 mt-6 -mx-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={liveData ? liveData.history : usdData.history}
                          >
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={
                                liveData
                                  ? liveData.isUp
                                    ? "#ef4444"
                                    : "#3b82f6"
                                  : usdData.change >= 0
                                    ? "#ef4444"
                                    : "#3b82f6"
                              }
                              strokeWidth={3}
                              dot={false}
                            />
                            <YAxis
                              hide
                              domain={["dataMin - 1", "dataMax + 1"]}
                              tickFormatter={(value) =>
                                Math.floor(value).toLocaleString()
                              }
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Analysis Highlight */}
                <div className="mt-6 pt-6 border-t border-dashed opacity-50 border-gray-400">
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-black uppercase letter-spacing-1">
                    <TrendingUp className="w-3 h-3 text-blue-500" />
                    Insight
                  </div>
                  <p
                    className={`text-[11px] font-bold leading-relaxed ${shareTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {(() => {
                      const lines = data.analysis
                        .split("\n")
                        .filter((line) => line.trim().length > 0);
                      return (
                        lines[2] ||
                        lines[0] ||
                        "현재 환율 시장의 변동성을 유의하세요."
                      );
                    })()}
                  </p>
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
              className="flex items-center justify-center gap-2 bg-secondary text-foreground p-3.5 rounded-2xl font-black text-sm hover:opacity-90 transition-all disabled:opacity-50 border border-border-subtle shadow-sm"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "저장 중..." : "이미지 저장"}
            </button>
            <button
              onClick={handleCopyImage}
              className="flex items-center justify-center gap-2 bg-secondary text-foreground p-3.5 rounded-2xl font-black text-sm hover:opacity-90 transition-all border border-border-subtle shadow-sm"
            >
              {isImageCopied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {isImageCopied ? "복사됨!" : "이미지 복사"}
            </button>
          </div>
          {canShare && (
            <button
              onClick={handleWebShare}
              className="flex items-center justify-center gap-2 bg-accent text-white p-3.5 rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-accent/20"
            >
              <Share2 className="w-4 h-4" />
              공유하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
