"use client";

import React from "react";
import {
  TrendingUp,
  Info,
  Activity,
  Zap,
  Clock,
  Globe,
  Gauge,
  HelpCircle,
  Share2,
} from "lucide-react";
import { MarketData } from "../../lib/market";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { KospiFuturesShareCard } from "./KospiFuturesShareCard";

interface KospiFuturesInfoProps {
  data: MarketData;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 backdrop-blur-md border border-border-subtle p-3 rounded-2xl shadow-xl">
        <p className="text-[10px] font-black text-foreground/40 uppercase mb-1">
          {payload[0].payload.time}
        </p>
        <p className="text-sm font-black italic text-accent">
          {payload[0].value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
    );
  }
  return null;
};

export function KospiFuturesInfo({ data: initialData }: KospiFuturesInfoProps) {
  const [data, setData] = React.useState(initialData);
  const [showShare, setShowShare] = React.useState(false);
  const [lastCheckTime, setLastCheckTime] = React.useState<string>(
    new Date().toLocaleString("ko-KR", {
      month: "numeric",
      day: "numeric",
    }),
  );

  // 1분마다 데이터 자동 갱신
  React.useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/market?symbols=${encodeURIComponent(
            "코스피 200 선물",
          )}&full=true`,
        );
        if (response.ok) {
          const marketData = await response.json();
          const kospiData = marketData[0];
          if (kospiData) {
            setData(kospiData);
            setLastCheckTime(
              new Date().toLocaleString("ko-KR", {
                month: "numeric",
                day: "numeric",
              }),
            );
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 60000);

    return () => clearInterval(pollInterval);
  }, []);

  const isUp = data.isUp;

  return (
    <div className="space-y-12">
      {/* Live Quote Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-secondary/20 border border-border-subtle rounded-[2.5rem] p-8 pr-0 md:p-10 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mr-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-black italic tracking-tight leading-none mb-1.5">
                  코스피 200 선물
                </h2>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest leading-none">
                    KOSPI 200 Index (^KS200)
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-red-500/5 px-2 py-0.5 rounded-md border border-red-500/10 shrink-0">
                      <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                        Live
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">
                      {lastCheckTime} 업데이트됨
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl text-xs font-black transition-all self-start md:self-center"
            >
              <Share2 className="w-3.5 h-3.5" />
              공유
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6 mb-10 mr-8">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none">
                {data.value}
              </span>
              <span className="text-lg md:text-xl font-bold text-foreground/30 italic">
                PTS
              </span>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                isUp
                  ? "bg-red-500/10 border-red-500/20 text-red-500"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-500"
              } mb-2`}
            >
              <TrendingUp
                className={`w-5 h-5 ${!isUp && "rotate-180 transition-transform"}`}
              />
              <span className="text-xl font-black tracking-tight">
                {data.change} ({data.changePercent})
              </span>
            </div>
          </div>

          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.history}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isUp ? "#ef4444" : "#3b82f6"}
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor={isUp ? "#ef4444" : "#3b82f6"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="opacity-[0.03]"
                />
                <XAxis
                  dataKey="time"
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
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontWeight: "bold",
                    fill: "currentColor",
                    opacity: 0.3,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={isUp ? "#ef4444" : "#3b82f6"}
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Knowledge & Info Cards */}
        <div className="space-y-6">
          <div className="bg-secondary/10 border border-border-subtle rounded-[2rem] p-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground/40">
                Quick Fact
              </h3>
            </div>
            <p className="font-bold leading-relaxed text-foreground/80">
              코스피 200 선물은 국내 상장사 중 우량주 200개를 모은 코스피 200
              지수를 미래에 사고팔기로 약속하는 상품입니다.
              <br />
              <br />
              본장 개장 전후의 흐름을 통해 당일 시장의 방향성을 미리 가늠할 수
              있는 핵심적인 선행지표입니다.
            </p>
          </div>

          <div className="bg-accent/5 border border-accent/10 rounded-[2rem] p-8">
            <div className="flex items-center gap-2 mb-4 text-accent">
              <Clock className="w-4 h-4" />
              <h3 className="text-sm font-black uppercase tracking-widest opacity-60">
                Trading Hours
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-foreground/30 uppercase mb-1">
                  Day Session (주간)
                </p>
                <p className="font-black italic text-lg">08:45 ~ 15:45</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-foreground/30 uppercase mb-1">
                  Night Session (야간)
                </p>
                <p className="font-black italic text-lg opacity-50">
                  18:00 ~ 익일 05:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-border-subtle">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center">
              <Globe className="w-6 h-6 text-foreground/40" />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight">
              지수 선물 이해하기
            </h2>
          </div>
          <p className="font-bold text-foreground/60 leading-relaxed">
            나스닥 선물과 마찬가지로 코스피 선물도 실제 시장 지수보다 먼저
            움직이며 투자자들의 심리를 반영합니다. 외국인과 기관의 선물 매매
            동향은 현물 시장에도 강력한 영향을 미치므로 반드시 체크해야 할
            지표입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-secondary/10 rounded-3xl border border-border-subtle">
            <HelpCircle className="w-5 h-5 text-accent mb-3" />
            <h4 className="font-black text-sm mb-2">베이시스(Basis)</h4>
            <p className="text-xs font-bold text-foreground/40 leading-relaxed">
              선물가격과 현물가격의 차이를 말하며, 시장의 고평가/저평가 여부를
              판단합니다.
            </p>
          </div>
          <div className="p-6 bg-secondary/10 rounded-3xl border border-border-subtle">
            <Activity className="w-5 h-5 text-accent mb-3" />
            <h4 className="font-black text-sm mb-2">콘탱고 / 백워데이션</h4>
            <p className="text-xs font-bold text-foreground/40 leading-relaxed">
              선물가격이 현물보다 높은(정상) 상태를 콘탱고, 낮은 상태를
              백워데이션이라 합니다.
            </p>
          </div>
        </div>
      </div>

      {showShare && (
        <KospiFuturesShareCard
          data={data}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
