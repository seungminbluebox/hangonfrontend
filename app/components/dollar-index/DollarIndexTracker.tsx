"use client";

import React, { useEffect, useState } from "react";
import {
  RefreshCcw,
  TrendingUp,
  Info,
  DollarSign,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  Zap,
  Share2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MarketData } from "../../lib/market";
import { DollarIndexShareCard } from "./DollarIndexShareCard";

interface DXYAnalysis {
  title: string;
  analysis: string;
  updated_at: string;
}

interface DXYData extends MarketData {
  analysis: DXYAnalysis;
}

export function DollarIndexTracker() {
  const [data, setData] = useState<DXYData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/market/dollar-index");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "데이터를 불러오는데 실패했습니다.");
      }

      setData(result);
      setError(null);
    } catch (err: any) {
      console.error("DXY Fetch Error:", err);
      setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 1분마다 자동 갱신
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCcw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-500 animate-pulse text-lg font-bold">
          달러 인덱스 데이터를 분석 중입니다...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center max-w-2xl mx-auto mt-10">
        <p className="text-red-500 font-bold mb-4">
          {error || "데이터를 찾을 수 없습니다."}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            fetchData();
          }}
          className="px-6 py-2 bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200"
        >
          다시 시도하기
        </button>
      </div>
    );
  }

  const chartData =
    data.history?.map((item) => ({
      time: item.label || item.time,
      value: item.value,
    })) || [];

  const isUp = data.value ? parseFloat(data.change || "0") >= 0 : true;

  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12 px-1">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Index Info Card */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-background/40 backdrop-blur-xl border border-border-subtle rounded-[2.5rem] p-8 shadow-sm flex-1 flex flex-col justify-between min-h-[460px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-us/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-us" />
                  </div>
                  <h1 className="text-base font-black tracking-tight text-foreground/90 uppercase">
                    Dollar Index
                  </h1>
                </div>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 hover:bg-secondary/20 rounded-xl transition-colors text-text-muted"
                  title="브리핑 공유하기"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {data.value ? (
                <div className="flex items-end gap-4 border-b border-border-subtle/30 pb-4">
                  <div className="text-5xl font-black tracking-tighter text-foreground leading-none">
                    {data.value}
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[13px] mb-0.5 ${
                      isUp
                        ? "bg-rose-500/10 text-rose-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {isUp ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {Math.abs(parseFloat(data.change || "0")).toFixed(2)}
                    </span>
                    <span className="opacity-80">({data.changePercent})</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center bg-secondary/10 rounded-3xl">
                  <p className="text-sm text-text-muted font-bold italic">
                    실시간 지수 연결 대기 중...
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: -40, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="currentColor"
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="time"
                      hide={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700 }}
                      minTickGap={50}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      hide={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700 }}
                      orientation="left"
                      tickFormatter={(value) => Math.round(value).toString()}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background/90 backdrop-blur-md border border-border-subtle p-2 rounded-xl shadow-xl text-[10px] font-bold">
                              <p className="text-text-muted mb-1">
                                {payload[0].payload.label ||
                                  payload[0].payload.time}
                              </p>
                              <p className="text-foreground">
                                {Number(payload[0].value).toFixed(2)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={isUp ? "#f43f5e" : "#3b82f6"}
                      strokeWidth={2}
                      dot={false}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center text-[11px] font-bold text-accent uppercase tracking-wider bg-accent/5 p-3 rounded-2xl border border-accent/10">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>최근 5일간 추이</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Analysis Report Card */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="bg-card/40 border border-border-subtle rounded-[2.5rem] p-8 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-black italic leading-tight tracking-tight">
                  {today} <br />
                  달러 인덱스 브리핑
                </h3>
              </div>
            </div>

            <div className="space-y-5 flex-grow font-sans">
              {data.analysis?.analysis ? (
                data.analysis.analysis
                  .split("\n\n")
                  .filter((p) => p.trim().length > 0)
                  .map((point, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent/30 mt-2 shrink-0 group-hover:bg-accent/60 transition-colors" />
                      <p className="text-[15px] leading-relaxed text-foreground/80 font-medium whitespace-pre-wrap">
                        {point.trim()}
                      </p>
                    </div>
                  ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center text-text-muted italic bg-secondary/5 rounded-3xl">
                  <Zap className="w-6 h-6 mb-2 opacity-20" />
                  <p>최근 분석 데이터가 아직 업데이트되지 않았습니다.</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border-subtle/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted italic">
                <Zap className="w-3.5 h-3.5 text-accent animate-pulse" />
                <span>미국 장 마감 기준 데일리 리포트</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-8 py-4 bg-secondary/5 rounded-3xl border border-border-subtle/30 backdrop-blur-sm">
        <p className="text-[11px] font-bold text-text-muted/60 leading-relaxed text-center italic">
          달러 인덱스(DXY)는 세계 주요 6개국 통화 대비 미국 달러의 가치를
          지수화한 것입니다. 100을 기준으로 달러의 강세와 약세를 판단하며,
          글로벌 금융 시장의 유동성과 위험 선호도를 나타내는 핵심 지표입니다.
        </p>
      </div>

      {showShareModal && (
        <DollarIndexShareCard
          data={data}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
