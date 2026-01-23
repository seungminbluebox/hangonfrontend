"use client";

import React, { useRef, useState, useEffect } from "react";
import { toBlob } from "html-to-image";
import {
  Download,
  Copy,
  Check,
  Share2,
  X,
  Compass,
  ArrowRightLeft,
  Layers,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  TrendingUp,
  Globe,
} from "lucide-react";

interface FlowItem {
  symbol: string;
  price: number;
  change: number;
  rel_vol: number;
}

interface MoneyFlowData {
  flow_data: Record<string, Record<string, FlowItem>>;
  summary: string;
  analysis: string;
  strategy: string[];
  updated_at: string;
}

interface MoneyFlowShareCardProps {
  data: MoneyFlowData;
  onClose: () => void;
  type: "assets" | "sectors" | "report";
  marketType: "domestic" | "us" | "safe";
}

export function MoneyFlowShareCard({
  data,
  onClose,
  type,
  marketType,
}: MoneyFlowShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [shareTheme, setShareTheme] = useState<"light" | "dark">("light");

  const titleMap = {
    domestic: "오늘의 국내 증시 자산 흐름🌊",
    us: "오늘의 미국 증시 자산 흐름💲",
    safe: "오늘의 안전자산 흐름🪙",
  };

  const title = titleMap[marketType];

  const cardHeight =
    type === "assets"
      ? 550
      : type === "sectors"
        ? 500
        : marketType === "domestic"
          ? 530
          : 580;

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
        height: `${cardHeight}px`,
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
        `hangon-money-flow-${type}-${new Date().toISOString().split("T")[0]}.png`,
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

  const handleShare = async () => {
    const blob = await getBlob();
    if (!blob) return;

    const file = new File([blob], "money-flow.png", { type: "image/png" });
    const shareTitle =
      type === "assets"
        ? "자산군별 자금 흐름"
        : type === "sectors"
          ? marketType === "us"
            ? "미국 섹터별 돈의 쏠림"
            : "국내 섹터별 돈의 쏠림"
          : "자금 흐름 분석 리포트";

    try {
      await navigator.share({
        files: [file],
        title: `[Hang on!] ${shareTitle}`,
        text: `${title}\n${data.summary}\n더 자세한 내용은 웹사이트에서 확인하세요!`,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        console.error("공유 실패:", err);
    }
  };

  const renderContent = () => {
    if (type === "assets") {
      return (
        <div className="space-y-4 px-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ArrowRightLeft
                className={`w-5 h-5 ${shareTheme === "light" ? "text-neutral-900" : "text-accent"}`}
              />
              <h3
                className={`text-lg font-black italic ${shareTheme === "light" ? "text-neutral-900" : "text-white"}`}
              >
                자산군별 자금 흐름
              </h3>
            </div>
            <span className="text-[10px] font-bold opacity-30 italic">
              *vol: 상대 거래량
            </span>
          </div>
          <div className="space-y-4">
            {Object.entries(data.flow_data)
              .filter(([key]) => key !== "Sectors")
              .map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        category === "Assets"
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                      }`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                      {category === "Index"
                        ? "지수 및 주요 지표"
                        : category === "Assets"
                          ? "안전자산 및 기타"
                          : category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {Object.entries(items).map(([name, item]) => (
                      <AssetCardMini
                        key={name}
                        name={name}
                        item={item}
                        theme={shareTheme}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      );
    }

    if (type === "sectors") {
      const sectors = data.flow_data.Sectors || {};
      return (
        <div className="space-y-6 px-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers
                className={`w-5 h-5 ${shareTheme === "light" ? "text-neutral-900" : "text-accent"}`}
              />
              <h3
                className={`text-lg font-black italic ${shareTheme === "light" ? "text-neutral-900" : "text-white"}`}
              >
                {marketType === "us"
                  ? "미국 섹터별 돈의 쏠림 💲"
                  : "국내 섹터별 돈의 쏠림 💸"}
              </h3>
            </div>
            <span className="text-[10px] font-bold opacity-30 italic">
              *vol: 상대 거래량
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(sectors).map(([name, item]) => (
              <SectorCardMini
                key={name}
                name={name}
                item={item}
                theme={shareTheme}
              />
            ))}
          </div>
        </div>
      );
    }

    if (type === "report") {
      const firstAnalysis =
        data.analysis.split(/[.!?]\s/).filter(Boolean)[0] + ".";
      const firstStrategy = data.strategy[0];

      return (
        <div className="px-1">
          <div className="flex flex-col gap-3">
            {/* Title & Summary */}
            <div className="flex flex-col gap-1.5">
              <h3
                className={`text-xl font-black italic tracking-tighter ${shareTheme === "light" ? "text-neutral-900" : "text-white"}`}
              >
                {title}
              </h3>
              <p
                className={`text-[12px] font-bold leading-snug ${shareTheme === "light" ? "text-neutral-600" : "text-white/60"}`}
              >
                {data.summary}
              </p>
            </div>

            {/* Money Flow Section */}
            <div className="bg-accent/5 rounded-[1.5rem] p-3.5 border border-accent/10">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3 h-3 text-accent" />
                  <span className="text-[10px] font-black italic text-accent uppercase tracking-tight">
                    자금 흐름 현황
                  </span>
                </div>
                <span className="text-[10px] font-bold opacity-30 italic">
                  *vol: 상대 거래량
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(data.flow_data)
                  .filter(([key]) => key !== "Sectors")
                  .map(([category, items]) => (
                    <div key={category} className="space-y-1.5">
                      <div className="flex items-center gap-1.5 px-0.5">
                        <span className="text-[8px] font-black uppercase tracking-wider opacity-40">
                          {category === "Index"
                            ? "Market Index"
                            : "Asset Class"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(items).map(([name, item]) => (
                          <AssetCardMini
                            key={name}
                            name={name}
                            item={item}
                            theme={shareTheme}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Analysis & Strategy in vertical stack */}
            <div className="flex flex-col gap-4 mt-1">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 opacity-40">
                  <Activity className="w-2.5 h-2.5" />
                  <span className="text-[9px] uppercase tracking-widest font-black">
                    분석
                  </span>
                </div>
                <p
                  className={`text-[11px] leading-relaxed font-bold ${shareTheme === "light" ? "text-neutral-700" : "text-white/70"}`}
                >
                  {firstAnalysis}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-accent/80">
                  <Target className="w-2.5 h-2.5" />
                  <span className="text-[9px] uppercase tracking-widest font-black">
                    전략
                  </span>
                </div>
                <p
                  className={`text-[11px] leading-relaxed font-bold ${shareTheme === "light" ? "text-neutral-900" : "text-white"}`}
                >
                  {firstStrategy}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base">자금 흐름 리포트 공유</h3>
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
            <div
              ref={cardRef}
              className={`w-[360px] p-7 rounded-[35px] shadow-2xl relative overflow-hidden transition-colors duration-300 border flex flex-col justify-between ${
                shareTheme === "light"
                  ? "bg-[#F8F7F4] text-neutral-900 border-neutral-100"
                  : "bg-[#0f172a] text-white border-white/5"
              }`}
              style={{ borderRadius: "35px", height: `${cardHeight}px` }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
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

              {/* Main Content */}
              <div className="z-10 flex-1 flex flex-col justify-center py-2">
                {renderContent()}
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

              {/* Pattern Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -ml-16 -mb-16" />
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
              onClick={handleShare}
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

function AssetCardMini({
  name,
  item,
  theme,
}: {
  name: string;
  item: FlowItem;
  theme: "light" | "dark";
}) {
  const isPositive = item.change >= 0;
  return (
    <div
      className={`p-2.5 rounded-xl border transition-colors ${
        theme === "light"
          ? "bg-white border-neutral-100 shadow-sm"
          : "bg-white/5 border-white/10"
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-black opacity-50 overflow-hidden text-ellipsis whitespace-nowrap">
          {name}
        </span>
        {isPositive ? (
          <ArrowUpRight className="w-2 h-2 text-emerald-500 opacity-70" />
        ) : (
          <ArrowDownRight className="w-2 h-2 text-red-500 opacity-70" />
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-xs font-black tracking-tighter ${isPositive ? "text-emerald-500" : "text-red-500"}`}
        >
          {isPositive ? "+" : ""}
          {item.change}%
        </span>
        <span className="text-[7px] font-bold opacity-30 tabular-nums lowercase">
          {item.rel_vol}x
        </span>
      </div>
    </div>
  );
}

function SectorCardMini({
  name,
  item,
  theme,
}: {
  name: string;
  item: FlowItem;
  theme: "light" | "dark";
}) {
  const isFocused = item.rel_vol > 1.2;
  const isPositive = item.change >= 0;

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        isFocused
          ? "bg-accent/10 border-accent/40 shadow-[0_0_10px_rgba(var(--accent-rgb),0.05)]"
          : theme === "light"
            ? "bg-white border-neutral-200"
            : "bg-white/5 border-white/10"
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className={`text-[10px] font-black ${isFocused ? "text-accent" : "opacity-60"} overflow-hidden text-ellipsis whitespace-nowrap`}
        >
          {name}
        </span>
        {isFocused && (
          <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
        )}
      </div>
      <div className="flex items-end justify-between gap-1">
        <span
          className={`text-sm font-black tracking-tighter ${isPositive ? "text-emerald-500" : "text-red-500"}`}
        >
          {isPositive ? "+" : ""}
          {item.change}%
        </span>
        <span
          className={`text-[9px] font-black tabular-nums ${isFocused ? "text-accent" : "opacity-30"}`}
        >
          {item.rel_vol}x
        </span>
      </div>
    </div>
  );
}
