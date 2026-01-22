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
import { NasdaqFuturesShareCard } from "./NasdaqFuturesShareCard";

interface NasdaqFuturesInfoProps {
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

export function NasdaqFuturesInfo({
  data: initialData,
}: NasdaqFuturesInfoProps) {
  const [data, setData] = React.useState(initialData);
  const [showShare, setShowShare] = React.useState(false);

  // 10초마다 데이터 자동 갱신
  React.useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/market");
        if (response.ok) {
          const marketData = await response.json();
          const nasdaqData = marketData.find(
            (m: any) => m.name === "나스닥 선물",
          );
          if (nasdaqData) {
            setData(nasdaqData);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 10000);

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
                <h2 className="text-xl font-black italic tracking-tight leading-none mb-1">
                  나스닥 100 선물
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                    Nasdaq 100 Futures (NQ=F)
                  </span>
                  <div className="w-1 h-1 rounded-full bg-foreground/20" />
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowShare(true)}
                className="w-11 h-11 flex items-center justify-center bg-accent/10 hover:bg-accent/20 text-accent rounded-2xl transition-all group"
              >
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl md:text-5xl font-black italic tracking-tighter ${isUp ? "text-red-500" : "text-blue-500"}`}
                  >
                    {data.value}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1.5 mt-1 font-black italic text-sm ${isUp ? "text-red-500" : "text-blue-500"}`}
                >
                  <TrendingUp className={`w-4 h-4 ${!isUp && "rotate-180"}`} />
                  <span>
                    {data.change} ({data.changePercent})
                  </span>
                </div>
              </div>
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
                  domain={["dataMin - 10", "dataMax + 10"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontWeight: "bold",
                    fill: "currentColor",
                    opacity: 0.3,
                  }}
                  orientation="right"
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

        <div className="space-y-6">
          <KnowledgeItem
            icon={<Zap className="w-4 h-4 text-orange-500" />}
            title="시장 선행 지표"
            desc="선물 시장은 현물 시장보다 먼저 열리며, 본장이 시작되기 전 시장의 온도계를 미리 보여주는 역할을 합니다."
          />
          <KnowledgeItem
            icon={<Globe className="w-4 h-4 text-blue-500" />}
            title="글로벌 심리의 척도"
            desc="전 세계 기술주와 성장주의 흐름을 가장 빠르게 반영하므로 글로벌 자금의 선호도를 즉각 알 수 있습니다."
          />
          <KnowledgeItem
            icon={<Gauge className="w-4 h-4 text-purple-500" />}
            title="레버리지와 리스크"
            desc="적은 자본으로 큰 거래가 가능해 변동성이 크며, 이는 시장의 공포와 탐욕을 극명하게 보여줍니다."
          />
        </div>
      </div>

      {/* Educational Content Section */}
      <div className="space-y-8 pt-10 border-t border-border/50">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-accent rounded-full" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-accent">
              나스닥 선물 완벽 가이드
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black italic tracking-tight">
            선물을 알아야 하는 이유
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-medium">
          <div className="space-y-4">
            <div className="p-1.5 px-3 bg-blue-500/10 text-blue-500 text-[10px] font-black w-fit rounded-lg uppercase tracking-widest">
              Concept 01
            </div>
            <h4 className="text-xl font-bold">미래 가격의 예고편</h4>
            <p className="text-sm text-foreground/60 leading-relaxed italic">
              "본장이 열리기 전, 시장의 답안지를 미리 보는 것과 같습니다."
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed font-bold">
              나스닥 선물은 24시간 거래되는 특성상, 미국 본장이 열리지 않는
              시간에도 전 세계의 경제 뉴스나 사건을 실시간으로 가격에
              반영합니다. 아침에 눈을 떠서 나스닥 선물을 확인하는 것만으로도
              오늘 우리 시장이나 저녁 미국 시장이 어떤 방향으로 움직일지 예측할
              수 있는 강력한 힌트가 됩니다.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-1.5 px-3 bg-blue-500/10 text-blue-500 text-[10px] font-black w-fit rounded-lg uppercase tracking-widest">
              Concept 02
            </div>
            <h4 className="text-xl font-bold">공포와 탐욕의 증폭기</h4>
            <p className="text-sm text-foreground/60 leading-relaxed italic">
              "변동성은 시장의 에너지를 보여줍니다."
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed font-bold">
              선물 시장은 증거금 제도를 통한 레버리지를 사용하기 때문에 작은
              뉴스에도 현물 시장보다 훨씬 민감하게 반응합니다. 급격한 상승이나
              하락은 투자자들의 심리가 어느 한쪽으로 쏠리고 있음을 의미하며,
              이는 단순한 가격 변동을 넘어 시장 참여자들의 현재 감정 상태를
              대변합니다.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-1.5 px-3 bg-orange-500/10 text-orange-500 text-[10px] font-black w-fit rounded-lg uppercase tracking-widest">
              Concept 03
            </div>
            <h4 className="text-xl font-bold">기술주 지형도의 나침반</h4>
            <p className="text-sm text-foreground/60 leading-relaxed italic">
              "AI, 반도체 등 혁신 기업들의 생존 보고서"
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed font-bold">
              나스닥 100 지수는 세계 최고의 기술 기업들로 구성되어 있습니다.
              나스닥 선물의 흐름을 파악하는 것은 단순히 숫자를 보는 것이 아니라,
              미래 성장을 주도하는 기업들에 대한 글로벌 자금의 신뢰도를 체크하는
              일입니다. 직접 투자하지 않더라도 산업의 패러다임을 이해하는 데
              필수적인 지표입니다.
            </p>
          </div>

          <div className="space-y-4 font-bold">
            <div className="p-1.5 px-3 bg-purple-500/10 text-purple-500 text-[10px] font-black w-fit rounded-lg uppercase tracking-widest">
              Concept 04
            </div>
            <h4 className="text-xl font-bold">
              헤징(Hedging): 보험으로서의 선물
            </h4>
            <p className="text-sm text-foreground/60 leading-relaxed italic">
              "하락장에서도 수익을 낼 수 있는 위험 관리 도구"
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              선물은 '매도(Short)' 포지션을 취할 수 있어 시장 하락에 배팅할 수
              있습니다. 이는 주식을 많이 보유한 투자자들에게는 일종의 보험
              역할을 합니다. 시장이 불안정할 때 선물의 매도세가 강력하다면, 기관
              투자자들이 위험에 대비해 보험을 들고 있다는 중요한 신호로 해석할
              수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <NasdaqFuturesShareCard
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
    <div className="p-6 rounded-3xl bg-secondary/20 border border-border-subtle group hover:bg-secondary/30 transition-all">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h4 className="text-sm font-black italic">{title}</h4>
      </div>
      <p className="text-xs text-foreground/50 leading-relaxed font-bold group-hover:text-foreground/70 transition-colors">
        {desc}
      </p>
    </div>
  );
}
