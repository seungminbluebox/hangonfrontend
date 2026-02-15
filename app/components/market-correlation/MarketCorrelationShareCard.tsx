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
  Activity,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

interface ShareCardProps {
  data: {
    date: string;
    value: number;
    status: string;
    desc: string;
    kospi: { value: number; change: number };
    sp500: { value: number; change: number };
  };
  onClose: () => void;
}

export function MarketCorrelationShareCard({ data, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
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
        `hangon-correlation-${new Date().toISOString().split("T")[0]}.png`,
      );
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
      console.error("이미지 복사 실패:", err);
    }
  };

  const handleWebShare = async () => {
    const blob = await getBlob();
    if (!blob) return;

    const file = new File([blob], "market-correlation.png", {
      type: "image/png",
    });

    try {
      await navigator.share({
        files: [file],
        title: "[Hang on!] 한-미 증시 동조화 리포트",
        text: `현재 상관계수: ${data.value.toFixed(4)} (${data.status})\n한-미 양국 시장 흐름을 분석했습니다.`,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        console.error("공유 실패:", err);
    }
  };

  // Logic for dynamic status badge colors
  const getStatusColor = (val: number) => {
    if (val > 0.6) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (val > 0.2)
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    if (val > -0.2) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    return "text-purple-500 bg-purple-500/10 border-purple-500/20";
  };

  // Pointer logic (matching Tracker)
  const currentCorr = data.value;
  const pointerLeft =
    currentCorr >= 0.2
      ? 50 + ((currentCorr - 0.2) / 0.8) * 50
      : 50 - ((0.2 - currentCorr) / 1.2) * 50;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base">동조화 리포트 공유</h3>
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
            {/* Shareable Card Content */}
            <div
              ref={cardRef}
              className={`w-[360px] h-[540px] p-7 rounded-[35px] shadow-2xl relative overflow-hidden transition-colors duration-300 border flex flex-col justify-between ${
                shareTheme === "light"
                  ? "bg-[#F8F7F4] text-neutral-900 border-neutral-100"
                  : "bg-[#0f172a] text-white border-white/5"
              }`}
            >
              {/* Header: Date & Branding */}
              <div className="flex justify-between items-start shrink-0">
                <div className="flex flex-col">
                  <p
                    className={`text-[10px] font-black uppercase tracking-wider ${shareTheme === "light" ? "text-neutral-400" : "text-white/40"}`}
                  >
                    {data.date} 기준
                  </p>
                  <p
                    className={`text-[8px] font-bold ${shareTheme === "light" ? "text-neutral-300" : "text-white/20"}`}
                  >
                    [양국 마지막 동시 운영일 기준]
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1.5 opacity-30 grayscale ${shareTheme === "light" ? "text-neutral-900" : "text-white"}`}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">
                    Hang on!
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col pt-4 gap-4">
                {/* Visual Badge Update */}
                <div className="flex">
                  <div
                    className={`px-3 py-1.5 rounded-xl border-b-2 shadow-sm ${shareTheme === "light" ? "bg-white border-blue-600 text-blue-600" : "bg-blue-600 border-blue-400 text-white"}`}
                  >
                    <span className="text-[11px] font-black tracking-tight">
                      한-미 양국 커플링 지수
                    </span>
                  </div>
                </div>

                {/* Score & Dynamic Status Badge */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-5xl font-black italic tracking-tighter tabular-nums leading-none">
                      {data.value.toFixed(4)}
                    </h2>
                    <div
                      className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-black border",
                        getStatusColor(data.value),
                      )}
                    >
                      {data.status}
                    </div>
                  </div>
                  <p
                    className={`text-[11px] font-bold leading-relaxed w-full ${shareTheme === "light" ? "text-neutral-500" : "text-white/50"}`}
                  >
                    {data.desc}
                  </p>
                </div>

                {/* Gauge Bar (Thicker & Precise Pointer Position with Halo) */}
                <div className="relative pt-8 pb-2">
                  {/* Pointer Container (With Halo/Glow Effect) */}
                  <div
                    className="absolute top-[32px] -translate-y-full transition-all duration-700 z-30 flex items-center justify-center"
                    style={{
                      left: `${pointerLeft}%`,
                      transform: "translateX(-50%)",
                      filter:
                        shareTheme === "light"
                          ? "drop-shadow(0 0 6px rgba(0,0,0,0.3))"
                          : "drop-shadow(0 0 10px rgba(255,255,255,0.6))",
                    }}
                  >
                    <div
                      className={clsx(
                        "w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px]",
                        shareTheme === "light"
                          ? "border-t-neutral-900"
                          : "border-t-white",
                      )}
                    />
                  </div>

                  <div className="relative h-6 w-full flex rounded-full overflow-hidden bg-black/5 border border-black/10 shadow-inner">
                    <div
                      className="h-full flex opacity-60"
                      style={{ width: "50%" }}
                    >
                      <div
                        className="h-full bg-purple-600"
                        style={{ width: "66.6%" }}
                      />
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: "33.4%" }}
                      />
                    </div>
                    <div
                      className="h-full flex opacity-60"
                      style={{ width: "50%" }}
                    >
                      <div
                        className="h-full bg-orange-600"
                        style={{ width: "50%" }}
                      />
                      <div
                        className="h-full bg-red-600"
                        style={{ width: "50%" }}
                      />
                    </div>
                    {/* Midpoint line */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white z-20 shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
                  </div>

                  {/* Gauge Labels (Korean & Larger) */}
                  <div className="flex justify-between mt-2 px-0.5">
                    <span
                      className={`text-[9px] font-black ${shareTheme === "light" ? "text-neutral-400" : "text-white/40"}`}
                    >
                      -1.0 역동조화
                    </span>
                    <span
                      className={`text-[10px] font-black ${shareTheme === "light" ? "text-neutral-900" : "text-white"}`}
                    >
                      0.2 중립
                    </span>
                    <span
                      className={`text-[9px] font-black ${shareTheme === "light" ? "text-neutral-400" : "text-white/40"}`}
                    >
                      +1.0 동조화
                    </span>
                  </div>
                </div>

                {/* Market Data Grid (One row, two columns) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    className={`p-3.5 rounded-2xl border transition-colors ${shareTheme === "light" ? "bg-white border-neutral-100" : "bg-white/5 border-white/5"}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[8px] font-black uppercase ${shareTheme === "light" ? "text-neutral-400" : "text-white/40"}`}
                        >
                          KOSPI (T)
                        </span>
                        <div
                          className={`px-1.5 py-0.5 rounded-lg font-black text-[9px] italic ${shareTheme === "light" ? "bg-neutral-50 text-neutral-400" : "bg-white/10 text-white/40"}`}
                        >
                          KR
                        </div>
                      </div>
                      <p className="text-[17px] font-black italic tabular-nums leading-tight tracking-tighter">
                        {data.kospi.value.toLocaleString()}
                      </p>
                      <div
                        className={clsx(
                          "text-[9px] font-black inline-block px-1.5 py-0.5 rounded",
                          data.kospi.change > 0
                            ? "text-red-500 bg-red-500/10"
                            : "text-blue-500 bg-blue-500/10",
                        )}
                      >
                        {data.kospi.change > 0 ? "+" : ""}
                        {data.kospi.change}%
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border transition-colors ${shareTheme === "light" ? "bg-white border-neutral-100" : "bg-white/5 border-white/5"}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[8px] font-black uppercase ${shareTheme === "light" ? "text-neutral-400" : "text-white/40"}`}
                        >
                          S&P 500 (T-1)
                        </span>
                        <div
                          className={`px-1.5 py-0.5 rounded-lg font-black text-[9px] italic ${shareTheme === "light" ? "bg-neutral-50 text-neutral-400" : "bg-white/10 text-white/40"}`}
                        >
                          US
                        </div>
                      </div>
                      <p className="text-[17px] font-black italic tabular-nums leading-tight tracking-tighter">
                        {data.sp500.value.toLocaleString()}
                      </p>
                      <div
                        className={clsx(
                          "text-[9px] font-black inline-block px-1.5 py-0.5 rounded",
                          data.sp500.change > 0
                            ? "text-red-500 bg-red-500/10"
                            : "text-blue-500 bg-blue-500/10",
                        )}
                      >
                        {data.sp500.change > 0 ? "+" : ""}
                        {data.sp500.change}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Insight */}
                <div
                  className={`mt-auto pt-4 border-t border-dashed ${shareTheme === "light" ? "border-neutral-200" : "border-white/10"}`}
                >
                  <p
                    className={`text-[8px] font-bold leading-relaxed ${shareTheme === "light" ? "text-neutral-400" : "text-white/30"}`}
                  >
                    * 양국 증시 개장일 기준 데이터 (휴장 시 업데이트 제외)
                  </p>
                </div>
              </div>

              {/* Branding Footer */}
              <div className="flex justify-center shrink-0 pt-4">
                <span
                  className={`text-[12px] font-black tracking-tighter opacity-20 ${shareTheme === "light" ? "text-neutral-900" : "text-white"}`}
                >
                  www.hangon.co.kr
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border-subtle bg-muted/10 shrink-0 space-y-4">
          <div className="flex items-center justify-between bg-muted/30 p-1.5 rounded-2xl border border-border-subtle">
            <button
              onClick={() => setShareTheme("light")}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${shareTheme === "light" ? "bg-white shadow-sm text-black" : "text-text-muted hover:text-foreground"}`}
            >
              Light
            </button>
            <button
              onClick={() => setShareTheme("dark")}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${shareTheme === "dark" ? "bg-neutral-800 shadow-sm text-white" : "text-text-muted hover:text-foreground"}`}
            >
              Dark
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyImage}
              className="flex items-center justify-center gap-2 h-12 bg-secondary text-foreground font-black text-xs rounded-2xl border border-border-subtle hover:bg-muted transition-all active:scale-95"
            >
              {isImageCopied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {isImageCopied ? "복사됨!" : "이미지 복사"}
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 h-12 bg-foreground text-background font-black text-xs rounded-2xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExporting ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              이미지 저장
            </button>
          </div>

          {canShare && (
            <button
              onClick={handleWebShare}
              className="w-full flex items-center justify-center gap-2 h-14 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <Share2 className="w-5 h-5" />
              스마트폰 공유하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
