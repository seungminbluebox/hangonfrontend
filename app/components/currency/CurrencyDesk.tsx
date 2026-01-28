"use client";

// Currency Dashboard component with live data and analysis
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  RefreshCcw,
  Wallet,
  AlertCircle,
  ArrowRightLeft,
  DollarSign,
  Info,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
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
import { CurrencyShareCard } from "./CurrencyShareCard";
import { supabase } from "../../../lib/supabase";

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
  updated_at: string;
}

export function CurrencyDesk({
  liveData: initialLiveData,
}: {
  liveData?: MarketData;
}) {
  const [data, setData] = useState<CurrencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [liveData, setLiveData] = useState<MarketData | undefined>(
    initialLiveData,
  );
  const [lastCheckTime, setLastCheckTime] = useState<string>(
    new Date().toLocaleString("ko-KR", {
      month: "numeric",
      day: "numeric",
    }),
  );

  // 1분마다 라이브 가격 데이터 갱신
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/market?symbols=${encodeURIComponent("원/달러 환율")}&full=true`,
        );
        if (response.ok) {
          const marketData = await response.json();
          const usdData = marketData[0];
          if (usdData) {
            setLiveData(usdData);
            setLastCheckTime(
              new Date().toLocaleString("ko-KR", {
                month: "numeric",
                day: "numeric",
              }),
            );
          }
        }
      } catch (err) {
        console.error("Live data polling error:", err);
      }
    }, 60000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: res, error } = await supabase
          .from("currency_desk")
          .select("*")
          .eq("id", 1)
          .single();

        if (res) {
          setData(res);
        }
      } catch (err) {
        console.error("Error fetching currency data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // AI 분석 데이터도 1분마다 갱신하여 최신 상태 유지
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[500px] bg-card/50 animate-pulse rounded-[2.5rem] border border-border-subtle" />
    );
  }

  if (!data)
    return (
      <div className="p-8 text-center bg-card/40 rounded-[2.5rem] border border-dashed border-border-subtle">
        <p className="text-foreground/50 font-medium">
          환율 데이터를 불러올 수 없습니다. 테이블 설정을 확인해주세요.
        </p>
      </div>
    );

  const currentPriceInt = liveData
    ? Math.floor(parseFloat(liveData.value.replace(/,/g, "")))
    : data?.currency_data["USD/KRW"]
      ? Math.floor(data.currency_data["USD/KRW"].price)
      : null;

  const isUp = liveData
    ? liveData.isUp
    : (data?.currency_data["USD/KRW"].change || 0) >= 0;

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Header & AI Report */}
      <div className="bg-gradient-to-br from-blue-600/10 via-background to-background border border-blue-500/20 rounded-[2rem] p-5 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-3xl font-black italic tracking-tight">
                  원/달러 환율 리포트
                </h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 rounded-full shrink-0">
                  <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">
                    Live
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] md:text-xs font-bold text-foreground/40 uppercase tracking-widest">
                  USD/KRW Analysis
                </p>
                <span className="text-[10px] font-bold text-foreground/30 border border-foreground/10 px-1.5 py-0.5 rounded">
                  {lastCheckTime} 업데이트됨
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-all text-sm font-black group"
            >
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              공유
            </button>
          </div>
        </div>

        {/* Main Highlight Card */}
        {(liveData || (data && data.currency_data["USD/KRW"])) && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 items-center">
            <div className="md:col-span-5 flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-black rounded-md uppercase tracking-wider">
                  Live
                </div>
                <span className="text-sm font-bold text-foreground/40 italic">
                  Global Reserve Currency
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                  {liveData
                    ? Math.floor(
                        parseFloat(liveData.value.replace(/,/g, "")),
                      ).toLocaleString()
                    : Math.floor(
                        data?.currency_data["USD/KRW"].price || 0,
                      ).toLocaleString()}
                  <span className="text-lg md:text-xl ml-1 font-bold opacity-40 italic">
                    KRW
                  </span>
                </h3>
              </div>
              <div
                className={`flex items-center gap-1.5 font-black text-sm ${
                  liveData
                    ? liveData.isUp
                      ? "text-red-500"
                      : "text-blue-500"
                    : data!.currency_data["USD/KRW"].change >= 0
                      ? "text-red-500"
                      : "text-blue-500"
                }`}
              >
                {liveData ? (
                  liveData.isUp ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )
                ) : data!.currency_data["USD/KRW"].change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {liveData
                  ? liveData.changePercent.replace("+", "").replace("-", "")
                  : Math.abs(data!.currency_data["USD/KRW"].change) + "%"}
                <span className="text-foreground/30 font-bold text-xs ml-1">
                  (전일대비)
                </span>
              </div>
            </div>

            <div className="md:col-span-7 h-28 md:h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    liveData
                      ? liveData.history
                      : data?.currency_data["USD/KRW"].history
                  }
                >
                  <defs>
                    <linearGradient
                      id="lineGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={liveData?.isUp ? "#ef4444" : "#3b82f6"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={liveData?.isUp ? "#ef4444" : "#3b82f6"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    opacity={0.05}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "12px",
                    }}
                    itemStyle={{
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "900",
                      padding: "0",
                    }}
                    labelStyle={{
                      display: "none",
                    }}
                    labelFormatter={() => ""}
                    separator=": "
                    formatter={(value: any) => [
                      `${Math.floor(Number(value)).toLocaleString()}원`,
                      "환율",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={liveData?.isUp ? "#ef4444" : "#3b82f6"}
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <YAxis
                    domain={["dataMin - 5", "dataMax + 5"]}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      Math.floor(value).toLocaleString()
                    }
                    tick={{
                      fontSize: 10,
                      fontWeight: "bold",
                      fill: "currentColor",
                      opacity: 0.3,
                    }}
                    orientation="right"
                  />
                  <XAxis
                    dataKey="time"
                    hide={false}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={60}
                    tick={{
                      fontSize: 10,
                      fontWeight: "bold",
                      fill: "currentColor",
                      opacity: 0.3,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI Analysis Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2"></div>
          <div className="relative p-5 md:p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="mb-4 pb-4 border-b border-white/5">
              <p className="text-sm md:text-base font-bold text-foreground/60 leading-relaxed flex items-center flex-wrap gap-1">
                현재 원/달러 환율은
                <span
                  className={`${isUp ? "text-red-500" : "text-blue-500"} font-black px-1.5 py-0.5 ${isUp ? "bg-red-500/10" : "bg-blue-500/10"} rounded-lg tracking-tight`}
                >
                  {currentPriceInt?.toLocaleString()}원
                </span>
                대를 기록 중이에요. 이를 바탕으로 한 시장 흐름 분석입니다.
              </p>
            </div>
            <div className="space-y-4">
              {data.analysis
                .split(". ")
                .filter((line) => line.trim().length > 0)
                .map((line, index) => (
                  <p
                    key={index}
                    className="text-sm md:text-base leading-relaxed text-foreground/90 font-bold flex gap-2"
                  >
                    <span className="text-blue-500 shrink-0">•</span>
                    <span>
                      {line.trim()}
                      {line.trim().endsWith(".") ? "" : "."}
                    </span>
                  </p>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Tips */}
      <div className="bg-secondary/20 border border-border-subtle rounded-[2rem] p-5 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Wallet className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg md:text-xl font-black italic">
            달러 투자 전략
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TipItem
            id="01"
            color="emerald"
            title="분할 환전"
            desc="환율 변동성을 헤지하기 위해 3~4회 나누어 환전하세요."
          />
          <TipItem
            id="02"
            color="blue"
            title="환전 우대"
            desc="주요 은행 앱이나 외화 선불카드를 활용해 100% 우대를 챙기세요."
          />
          <TipItem
            id="03"
            color="orange"
            title="미국 주식 투자"
            desc="단순 환전보다 우량한 미국 주식을 병행하는 전략을 고려하세요."
          />
        </div>

        <div className="mt-8 pt-4 border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>*실시간 시세와 약간의 차이가 있을 순 있습니다.</span>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShare && data && (
        <CurrencyShareCard
          data={data}
          liveData={liveData}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

function TipItem({
  id,
  color,
  title,
  desc,
}: {
  id: string;
  color: string;
  title: string;
  desc: string;
}) {
  const colorClass =
    color === "emerald"
      ? "bg-emerald-500/10 text-emerald-500"
      : color === "blue"
        ? "bg-blue-500/10 text-blue-500"
        : "bg-orange-500/10 text-orange-500";
  return (
    <div className="flex gap-3 items-start">
      <div
        className={`w-6 h-6 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}
      >
        <span className="text-[10px] font-black">{id}</span>
      </div>
      <div>
        <h4 className="font-black text-xs md:text-sm mb-0.5">{title}</h4>
        <p className="text-[11px] md:text-xs text-foreground/60 font-bold leading-relaxed line-clamp-2">
          {desc}
        </p>
      </div>
    </div>
  );
}
