"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LineChart,
  Line,
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
} from "lucide-react";
import { clsx } from "clsx";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

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

export function PutCallRatioTracker() {
  const [history, setHistory] = useState<PCRHistory[]>([]);
  const [analysis, setAnalysis] = useState<PCRAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. 히스토리 데이터 (최근 60일)
        const { data: historyData, error: hError } = await supabase
          .from("pcr_history")
          .select("*")
          .order("date", { ascending: false })
          .limit(60);

        if (hError) throw hError;
        // 최신순으로 가져온 데이터를 과거순으로 뒤집어서 차트에 표시
        setHistory(historyData ? [...historyData].reverse() : []);

        // 2. AI 분석 결과
        const { data: analysisData, error: aError } = await supabase
          .from("pcr_analysis")
          .select("*")
          .eq("id", 1)
          .single();

        if (aError && aError.code !== "PGRST116") throw aError;
        setAnalysis(analysisData);
      } catch (err) {
        console.error("Error fetching PCR data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
  const isExtremeFear = latestVal >= 1.0;
  const isExtremeGreed = latestVal <= 0.7;

  return (
    <div className="space-y-6">
      {/* 1. PCR Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={clsx(
            "p-8 rounded-[2rem] border transition-all duration-500",
            isExtremeFear
              ? "bg-red-500/10 border-red-500/20"
              : isExtremeGreed
                ? "bg-green-500/10 border-green-500/20"
                : "bg-card border-border-subtle",
          )}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-black text-foreground/40 uppercase tracking-widest mb-1">
                Current PCR (Total)
              </p>
              <h2 className="text-5xl font-black italic tracking-tighter">
                {latestVal?.toFixed(2)}
              </h2>
            </div>
            <div
              className={clsx(
                "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter",
                isExtremeFear
                  ? "bg-red-500 text-white"
                  : isExtremeGreed
                    ? "bg-green-500 text-white"
                    : "bg-foreground/10 text-foreground/60",
              )}
            >
              {isExtremeFear
                ? "Extreme Fear"
                : isExtremeGreed
                  ? "Extreme Greed"
                  : "Neutral"}
            </div>
          </div>
          <p className="text-sm font-bold text-foreground/60 leading-relaxed">
            {isExtremeFear
              ? "투자자들이 하락에 강하게 베팅하고 있습니다. 역사적으로 이는 반등의 전조현상이 되기도 합니다."
              : isExtremeGreed
                ? "시장에 낙관론이 가득합니다. 콜 옵션 매수가 과도하므로 단기 조정을 경계해야 합니다."
                : "시장은 현재 균형 잡힌 심리 상태를 보이고 있습니다."}
          </p>
        </div>

        <div className="bg-card border border-border-subtle p-8 rounded-[2rem] flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                Index PCR
              </p>
              <p className="text-2xl font-black italic">
                {analysis?.latest_data?.index?.toFixed(2) || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                Equity PCR
              </p>
              <p className="text-2xl font-black italic">
                {analysis?.latest_data?.equity?.toFixed(2) || "-"}
              </p>
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

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fontWeight: 700,
                  fill: "rgba(255,255,255,0.3)",
                }}
                tickFormatter={(val) => val.split("-").slice(1).join("/")}
              />
              <YAxis
                domain={["auto", "auto"]}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fontWeight: 700,
                  fill: "rgba(255,255,255,0.3)",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              />
              <ReferenceLine
                y={1.0}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{
                  value: "FEAR",
                  position: "right",
                  fill: "#ef4444",
                  fontSize: 10,
                  fontWeight: 900,
                }}
              />
              <ReferenceLine
                y={0.7}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{
                  value: "GREED",
                  position: "right",
                  fill: "#22c55e",
                  fontSize: 10,
                  fontWeight: 900,
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#fff"
                strokeWidth={3}
                dot={{ r: 4, fill: "#fff", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "var(--accent)", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. AI Analysis Section */}
      {analysis && (
        <div className="bg-accent/5 border border-accent/10 rounded-[2.5rem] overflow-hidden">
          <button
            onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
            className="w-full flex items-center justify-between p-8 text-left hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-accent text-white shadow-lg shadow-accent/20">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black italic tracking-tight flex items-center gap-2">
                  {analysis.title}
                  <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                </h3>
                <p className="text-sm font-bold text-foreground/60">
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
            <div className="px-8 pb-8 pt-2 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-6 rounded-3xl bg-background/50 border border-border-subtle/50">
                <p className="text-base text-foreground/80 font-medium leading-relaxed whitespace-pre-line">
                  {analysis.analysis}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.recommendation.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-card border border-border-subtle relative group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Info className="w-12 h-12" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-black mb-3">
                      {idx + 1}
                    </div>
                    <p className="text-sm font-bold text-foreground/70 leading-snug">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
