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
  onClose: () => void;
}

export function CurrencyShareCard({ data, onClose }: CurrencyShareCardProps) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-[400px] rounded-[2.5rem] border border-border overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-border">
          <h3 className="text-m font-black ">환율 분석 리포트</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Preview Canvas */}
        <div className="p-6 pb-2 flex justify-center bg-secondary/30">
          <div
            ref={cardRef}
            className={`w-[320px] rounded-[35px] overflow-hidden transition-colors duration-300 ${
              shareTheme === "light"
                ? "bg-[#F8F7F4] text-slate-900"
                : "bg-[#0f172a] text-slate-50"
            }`}
          >
            {/* Branding Header */}
            <div
              className={`p-6 pb-2 flex items-center justify-between ${shareTheme === "dark" ? "border-slate-800" : "border-slate-200"}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`text-sm font-black italic tracking-tighter ${shareTheme === "dark" ? "text-slate-200" : "text-slate-800"}`}
                >
                  www.hangon.co.kr
                </span>
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${shareTheme === "dark" ? "text-slate-500" : "text-slate-400"}`}
              >
                {new Date().toLocaleDateString("ko-KR")}
              </span>
            </div>

            <div className="p-6 pt-2">
              <h2
                className={`text-xl font-black italic mb-6 leading-tight ${shareTheme === "dark" ? "text-white" : "text-slate-900"}`}
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
                        {Math.floor(usdData.price).toLocaleString()}
                      </span>
                      <span className="text-sm font-bold opacity-40 italic">
                        KRW
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-black ${usdData.change >= 0 ? "text-rose-500" : "text-emerald-500"}`}
                    >
                      {usdData.change >= 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {Math.abs(usdData.change)}% (전일대비)
                    </div>

                    <div className="h-20 mt-6 -mx-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={usdData.history}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={false}
                          />
                          <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
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
            </div>
          </div>
        </div>

        {/* Theme Toggle & Action Buttons */}
        <div className="p-6 space-y-4 bg-secondary/30">
          <div className="flex justify-center">
            <div className="flex bg-background/50 p-1 rounded-xl w-full max-w-[200px]">
              <button
                onClick={() => setShareTheme("light")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                  shareTheme === "light"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setShareTheme("dark")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                  shareTheme === "dark"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/40 hover:text-foreground"
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyImage}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 py-3 bg-card hover:bg-secondary rounded-2xl text-sm font-black transition-all border border-border"
            >
              {isImageCopied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              이미지 복사
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-sm font-black transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              이미지 저장
            </button>

            {canShare && (
              <button
                onClick={handleWebShare}
                disabled={isExporting}
                className="col-span-2 flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 rounded-2xl text-sm font-black transition-all"
              >
                <Share2 className="w-4 h-4" />
                공유
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
