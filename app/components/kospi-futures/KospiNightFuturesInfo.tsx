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
  Info,
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
    <div className="space-y-8">
      {/* Live Quote Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-secondary/20 border border-border-subtle rounded-[2.5rem] flex flex-col justify-between overflow-hidden">
          <div className="p-6 md:p-8 pb-0 relative">
            <button
              onClick={() => setShowShare(true)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 flex items-center justify-center bg-accent/10 hover:bg-accent/20 text-accent/80 hover:text-accent rounded-xl transition-all group z-10 shadow-sm"
            >
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-8">
              <div className="flex flex-row md:flex-col items-baseline md:items-start justify-between w-full md:w-auto">
                <h2 className="text-xl font-black italic tracking-tight leading-none">
                  코스피 야간선물
                </h2>
              </div>

              <div className="flex flex-row md:flex-col items-baseline md:items-end justify-between w-full md:w-auto gap-1 md:pr-12">
                <span
                  className={`text-3xl md:text-4xl font-black italic tracking-tighter ${isUp ? "text-red-500" : "text-blue-500"}`}
                >
                  {data.value}
                </span>
                <div
                  className={`flex items-center gap-1 font-black italic text-[11px] ${isUp ? "text-red-500" : "text-blue-500"}`}
                >
                  <TrendingUp className={`w-3 h-3 ${!isUp && "rotate-180"}`} />
                  <span>
                    {data.change} ({data.changePercent})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[250px] w-full mt-4 p-1">
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
                      stopOpacity={0.1}
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
                  opacity={0.05}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={80}
                  tickFormatter={(value) => {
                    return value;
                  }}
                  tick={{
                    fontSize: 10,
                    fontWeight: "bold",
                    fill: "currentColor",
                    opacity: 0.3,
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
                    opacity: 0.3,
                  }}
                  tickFormatter={(value) => value.toFixed(2)}
                  width={60}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "currentColor",
                    strokeWidth: 1,
                    opacity: 0.1,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={isUp ? "#ef4444" : "#3b82f6"}
                  strokeWidth={2}
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
          <KnowledgeItem
            icon={<Info className="w-4 h-4 text-blue-500" />}
            title="코스피 야간선물"
            desc="주간 거래 종료(15:45) 후 저녁부터 다음 날 새벽까지 거래되는 지수 선물로, 글로벌 시장의 변화를 즉각 반영합니다."
          />
          <KnowledgeItem
            icon={<Zap className="w-4 h-4 text-orange-500" />}
            title="시초가 선행 지표"
            desc="밤사이 발생하는 미국 증시의 변동성을 반영하므로, 다음 날 국내 증시의 출발가를 예측하는 가장 강력한 지표입니다."
          />
          <KnowledgeItem
            icon={<Clock className="w-4 h-4 text-emerald-500" />}
            title="운영 시간"
            desc="야간 거래(18:00 ~ 익일 05:00) 동안 실시간으로 시장의 심리를 확인하고 대응 전략을 세울 수 있습니다."
          />
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

function KnowledgeItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-secondary/10 border border-border-subtle hover:bg-secondary/20 transition-all">
      <div className="flex items-center gap-2.5 mb-2">
        {icon}
        <h4 className="text-sm font-bold opacity-80">{title}</h4>
      </div>
      <p className="text-xs text-foreground/40 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}
