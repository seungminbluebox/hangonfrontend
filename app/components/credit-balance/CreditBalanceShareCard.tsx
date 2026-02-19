"use client";

import React, { useRef, useState, useEffect } from "react";
import { toBlob } from "html-to-image";
import {
  Download,
  Share2,
  X,
  Activity,
  Zap,
  Wallet,
  BarChart3,
  Cpu,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  Line,
  ComposedChart,
  XAxis,
  Legend,
} from "recharts";

interface CreditHistory {
  date: string;
  total: number;
  customer_deposit: number;
}

interface ShareCardProps {
  data: {
    latestVal: number;
    latestDate: string;
    score: number;
    history: CreditHistory[];
    analysis: any;
  };
  onClose: () => void;
}

export function CreditBalanceShareCard({ data, onClose }: ShareCardProps) {
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
      saveAs(blob, `hangon-credit-ready-${data.latestDate}.png`);
    }
    setIsExporting(false);
  };

  const handleWebShare = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const file = new File([blob], "credit-share.png", { type: "image/png" });
    try {
      await navigator.share({
        files: [file],
        title: "[HangOn] 국내 증시 수급 리포트",
        text: `예탁금 대비 신용 비중: ${data.latestVal.toFixed(1)}% (${data.analysis.summary})`,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("공유 실패:", err);
      }
    }
  };

  const getStatusLabel = () => {
    if (data.latestVal >= 40) return "위험 (피크아웃)";
    if (data.latestVal >= 35) return "과열 (경계)";
    if (data.latestVal >= 25) return "적정 (보통)";
    if (data.latestVal <= 20) return "바닥 (안정)";
    return "안정 (기회)";
  };

  const getStatusColor = () => {
    if (data.latestVal >= 40) return "#ef4444";
    if (data.latestVal >= 35) return "#f97316";
    if (data.latestVal <= 20) return "#22c55e";
    if (data.latestVal >= 25) return "#0ea5e9";
    return "var(--accent)";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base">신용잔고 리포트 공유</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors mr-1"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="px-4 bg-black/[0.02] dark:bg-white/[0.02] overflow-y-auto flex-1 flex flex-col items-center">
          <div className="pt-8 pb-12 flex flex-col items-center scale-[0.65] xs:scale-[0.8] sm:scale-95 origin-top transition-all duration-300">
            <div
              ref={cardRef}
              className={`w-[360px] h-[540px] p-8 rounded-[35px] shadow-2xl relative overflow-hidden transition-colors duration-300 border flex flex-col ${
                shareTheme === "light"
                  ? "bg-[#F8F7F4] text-neutral-900 border-neutral-100"
                  : "bg-[#0f172a] text-white border-white/5"
              }`}
            >
              {/* Header: Date and Logo */}
              <div className="flex justify-between items-center mb-4 shrink-0 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                  {data.latestDate}
                </p>
                <div className="flex items-center gap-1.5 opacity-30 grayscale">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">
                    Hang on!
                  </span>
                </div>
              </div>

              {/* Main Title */}
              <div className="mb-6 shrink-0 relative z-10">
                <h2 className="text-[20px] font-black italic tracking-tighter leading-tight">
                  국장 예탁금대비 신용비율 추이
                </h2>
              </div>

              {/* Main Chart (Top 50%) */}
              <div className="flex-1 min-h-[160px] flex flex-col mb-4 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    data={data.history.slice(-180).map((h) => ({
                      date: h.date,
                      ratio: (h.total / h.customer_deposit) * 100,
                    }))}
                  >
                    <XAxis dataKey="date" hide={true} />
                    <YAxis
                      domain={["dataMin - 0.5", "dataMax + 0.5"]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 800, opacity: 0.6 }}
                      tickFormatter={(val) => `${Math.round(val)}%`}
                    />
                    <Line
                      type="monotone"
                      dataKey="ratio"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="flex justify-between items-center mt-2 px-1 opacity-40">
                  <span className="text-[9px] font-black italic uppercase tracking-widest">
                    Recent 6M Trend
                  </span>
                  <span className="text-[9px] font-bold">
                    최근 6개월 수급 추이
                  </span>
                </div>
              </div>

              {/* Risk Status (Middle) */}
              <div className="flex flex-col items-center justify-center py-2 shrink-0 border-y border-neutral-500/10 relative z-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black italic tracking-tighter tabular-nums leading-none">
                    {data.latestVal.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold opacity-30">%</span>
                </div>
                <p
                  className="text-[14px] font-black italic tracking-tighter mt-1 uppercase"
                  style={{ color: getStatusColor() }}
                >
                  {getStatusLabel()}
                </p>
              </div>

              {/* Analysis Summary (Bottom) */}
              <div className="flex flex-col gap-3 shrink-0 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <h4 className="text-[13px] font-black italic tracking-tighter leading-none">
                    {data.analysis.title}
                  </h4>
                </div>
                <p
                  className={`text-[12px] font-bold leading-relaxed tracking-tight ${
                    shareTheme === "light"
                      ? "text-neutral-600"
                      : "text-white/60"
                  }`}
                >
                  •{" "}
                  {data.analysis.analysis
                    .split(/[.\n]/)
                    .filter((l: string) => l.trim().length > 5)[0]
                    .trim()}
                  .
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

              {/* Background Branding (Blurred) */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/[0.03] rounded-full blur-3xl -z-0" />
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
