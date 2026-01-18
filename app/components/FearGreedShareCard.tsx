"use client";

import React, { useRef, useState, useEffect } from "react";
import { toBlob } from "html-to-image";
import {
  Download,
  Copy,
  Check,
  Share2,
  X,
  BrainCircuit,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

interface FearGreedData {
  value: number;
  description: string;
  title: string;
  analysis: string;
  advice: string[];
  updated_at: string;
}

interface FearGreedShareCardProps {
  data: FearGreedData;
  onClose: () => void;
}

export function FearGreedShareCard({ data, onClose }: FearGreedShareCardProps) {
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

    // html-to-image can be sensitive to parent scales and scroll positions.
    // We force a neutral state for the capture.
    return await toBlob(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      width: 330,
      height: 560,
      backgroundColor: "rgba(0,0,0,0)", // 투명 배경 설정
      style: {
        transform: "none",
        margin: "0",
        left: "0",
        top: "0",
        position: "relative",
        borderRadius: "35px",
        boxShadow: "none",
        border: "none",
        backgroundColor: shareTheme === "light" ? "#F8F7F4" : "#0f172a", // 카드 자체 배경색은 유지
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
        `hangon-fear-greed-${new Date().toISOString().split("T")[0]}.png`,
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

    const file = new File([blob], "market-mood.png", { type: "image/png" });

    try {
      await navigator.share({
        files: [file],
        title: "[Hang on!] 공포와 탐욕 지수 분석",
        text: `${data.title}\n현재 지수: ${data.value} (${data.description})`,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        console.error("공유 실패:", err);
    }
  };

  const getStatusColor = (value: number) => {
    if (value <= 25) return "#ef4444";
    if (value <= 45) return "#f97316";
    if (value <= 55) return "#eab308";
    if (value <= 75) return "#10b981";
    return "#22c55e";
  };

  const statusColor = getStatusColor(data.value);
  const needleRotation = (data.value / 100) * 180 - 90;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base">공탐지수 리포트 공유</h3>
            <p className="text-[10px] text-text-muted font-medium">
              현재 시장 심리를 한 장에 예쁘게 담았습니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 bg-black/[0.02] dark:bg-white/[0.02] overflow-y-auto flex-1 flex flex-col items-center">
          {/* Container for scaled preview - Aligning more naturally with padding */}
          <div className="pt-8 pb-12 flex flex-col items-center scale-[0.7] xs:scale-[0.85] sm:scale-100 origin-top transition-all duration-300">
            {/* Card Content - Optimized for 3:4 Fill with Single Insight */}
            <div
              ref={cardRef}
              className={`w-[330px] h-[560px] p-7 rounded-[35px] shadow-2xl relative overflow-hidden transition-colors duration-300 border flex flex-col justify-between ${
                shareTheme === "light"
                  ? "bg-[#F8F7F4] text-neutral-900 border-neutral-100"
                  : "bg-[#0f172a] text-white border-white/5"
              }`}
            >
              {/* Header: Date and Logo - Moved into flow to prevent capture clipping */}
              <div className="flex justify-between items-center mb-2">
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    shareTheme === "light"
                      ? "text-neutral-400"
                      : "text-white/40"
                  }`}
                >
                  {new Date(data.updated_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
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

              <div className="flex flex-col gap-4 flex-1 justify-center">
                <div
                  className={`flex flex-col items-center justify-center pt-6 pb-4 rounded-[3rem] border shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden ${
                    shareTheme === "light"
                      ? "bg-white/80 border-white"
                      : "bg-white/[0.03] border-white/10"
                  }`}
                >
                  <div
                    className={`absolute inset-0 pointer-events-none ${
                      shareTheme === "light"
                        ? "bg-gradient-to-b from-white to-transparent opacity-50"
                        : "bg-gradient-to-b from-white/10 to-transparent opacity-20"
                    }`}
                  />
                  <div className="relative w-52 h-26 overflow-hidden z-10 scale-[1.05] origin-bottom transition-transform">
                    <svg
                      className="absolute top-0 left-0 w-52 h-52 -rotate-180"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={
                          shareTheme === "light"
                            ? "#f1f5f9"
                            : "rgba(255,255,255,0.05)"
                        }
                        strokeWidth="8"
                        strokeDasharray="132 264"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="10"
                        strokeDasharray="33 264"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="10"
                        strokeDasharray="26 264"
                        strokeDashoffset="-33"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#eab308"
                        strokeWidth="10"
                        strokeDasharray="14 264"
                        strokeDashoffset="-59"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeDasharray="26 264"
                        strokeDashoffset="-73"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="10"
                        strokeDasharray="33 264"
                        strokeDashoffset="-99"
                      />
                    </svg>
                    <div
                      className={`absolute bottom-0 left-1/2 w-0.5 h-20 -translate-x-1/2 origin-bottom transition-all duration-1000 z-20 ${
                        shareTheme === "light" ? "bg-neutral-900" : "bg-white"
                      }`}
                      style={{
                        transform: `translateX(-50%) rotate(${needleRotation}deg)`,
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      }}
                    />
                    <div
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full z-30 shadow-md border-[3px] ${
                        shareTheme === "light"
                          ? "bg-white border-neutral-900"
                          : "bg-[#0f172a] border-white"
                      }`}
                    />
                  </div>
                  <div className="mt-4 text-center z-10">
                    <div
                      className="text-6xl font-black tracking-tighter tabular-nums"
                      style={{
                        color: statusColor,
                        filter:
                          shareTheme === "light"
                            ? "drop-shadow(0 4px 12px rgba(0,0,0,0.08))"
                            : "none",
                      }}
                    >
                      {Math.round(data.value)}
                    </div>
                    <div
                      className="text-[10px] font-black uppercase tracking-[0.4em] mt-1 opacity-90"
                      style={{ color: statusColor }}
                    >
                      {data.description === "greed"
                        ? "Greed"
                        : data.description === "extreme greed"
                          ? "Extreme Greed"
                          : data.description === "fear"
                            ? "Fear"
                            : data.description === "extreme fear"
                              ? "Extreme Fear"
                              : "Neutral"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 px-2 text-center">
                  <h3
                    className={`text-[20px] font-black italic leading-tight tracking-tighter break-keep transition-colors ${
                      shareTheme === "light" ? "text-neutral-900" : "text-white"
                    }`}
                  >
                    "{data.title}"
                  </h3>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div
                  className={`rounded-[2.2rem] mt-0 p-4 border shadow-inner transition-colors duration-300 ${
                    shareTheme === "light"
                      ? "bg-black/[0.03] border-black/[0.05]"
                      : "bg-white/[0.07] border-white/10"
                  }`}
                >
                  <div className="space-y-2.5">
                    {data.advice.slice(0, 1).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="mt-1.5 w-1.2 h-1.2 rounded-full bg-accent/30 shrink-0" />
                        <p
                          className={`text-[13.5px] font-bold leading-relaxed tracking-tight break-keep ${
                            shareTheme === "light"
                              ? "text-neutral-700"
                              : "text-white/80"
                          }`}
                        >
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`pt-4 flex items-center justify-between border-t transition-all ${
                    shareTheme === "light"
                      ? "border-neutral-100"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <p
                      className={`text-[8px] font-black leading-none ${
                        shareTheme === "light"
                          ? "text-neutral-400"
                          : "text-white/30"
                      }`}
                    >
                      더 상세한 분석은?
                    </p>
                    <p
                      className={`text-[13px] font-black tracking-tighter mt-1 transition-colors  ${
                        shareTheme === "light"
                          ? "text-neutral-900"
                          : "text-white"
                      }`}
                      style={{
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    >
                      www.hangon.co.kr
                    </p>
                  </div>
                  <div>
                    <TrendingUp
                      className={`w-5 h-5 ${
                        shareTheme === "light"
                          ? "text-neutral-200"
                          : "text-white/20"
                      }`}
                    />
                  </div>
                </div>
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
          <p className="text-[10px] text-text-muted text-center mt-1 font-medium italic">
            * 3대4 비율로 인스타그램 공유에 최적화되어 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
