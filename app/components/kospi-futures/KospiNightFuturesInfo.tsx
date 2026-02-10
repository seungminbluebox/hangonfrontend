"use client";

import React from "react";
import {
  TrendingUp,
  Activity,
  Zap,
  Clock,
  Globe,
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
import { KospiNightFuturesShareCard } from "./KospiNightFuturesShareCard";

interface KospiNightFuturesInfoProps {
  data: MarketData;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/90 backdrop-blur-md border border-border-subtle p-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-black text-foreground/40 uppercase">
            {data.fullDate}
          </p>
          <div className="w-1 h-1 rounded-full bg-foreground/20" />
          <p className="text-[10px] font-black text-foreground/40 uppercase">
            {data.time}
          </p>
        </div>
        <p className="text-sm font-black italic text-accent">
          {data.value.toLocaleString(undefined, {
            minimumFractionDigits: 1,
          })}
        </p>
      </div>
    );
  }
  return null;
};

export function KospiNightFuturesInfo({
  data: initialData,
}: KospiNightFuturesInfoProps) {
  const [data, setData] = React.useState(initialData);
  const [showShare, setShowShare] = React.useState(false);
  const [lastCheckTime, setLastCheckTime] = React.useState<string>(
    new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  // 1분마다 데이터 자동 갱신
  React.useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/market/night-futures");
        if (response.ok) {
          const nightData = await response.json();
          if (nightData) {
            setData(nightData);
            setLastCheckTime(
              new Date().toLocaleString("ko-KR", {
                timeZone: "Asia/Seoul",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
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
        <div className="md:col-span-2 bg-secondary/20 border border-border-subtle rounded-[2.5rem] flex flex-col justify-between overflow-hidden">
          <div className="p-6 md:p-10 pb-0">
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic tracking-tight leading-none mb-1.5">
                      코스피 야간선물
                    </h2>
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest leading-none">
                      www.hangon.co.kr
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowShare(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl text-[10px] font-black transition-all"
                >
                  <Share2 className="w-3 h-3" />
                  공유
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6 mb-2">
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
                } mb-2 w-fit`}
              >
                <TrendingUp
                  className={`w-5 h-5 ${!isUp && "rotate-180 transition-transform"}`}
                />
                <span className="text-xl font-black tracking-tight">
                  {data.change} ({data.changePercent})
                </span>
              </div>
            </div>
          </div>

          <div className="h-[300px] md:h-[350px] w-full mt-4 p-1 pr-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.history}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
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
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={100}
                  tickFormatter={(value, index) => {
                    const points = data.history;
                    if (!points || index < 0 || index >= points.length)
                      return value;

                    const current = points[index];
                    return `${current.fullDate} ${value}`;
                  }}
                  tick={{
                    fontSize: 10,
                    fontWeight: "bold",
                    fill: "currentColor",
                    opacity: 0.2,
                  }}
                />
                <YAxis
                  domain={["dataMin - 0.2", "dataMax + 0.2"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontWeight: "bold",
                    fill: "currentColor",
                    opacity: 0.2,
                  }}
                  tickFormatter={(value) => value.toFixed(2)}
                  width={60}
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
              코스피 야간선물은 주간 거래 종료(15:45) 후 저녁부터 다음 날
              새벽까지 거래되는 지수 선물입니다.
              <br />
              <br />
              밤사이 발생하는 미국 증시의 변동성을 국내 지수에 즉각 반영하므로,
              다음 날 국내 증시의 시초가를 예측하는 가장 강력한 선행지표입니다.
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
                  Night Session (야간)
                </p>
                <p className="font-black italic text-lg">18:00 ~ 익일 05:00</p>
              </div>
              <div className="pt-2 border-t border-accent/5">
                <p className="text-[10px] font-black text-foreground/30 uppercase mb-1">
                  Reference
                </p>
                <p className="text-sm font-bold text-foreground/60 leading-relaxed">
                  CME 연계 거래가 종료된 후 현재는 한국거래소(KRW) 자체
                  야간시장에서 거래됩니다.
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
              야간 선물 활용법
            </h2>
          </div>
          <p className="font-bold text-foreground/60 leading-relaxed">
            해외 증시가 폭락하거나 급등할 때, 야간 선물을 통해 국내 투자자들의
            대응 심리를 즉각 확인할 수 있습니다. 야간 선물의 종가는 다음 날 아침
            코스피 지수가 어느 수준에서 출발할지를 결정짓는 핵심 기준이 됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-secondary/10 rounded-3xl border border-border-subtle">
            <HelpCircle className="w-5 h-5 text-accent mb-3" />
            <h4 className="font-black text-sm mb-2">시초가 예측</h4>
            <p className="text-xs font-bold text-foreground/40 leading-relaxed">
              야간 선물 등락률은 다음 날 본장 시초가와 매우 높은 상관관계를
              가집니다.
            </p>
          </div>
          <div className="p-6 bg-secondary/10 rounded-3xl border border-border-subtle">
            <Activity className="w-5 h-5 text-accent mb-3" />
            <h4 className="font-black text-sm mb-2">글로벌 연동성</h4>
            <p className="text-xs font-bold text-foreground/40 leading-relaxed">
              미국 S&P 500이나 나스닥 100 지수의 흐름과 실시간으로 연동되어
              움직입니다.
            </p>
          </div>
        </div>
      </div>

      {showShare && (
        <KospiNightFuturesShareCard
          data={data}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
