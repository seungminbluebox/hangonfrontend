"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
  Legend,
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
  Target,
  SearchCode,
  Waves,
  Zap,
  Activity,
  BarChart3,
  Wallet,
} from "lucide-react";
import { clsx } from "clsx";
import { CreditBalanceShareCard } from "./CreditBalanceShareCard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface CreditHistory {
  date: string;
  total: number;
  customer_deposit: number;
}

interface CreditAnalysis {
  title: string;
  summary: string;
  analysis: string;
  recommendation: string[];
  latest_data: any;
  updated_at: string;
}

export function CreditBalanceTracker() {
  const [history, setHistory] = useState<CreditHistory[]>([]);
  const [analysis, setAnalysis] = useState<CreditAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: historyData, error: hError } = await supabase
          .from("credit_balance_history")
          .select("date, total, customer_deposit")
          .order("date", { ascending: false })
          .limit(250);

        if (hError) throw hError;
        setHistory(historyData ? [...historyData].reverse() : []);

        const { data: analysisData, error: aError } = await supabase
          .from("credit_balance_analysis")
          .select("*")
          .eq("id", 1)
          .single();

        if (aError && aError.code !== "PGRST116") throw aError;
        setAnalysis(analysisData);

        if (analysisData?.updated_at) {
          const date = new Date(analysisData.updated_at);
          setLastCheckTime(
            date.toLocaleString("ko-KR", {
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
        }
      } catch (error) {
        console.error("Error fetching credit balance data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-secondary/20 rounded-[2.5rem] border border-border-subtle animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <Cpu className="w-10 h-10 text-accent animate-spin" />
          <p className="text-text-muted font-bold italic tracking-tighter">
            시장 수급 멀티 분석 중...
          </p>
        </div>
      </div>
    );
  }

  const latest =
    history.length > 0
      ? history[history.length - 1]
      : { total: 0, customer_deposit: 1 };
  const latestCreditTrillion = latest.total / 1000000000000;
  const latestDepositTrillion = latest.customer_deposit / 1000000000000;
  const ratio = (latest.total / latest.customer_deposit) * 100;

  // 비율 기반 위험도 판단
  const isExtremeRisk = ratio >= 40;
  const isWarning = ratio >= 35;
  const isNormal = ratio >= 25;
  const isVeryStable = ratio <= 20;

  const getStatusColor = () => {
    if (isExtremeRisk) return "text-red-500";
    if (isWarning) return "text-orange-500";
    if (isVeryStable) return "text-green-500";
    if (isNormal) return "text-sky-400";
    return "text-accent";
  };

  const getStatusText = () => {
    if (isExtremeRisk) return "위험 (피크아웃 주의)";
    if (isWarning) return "과열 (경계 필요)";
    if (isVeryStable) return "바닥 (매우 안정)";
    if (isNormal) return "적정 (시장 보통)";
    return "안정 (기회 구간)";
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight italic">
              <span className="text-accent">국내 증시</span>신용잔고 분석
            </h2>
            <span className="text-[10px] font-bold text-foreground/30 leading-none">
              D-2 영업일 기준 업데이트됨
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl transition-all text-sm font-black group"
        >
          <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          공유
        </button>
      </div>

      <div className="space-y-6">
        {/* Unified Status Dashboard */}
        <div className="relative overflow-hidden bg-card/40 border border-border-subtle rounded-[2.5rem] p-6 md:py-8 md:px-10 transition-all hover:bg-card/60">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 -z-0">
            <BarChart3 className="w-64 h-64" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Main Highlight: Ratio */}
            <div className="flex flex-col items-center lg:items-start gap-3">
              <div className="flex items-center gap-2">
                <span className="bg-accent text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-accent/20">
                  예탁금 대비 신용 비율
                </span>
                <span className="text-[10px] text-text-muted font-bold">
                  D-2 결제 데이터 기준
                </span>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-baseline justify-center lg:justify-start gap-1">
                  <h2 className="text-7xl md:text-8xl font-black italic tracking-tighter leading-none">
                    {ratio.toFixed(1)}
                  </h2>
                  <span className="text-2xl md:text-3xl font-bold text-text-muted opacity-40 italic">
                    %
                  </span>
                </div>
                <div
                  className={clsx(
                    "flex items-center justify-center lg:justify-start gap-2 mt-2 font-black italic text-xl md:text-2xl",
                    getStatusColor(),
                  )}
                >
                  <Activity className="w-5 h-5 md:w-6 md:h-6" />
                  {getStatusText()}
                </div>
              </div>
            </div>

            {/* Sub Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto lg:min-w-[400px]">
              <div className="bg-white/5 border border-white/5 rounded-3xl p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                    고객예탁금
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black italic tracking-tighter">
                    {latestDepositTrillion.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-text-muted">
                    조 원
                  </span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-3xl p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                    신용융자 잔고
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black italic tracking-tighter text-accent">
                    {latestCreditTrillion.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-text-muted">
                    조 원
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Trend Chart */}
          <div className="lg:col-span-12 bg-secondary/20 border border-border-subtle rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Waves className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-black italic tracking-tight">
                    예탁금 vs 신용 비중 추세
                  </h3>
                  <p className="text-xs text-text-muted font-medium">
                    상태:{" "}
                    {latestDepositTrillion > 60
                      ? "유동성 풍부"
                      : "유동성 다소 부족"}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={history}>
                  <defs>
                    <linearGradient
                      id="colorDeposit"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                      fill: "rgba(255,255,255,0.3)",
                      fontWeight: "bold",
                    }}
                    tickFormatter={(val) => val.split("-").slice(1).join("/")}
                    minTickGap={30}
                  />
                  <YAxis hide domain={["dataMin * 0.9", "dataMax * 1.1"]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = Number(payload[0].value) / 1000000000000;
                        const c = Number(payload[1].value) / 1000000000000;
                        return (
                          <div className="bg-background/90 backdrop-blur-xl border border-border-subtle p-4 rounded-2xl shadow-2xl space-y-2">
                            <p className="text-[10px] text-text-muted font-bold">
                              {payload[0].payload.date}
                            </p>
                            <div className="flex justify-between gap-8 items-center">
                              <span className="text-[11px] font-bold text-sky-400">
                                고객예탁금
                              </span>
                              <span className="text-xs font-black text-sky-400">
                                {d.toFixed(1)}조
                              </span>
                            </div>
                            <div className="flex justify-between gap-8 items-center">
                              <span className="text-[11px] font-bold text-accent">
                                신용융자
                              </span>
                              <span className="text-xs font-black text-accent">
                                {c.toFixed(1)}조
                              </span>
                            </div>
                            <div className="pt-2 border-t border-border-subtle/50 flex justify-between gap-8 items-center">
                              <span className="text-[11px] font-bold text-text-muted">
                                비중
                              </span>
                              <span className="text-xs font-black text-white">
                                {((c / d) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "10px",
                      fontWeight: "bold",
                      paddingTop: "20px",
                    }}
                  />
                  <Area
                    name="고객예탁금"
                    type="monotone"
                    dataKey="customer_deposit"
                    fill="url(#colorDeposit)"
                    stroke="#0ea5e9"
                    strokeWidth={1.5}
                    fillOpacity={1}
                  />
                  <Line
                    name="신용융자"
                    type="monotone"
                    dataKey="total"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Consolidated Guide */}
            <div className="grid grid-cols-4 gap-2 md:gap-4 mt-2 pt-2 border-t border-white/5">
              <div className="p-2 md:p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors text-center flex flex-col justify-center min-h-[60px] md:min-h-[80px]">
                <div className="text-[7px] md:text-[10px] font-black text-green-500 uppercase mb-1 whitespace-nowrap">
                  ~20%
                </div>
                <div className="text-[9px] md:text-sm font-black italic whitespace-nowrap">
                  매우 안정
                </div>
              </div>
              <div className="p-2 md:p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors text-center flex flex-col justify-center min-h-[60px] md:min-h-[80px]">
                <div className="text-[8px] md:text-[10px] font-black text-sky-400 uppercase mb-1 whitespace-nowrap">
                  25% ~ 30%
                </div>
                <div className="text-[9px] md:text-sm font-black italic whitespace-nowrap">
                  일반 수준
                </div>
              </div>
              <div className="p-2 md:p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors text-center flex flex-col justify-center min-h-[60px] md:min-h-[80px]">
                <div className="text-[8px] md:text-[10px] font-black text-orange-500 uppercase mb-1 whitespace-nowrap">
                  35% ~ 40%
                </div>
                <div className="text-[9px] md:text-sm font-black italic whitespace-nowrap">
                  주의 구간
                </div>
              </div>
              <div className="p-2 md:p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors text-center flex flex-col justify-center min-h-[60px] md:min-h-[80px]">
                <div className="text-[8px] md:text-[10px] font-black text-red-500 uppercase mb-1 whitespace-nowrap">
                  40% ~
                </div>
                <div className="text-[9px] md:text-sm font-black italic whitespace-nowrap">
                  위험 구간
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          {analysis && (
            <div className="lg:col-span-12 space-y-6">
              <div className="bg-card/30 border border-border-subtle rounded-[2.5rem] overflow-hidden">
                <button
                  onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                  className="w-full flex items-center justify-between p-8 hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                      <Microscope className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-black italic tracking-tight flex items-center gap-2">
                        {analysis.title}
                      </h3>
                      <p className="text-sm font-bold text-text-muted">
                        {analysis.summary}
                      </p>
                    </div>
                  </div>
                  {isAnalysisExpanded ? (
                    <ChevronUp className="w-6 h-6 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-text-muted" />
                  )}
                </button>

                {isAnalysisExpanded && (
                  <div className="p-2 pt-0 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="relative">
                      <div className="flex items-start gap-4 p-6 bg-accent/[0.03] border-l-4 border-accent rounded-r-3xl relative overflow-hidden group transition-all hover:bg-accent/[0.05]">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                          <MessageSquare className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3 text-accent/60 font-black italic text-[10px] tracking-widest uppercase">
                            <Info className="w-3 h-3" />
                            Expert Insight
                          </div>
                          <div className="space-y-4">
                            {analysis.analysis
                              .split(". ")
                              .filter((line) => line.trim().length > 0)
                              .map((line, i) => (
                                <p
                                  key={i}
                                  className="text-[15px] md:text-[16px] text-foreground/90 font-bold leading-[1.9] tracking-tight relative pl-4"
                                >
                                  <span className="absolute left-0 top-3 w-1 h-1 rounded-full bg-accent/40" />
                                  {line.trim()}
                                  {line.trim().endsWith(".") ? "" : "."}
                                </p>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 md:p-10">
                      <div className="flex items-center gap-3 mb-6">
                        <Target className="w-5 h-5 text-accent" />
                        <h4 className="text-lg font-black italic tracking-tight">
                          수급 대응 전략
                        </h4>
                      </div>
                      <div className="space-y-4">
                        {analysis.recommendation.map((rec, i) => (
                          <div key={i} className="flex gap-4 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                            <p className="text-[15px] font-bold text-foreground/80 leading-relaxed">
                              {rec}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showShareModal && analysis && (
        <CreditBalanceShareCard
          data={{
            latestVal: ratio,
            latestDate: history[history.length - 1].date,
            score: Math.round(ratio),
            history: history,
            analysis: analysis,
          }}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
