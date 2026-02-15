"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  AlertCircle,
  Info,
  BrainCircuit,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  Cpu,
  Microscope,
  SearchCode,
  Waves,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";
import { PutCallRatioShareCard } from "./PutCallRatioShareCard";
import { supabase } from "../../../lib/supabase";

interface PCRHistory {
  date: string;
  total: number;
  index: number;
  equity: number;
}

interface PCRAnalysis {
  title: string;
  summary: string;
  analysis: string;
  recommendation: string[];
  latest_data: PCRHistory;
  updated_at: string;
}

interface PutCallRatioTrackerProps {
  market: "US" | "KR";
}

const pcrHistoryFetcher = async (key: string) => {
  const [_, historyTable] = key.split(":");
  const { data, error } = await supabase
    .from(historyTable)
    .select("date, total, index, equity")
    .order("date", { ascending: false })
    .limit(60);
  if (error) throw error;
  return data ? [...data].reverse() : [];
};

const pcrAnalysisFetcher = async (key: string): Promise<PCRAnalysis | null> => {
  const [_, analysisTable] = key.split(":");
  const { data, error } = await supabase
    .from(analysisTable)
    .select("title, summary, analysis, recommendation, latest_data, updated_at")
    .eq("id", 1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return (data as PCRAnalysis) || null;
};

export function PutCallRatioTracker({ market }: PutCallRatioTrackerProps) {
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  const historyTable = market === "US" ? "pcr_history" : "kr_pcr_history";
  const analysisTable = market === "US" ? "pcr_analysis" : "kr_pcr_analysis";

  const { data: history = [] } = useSWR<PCRHistory[]>(
    `pcr_history:${historyTable}`,
    pcrHistoryFetcher,
    { refreshInterval: 60000 },
  );

  const { data: analysis } = useSWR<PCRAnalysis | null>(
    `pcr_analysis:${analysisTable}`,
    pcrAnalysisFetcher,
    { refreshInterval: 60000 },
  );

  const lastCheckTime = analysis?.updated_at
    ? new Date(analysis.updated_at).toLocaleString("ko-KR", {
        month: "numeric",
        day: "numeric",
      })
    : new Date().toLocaleString("ko-KR", {
        month: "numeric",
        day: "numeric",
      });

  const loading = !analysis && history.length === 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-foreground/50">
          데이터를 불러오는 중...
        </p>
      </div>
    );
  }

  const latestVal =
    analysis?.latest_data?.total || history[history.length - 1]?.total;
  const latestDate =
    analysis?.latest_data?.date || history[history.length - 1]?.date;
  const isExtremeFear = latestVal >= 1.0;
  const isExtremeGreed = latestVal <= 0.7;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-black tracking-tight italic">
              {market === "US" ? "미국" : "국내"} 시장{" "}
              <span className="text-accent">풋/콜 분석</span>
            </h2>
          </div>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-4 py-2 rounded-2xl border border-accent/20 transition-all font-black text-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          공유하기
        </button>
      </div>

      {/* 1. PCR Stats Summary - Enhanced Hero Section */}
      <div
        className={clsx(
          "relative overflow-hidden p-8 md:p-12 rounded-[2.5rem] border transition-all duration-700",
          isExtremeFear
            ? "bg-red-500/10 border-red-500/20 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]"
            : isExtremeGreed
              ? "bg-green-500/10 border-green-500/20 shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]"
              : "bg-card border-border-subtle",
        )}
      >
        {/* Decorative Background Elements */}
        {isExtremeFear && (
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        )}
        {isExtremeGreed && (
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        )}

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  "w-2 h-2 rounded-full",
                  isExtremeFear
                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"
                    : isExtremeGreed
                      ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]"
                      : "bg-foreground/20",
                )}
              />
              <div className="flex flex-col items-center justify-center text-[10px] md:text-xs font-black italic tracking-tighter text-accent uppercase bg-accent/10 px-2.5 py-1 rounded-xl border border-accent/20 leading-none">
                <span>PCR</span>
                <span className="not-italic opacity-60 text-[10px] md:text-[11px] mt-1 whitespace-nowrap">
                  풋콜 비율
                </span>
              </div>
              <div className="flex flex-col ml-1">
                <span className="text-[10px] font-bold text-foreground/40">
                  {lastCheckTime} 업데이트됨
                </span>
                <span className="text-[9px] font-bold text-foreground/20 italic">
                  {market === "US"
                    ? "* 1일 지연 데이터 (미 증시 마감 후 집계)"
                    : "* 일일 거래대금 합산 데이터 (KRX)"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter">
                {latestVal?.toFixed(2)}
              </h2>
              <div
                className={clsx(
                  "px-4 py-2 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tighter",
                  isExtremeFear
                    ? "bg-red-500 text-white animate-pulse"
                    : isExtremeGreed
                      ? "bg-green-500 text-white animate-pulse"
                      : "bg-foreground/10 text-foreground/60",
                )}
              >
                {isExtremeFear
                  ? "Extreme Fear"
                  : isExtremeGreed
                    ? "Extreme Greed"
                    : "Neutral Market"}
              </div>
            </div>
            <p className="text-base md:text-lg font-bold text-foreground/70 max-w-xl leading-relaxed">
              {isExtremeFear
                ? "현재 시장은 과도한 공포 구간에 진입했습니다. 풋 옵션 매수가 극에 달했으며, 역사적으로 강력한 반등이 임박했음을 시사하는 반전 신호일 수 있습니다."
                : isExtremeGreed
                  ? "시장에 과도한 낙관론이 팽배합니다. 콜 옵션 투기가 과열된 상태로, 단기적인 가격 조정이나 추세 반전에 각별한 주의가 필요한 시점입니다."
                  : "투자 심리가 중립적인 위치에 있습니다. 시장은 명확한 방향성을 탐색 중이며, 다른 주요 경제 지표들과 함께 복합적인 판단이 필요한 구간입니다."}
            </p>
          </div>

          <div className="hidden md:block pb-4">
            <div className="flex flex-col items-end gap-1 opacity-40">
              <p className="text-[10px] font-black uppercase tracking-widest text-right">
                Sentiment Gauge
              </p>
              <div className="w-48 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-1000",
                    isExtremeFear
                      ? "bg-red-500"
                      : isExtremeGreed
                        ? "bg-green-500"
                        : "bg-accent",
                  )}
                  style={{
                    width: `${Math.min(Math.max((latestVal || 0.7) * 50, 0), 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Chart Section */}
      <div className="bg-card border border-border-subtle rounded-[2.5rem] p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-accent/10 text-accent">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black italic tracking-tight">
              지표 히스토리 (최근 60일)
            </h3>
          </div>

          {/* Chart Legend Guide */}
          <div className="flex items-center gap-6 px-4 py-2 bg-background/50 rounded-2xl border border-border-subtle/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#ef4444] border-t border-dashed border-[#ef4444]" />
              <span className="text-[10px] font-black text-[#ef4444] uppercase tracking-tighter">
                1.0 Fear (바닥권)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#22c55e] border-t border-dashed border-[#22c55e]" />
              <span className="text-[10px] font-black text-[#22c55e] uppercase tracking-tighter">
                0.7 Greed (고점권)
              </span>
            </div>
          </div>
        </div>

        <div className="h-[350px] w-full text-foreground/30">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={history}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--accent)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--accent)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                strokeOpacity={0.05}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fontWeight: 700,
                  fill: "currentColor",
                }}
                tickFormatter={(val) => {
                  const [y, m, d] = val.split("-");
                  return `${m}/${d}`;
                }}
                minTickGap={30}
              />
              <YAxis
                domain={["dataMin - 0.05", "dataMax + 0.05"]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => Number(val).toFixed(2)}
                tick={{
                  fontSize: 10,
                  fontWeight: 700,
                  fill: "currentColor",
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#1a1a1a] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                        <p className="text-[10px] font-black text-white/40 uppercase mb-2">
                          {label}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                          <p className="text-xl font-black italic text-white">
                            {payload[0].value}
                            <span className="text-[10px] ml-1 uppercase text-white/40 not-italic">
                              PCR
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={0.85}
                stroke="currentColor"
                strokeOpacity={0.2}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: "AVG 0.85",
                  position: "insideBottomLeft",
                  fill: "currentColor",
                  opacity: 0.3,
                  fontSize: 10,
                  fontWeight: 900,
                  offset: 20,
                }}
              />
              <ReferenceLine
                y={1.0}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={1}
                label={{
                  value: "EXTREME FEAR",
                  position: "insideBottomRight",
                  fill: "#ef4444",
                  fontSize: 9,
                  fontWeight: 900,
                  offset: 10,
                }}
              />
              <ReferenceLine
                y={0.7}
                stroke="#22c55e"
                strokeDasharray="5 5"
                strokeWidth={1}
                label={{
                  value: "EXTREME GREED",
                  position: "insideTopRight",
                  fill: "#22c55e",
                  fontSize: 9,
                  fontWeight: 900,
                  offset: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--accent)"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorTotal)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. AI Analysis Section */}
      {analysis && (
        <div className="bg-accent/5 border border-accent/10 rounded-[2.5rem] overflow-hidden">
          <button
            onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
            className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="hidden md:flex p-3 rounded-2xl bg-accent text-white shadow-lg shadow-accent/20">
                <Microscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black italic tracking-tight flex items-center gap-2">
                  {analysis.title}
                </h3>
                <p className="text-xs md:text-sm font-bold text-foreground/60">
                  {analysis.summary}
                </p>
              </div>
            </div>
            {isAnalysisExpanded ? (
              <ChevronUp className="w-6 h-6 text-foreground/30" />
            ) : (
              <ChevronDown className="w-6 h-6 text-foreground/30" />
            )}
          </button>

          {isAnalysisExpanded && (
            <div className="px-5 md:px-8 pb-8 pt-2 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Analysis Block */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    Deep Analysis • 심층 분석
                  </span>
                </div>
                <div className="p-6 md:p-8 rounded-[2rem] bg-background/50 border border-border-subtle/50 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent/20" />
                  <div className="space-y-4">
                    {analysis.analysis
                      .split(". ")
                      .filter((line) => line.trim().length > 0)
                      .map((line, index) => (
                        <p
                          key={index}
                          className="text-sm md:text-base text-foreground/80 font-medium leading-relaxed md:leading-loose flex gap-2"
                        >
                          <span className="text-accent shrink-0">•</span>
                          <span>
                            {line.trim()}
                            {line.trim().endsWith(".") ? "" : "."}
                          </span>
                        </p>
                      ))}
                  </div>
                </div>
              </div>

              {/* Recommendation Block */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    추천 대응 전략
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysis.recommendation.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-3xl bg-card border border-border-subtle relative group overflow-hidden hover:border-accent/30 transition-colors"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="w-12 h-12" />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-[9px] font-black text-accent uppercase tracking-tighter">
                          Action {idx + 1}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-foreground/70 leading-snug">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showShareModal && (
        <PutCallRatioShareCard
          data={{
            latestVal,
            latestDate,
            isExtremeFear,
            isExtremeGreed,
            analysis,
            history: history,
          }}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
