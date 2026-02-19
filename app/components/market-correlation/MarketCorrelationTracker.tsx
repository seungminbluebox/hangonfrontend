"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Share2,
  Activity,
  Target,
  AlertCircle,
  Database,
  ArrowRight,
  LineChart as ChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { clsx } from "clsx";
import { MarketCorrelationShareCard } from "@/app/components/market-correlation/MarketCorrelationShareCard";

interface CorrelationData {
  date: string;
  correlation_value: number;
  kospi_value: number;
  sp500_value: number;
  kospi_change: number;
  sp500_change: number;
}

export function MarketCorrelationTracker() {
  const [history, setHistory] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch("/api/market/correlation");
        const data = await response.json();
        if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch (error) {
        console.error("Error fetching correlation data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const latestData = history[history.length - 1];
  const currentCorr = latestData?.correlation_value ?? 0;

  // Calculate dynamic offset for the 0.2 threshold coloring
  const allCorrValues = history.map((d) => d.correlation_value);
  const dataMax = Math.max(...allCorrValues, 0.2);
  const dataMin = Math.min(...allCorrValues, 0.2);
  const off = dataMax === dataMin ? 0 : (dataMax - 0.2) / (dataMax - dataMin);

  const getStatus = (val: number) => {
    if (val > 0.6)
      return {
        label: "강한 커플링",
        color: "text-red-500",
        desc: "미국 증시와 매우 흡사한 궤적을 그리며 움직이고 있습니다.",
      };
    if (val > 0.2)
      return {
        label: "약한 커플링",
        color: "text-orange-500",
        desc: "미국의 방향성을 공유하지만 국내 독자 수급도 영향을 주고 있습니다.",
      };
    if (val > -0.2)
      return {
        label: "약한 디커플링",
        color: "text-blue-500",
        desc: "미국 증시와 상관없이 국내 증시만의 독자적인 흐름을 보이고 있습니다.",
      };
    return {
      label: "강한 디커플링",
      color: "text-purple-500",
      desc: "미국 증시와 정반대로 움직이는 특이 현상이 관찰됩니다.",
    };
  };

  const status = getStatus(currentCorr);

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-card/5 border border-border-subtle rounded-[2rem] animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm font-bold text-text-muted">
            상관계수 분석 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통합 상관계수 리포트 카드 */}
      <div className="p-6 md:p-10 rounded-[2.5rem] bg-card/10 border border-border-subtle relative overflow-hidden group">
        <div className="relative z-10 space-y-8">
          {/* Header Area */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-xl bg-accent border-b-2 border-white/20 shadow-lg shadow-accent/20">
                <span className="text-[10px] md:text-xs font-black text-white tracking-tight">
                  한-미 양국 커플링 지수
                </span>
              </div>
              <time className="text-[10px] md:text-sm font-bold text-text-muted">
                {latestData?.date} 기준
              </time>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="w-12 h-12 rounded-2xl bg-background border border-border-subtle flex items-center justify-center hover:bg-secondary transition-all hover:scale-110 active:scale-95"
            >
              <Share2 className="w-5 h-5 text-text-muted hover:text-accent" />
            </button>
          </div>

          {/* Main Content: Focal Correlation Value */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <div className="flex items-baseline gap-4">
                  <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none">
                    {currentCorr.toFixed(4)}
                  </h3>
                  <div
                    className={clsx(
                      "px-3 py-1 rounded-lg text-xs font-black bg-current/10 border border-current/20",
                      status.color,
                    )}
                  >
                    {status.label}
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base font-bold text-text-muted leading-relaxed max-w-[440px]">
                {status.desc}
              </p>

              {/* 구간 비주얼 인디케이터 (0.2 중심 설계) */}
              <div className="pt-2 space-y-3 max-w-[500px]">
                <div className="relative">
                  {/* 현재 위치 화살표 (0.2 기준 매핑) */}
                  <div
                    className="absolute -top-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-foreground transition-all duration-1000 ease-out z-30"
                    style={{
                      left: `${
                        currentCorr >= 0.2
                          ? 50 + ((currentCorr - 0.2) / 0.8) * 50
                          : 50 - ((0.2 - currentCorr) / 1.2) * 50
                      }%`,
                      transform: "translateX(-50%)",
                      filter: "drop-shadow(0 0 4px rgba(0,0,0,0.2))",
                    }}
                  />

                  {/* 세그먼트 바 (0.2 정중앙 배치) */}
                  <div className="relative h-5 w-full flex rounded-full overflow-hidden bg-white/5 border border-white/10 shadow-inner">
                    {/* -1.0 ~ 0.2 (디커플링/역동조화 영역 - 50%) */}
                    <div
                      className="h-full flex opacity-50"
                      style={{ width: "50%" }}
                    >
                      <div
                        className="h-full bg-purple-600"
                        style={{ width: "66.6%" }}
                      />{" "}
                      {/* -1.0 ~ -0.2 */}
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: "33.4%" }}
                      />{" "}
                      {/* -0.2 ~ 0.2 */}
                    </div>
                    {/* 0.2 ~ 1.0 (동조화 영역 - 50%) */}
                    <div
                      className="h-full flex opacity-50"
                      style={{ width: "50%" }}
                    >
                      <div
                        className="h-full bg-orange-600"
                        style={{ width: "50%" }}
                      />{" "}
                      {/* 0.2 ~ 0.6 */}
                      <div
                        className="h-full bg-red-600"
                        style={{ width: "50%" }}
                      />{" "}
                      {/* 0.6 ~ 1.0 */}
                    </div>

                    {/* 정중앙 기준점 (0.2) */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white z-20 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                  </div>
                </div>

                {/* 하단 의미 설명 가이드 */}
                <div className="relative flex justify-between items-start px-1">
                  <div className="text-left space-y-0.5">
                    <span className="block text-[10px] font-black text-purple-500 uppercase italic leading-none">
                      -1.0 Inverse
                    </span>
                    <p className="text-[8px] font-bold text-text-muted leading-tight">
                      미국과 정반대로
                      <br />
                      움직입니다
                    </p>
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 text-center space-y-0.5">
                    <span className="block text-[11px] font-black text-foreground/40 uppercase leading-none">
                      0.2
                    </span>
                    <p className="text-[8px] font-bold text-text-muted leading-tight whitespace-nowrap">
                      커플링/디커플링 경계
                    </p>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="block text-[10px] font-black text-red-500 uppercase italic leading-none">
                      +1.0 Coupling
                    </span>
                    <p className="text-[8px] font-bold text-text-muted leading-tight">
                      미국과 똑같이
                      <br />
                      움직입니다
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Injected Raw Data Grid within the same card */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {latestData && (
                <>
                  <div className="p-4 rounded-2xl bg-background/50 border border-border-subtle/50 flex items-center justify-between group/item hover:border-accent/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-text-muted uppercase">
                          KOSPI (T)
                        </span>
                        <span
                          className={clsx(
                            "text-[8px] font-black px-1.5 py-0.5 rounded",
                            latestData.kospi_change > 0
                              ? "text-red-500 bg-red-500/10"
                              : "text-blue-500 bg-blue-500/10",
                          )}
                        >
                          {latestData.kospi_change > 0 ? "+" : ""}
                          {latestData.kospi_change}%
                        </span>
                      </div>
                      <p className="text-xl font-black italic tabular-nums">
                        {latestData.kospi_value.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <span className="text-[10px] font-black text-accent italic">
                        KR
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/50 border border-border-subtle/50 flex items-center justify-between group/item hover:border-accent/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">
                          S&P 500 (T-1)
                        </span>
                        <span
                          className={clsx(
                            "text-[8px] font-black px-1.5 py-0.5 rounded",
                            latestData.sp500_change > 0
                              ? "text-red-500 bg-red-500/10"
                              : "text-blue-500 bg-blue-500/10",
                          )}
                        >
                          {latestData.sp500_change > 0 ? "+" : ""}
                          {latestData.sp500_change}%
                        </span>
                      </div>
                      <p className="text-xl font-black italic tabular-nums">
                        {latestData.sp500_value.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <span className="text-[10px] font-black text-blue-500 italic">
                        US
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Combined Footer Info */}
          <div className="pt-6 border-t border-border-subtle/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted">
                <div className="w-1 h-1 rounded-full bg-accent" />
                <p>양국 증시 개장일 기준 데이터 (휴장 시 업데이트 제외)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 동조화 지수 추이 그래프 */}
      <div className="p-6 md:p-8 rounded-[2.5rem] bg-card/5 border border-border-subtle/50 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChartIcon className="w-5 h-5 text-accent" />
            <h4 className="text-sm font-black italic uppercase tracking-widest">
              커플링 지수 추이
            </h4>
          </div>
        </div>

        <div className="h-[320px] w-full -ml-8 sm:-ml-10 md:-ml-12">
          <ResponsiveContainer width="112%" height="100%">
            <AreaChart
              data={history}
              margin={{ left: 0, right: 0, top: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="corrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset={off} stopColor="#ef4444" stopOpacity={0} />
                  <stop offset={off} stopColor="#3b82f6" stopOpacity={0} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="#ef4444" />
                  <stop offset={off} stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 9,
                  fontWeight: 800,
                  fill: "gray",
                }}
                tickFormatter={(str) => {
                  const parts = str.split("-");
                  return parts.length >= 3 ? `${parts[1]}.${parts[2]}` : str;
                }}
                axisLine={false}
                tickLine={false}
                dy={10}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                domain={[-1, 1]}
                ticks={[-1, -0.5, 0, 0.2, 0.5, 1]}
                tick={{
                  fontSize: 10,
                  fontWeight: 900,
                  fill: "gray",
                }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const val = Number(payload[0].value);
                    return (
                      <div className="px-4 py-3 rounded-xl bg-background border border-border-subtle shadow-2xl space-y-2">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter">
                          {data.date}
                        </p>
                        <div className="flex items-center gap-3">
                          <span
                            className={clsx(
                              "text-xl font-black italic",
                              val > 0.2 ? "text-red-500" : "text-blue-500",
                            )}
                          >
                            {val.toLocaleString(undefined, {
                              minimumFractionDigits: 4,
                            })}
                          </span>
                          <span
                            className={clsx(
                              "text-[8px] font-black px-1.5 py-0.5 rounded",
                              val > 0.2
                                ? "bg-red-500/10 text-red-500"
                                : val < -0.2
                                  ? "bg-purple-500/10 text-purple-500"
                                  : "bg-blue-500/10 text-blue-500",
                            )}
                          >
                            {getStatus(val).label}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={0.2}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="correlation_value"
                stroke="url(#lineGradient)"
                strokeWidth={2}
                fill="url(#corrGradient)"
                animationDuration={1500}
                baseLine={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 동조화 기준 가이드 (Subtle) */}
      <div className="px-8 py-6 rounded-[2rem] bg-secondary/5 border border-border-subtle/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { range: "0.6 ~ 1.0", label: "강한 커플링", color: "text-red-500" },
            {
              range: "0.2 ~ 0.6",
              label: "약한 커플링",
              color: "text-orange-500",
            },
            {
              range: "-0.2 ~ 0.2",
              label: "약한 디커플링",
              color: "text-blue-500",
            },
            {
              range: "-1.0 ~ -0.2",
              label: "강한 디커플링",
              color: "text-purple-500",
            },
          ].map((item) => (
            <div key={item.range} className="flex flex-col gap-0.5">
              <span className="text-[8px] font-black text-text-muted/50 uppercase tracking-tighter">
                {item.range}
              </span>
              <span className={clsx("text-[11px] font-black", item.color)}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 공유 모달 */}
      {showShareModal && (
        <MarketCorrelationShareCard
          data={{
            date: latestData?.date,
            value: currentCorr,
            status: status.label,
            desc: status.desc,
            kospi: {
              value: latestData?.kospi_value || 0,
              change: latestData?.kospi_change || 0,
            },
            sp500: {
              value: latestData?.sp500_value || 0,
              change: latestData?.sp500_change || 0,
            },
          }}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
