"use client";

import React, { useState } from "react";
import {
  Landmark,
  TrendingUp,
  Info,
  HelpCircle,
  ArrowRightLeft,
  Clock,
  Share2,
} from "lucide-react";
import { InterestRates } from "../../lib/rates";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { InterestRateShareCard } from "./InterestRateShareCard";
import { InterestRateChartShareCard } from "./InterestRateChartShareCard";

interface InterestRateInfoProps {
  initialData: InterestRates;
}

export function InterestRateInfo({ initialData }: InterestRateInfoProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isChartShareModalOpen, setIsChartShareModalOpen] = useState(false);
  // 현재 날짜 정보
  const today = new Date();
  const dateString = today.toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });

  const rates = {
    us: {
      value: initialData.us.current,
      name: "미국 연방금리 (Fed)",
      history: initialData.us.history,
    },
    kr: {
      value: initialData.kr.current,
      name: "한국 기준금리 (BoK)",
      history: initialData.kr.history,
    },
  };

  // 한-미 금리 데이터 통합
  const combinedHistory = initialData.kr.history.map((krPoint) => {
    const usPoint = initialData.us.history.find((p) => p.date === krPoint.date);
    return {
      date: krPoint.date,
      kr: krPoint.value,
      us: usPoint ? usPoint.value : null,
      gap: usPoint ? (usPoint.value - krPoint.value).toFixed(2) : null,
    };
  });

  const gap = (rates.us.value - rates.kr.value).toFixed(2);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length >= 1) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-md border border-border p-3 rounded-2xl shadow-2xl text-xs space-y-2">
          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest border-b border-border pb-1 mb-2">
            {data.date.slice(0, 4)}년 {data.date.slice(4)}월
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="font-bold text-foreground/60">미국 (Fed)</span>
              </div>
              <span className="font-black text-blue-500">
                {data.us?.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-foreground/60">한국 (BoK)</span>
              </div>
              <span className="font-black text-emerald-500">
                {data.kr?.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-8 pt-1 border-t border-border/50">
              <span className="font-bold text-orange-500">금리차</span>
              <span className="font-black text-orange-500">{data.gap}%p</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Info */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black italic tracking-tight">
                한·미 금리 현황
              </h2>
              <p className="text-[10px] md:text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] mt-0.5">
                Interest Rate Comparison & Dynamics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-full border border-accent/20 transition-all group"
            >
              <Share2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                공유하기
              </span>
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 w-fit backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-black text-emerald-500 uppercase tracking-wider">
                {dateString} 업데이트됨
              </span>
            </div>
          </div>
        </div>

        {/* Gap Info - Moved to Top with Enhanced UI */}
        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent rounded-[2rem]" />
          <div className="relative border border-orange-500/20 bg-background/40 backdrop-blur-md rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 group-hover:border-orange-500/40">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                <ArrowRightLeft className="w-7 h-7 text-orange-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black italic tracking-tight mb-1">
                  현재 한·미 금리 격차
                </h3>
                <p className="text-xs font-bold text-foreground/40 leading-relaxed max-w-sm">
                  두 국가 간의 금리 차이는 글로벌 자본의 흐름을 결정짓는 가장
                  강력한 동력 중 하나입니다.
                </p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-7xl font-black italic tracking-tighter text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                {gap}
              </span>
              <span className="text-2xl font-black italic text-orange-500/40">
                %p
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {/* US Rate Card */}
          <div className="group bg-gradient-to-br from-blue-600/5 to-transparent border border-blue-500/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 hover:border-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] md:text-xs font-bold text-blue-500">
                    US
                  </span>
                </div>
                <span className="text-[10px] md:text-sm font-black italic text-foreground/60 leading-tight">
                  {rates.us.name}
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="text-3xl md:text-7xl font-black italic tracking-tighter text-blue-500">
                {rates.us.value.toFixed(2)}
              </span>
              <span className="text-lg md:text-2xl font-black italic text-blue-500/40">
                %
              </span>
            </div>
          </div>

          {/* KR Rate Card */}
          <div className="group bg-gradient-to-br from-emerald-600/5 to-transparent border border-emerald-500/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 hover:border-emerald-500/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] md:text-xs font-bold text-emerald-500">
                    KR
                  </span>
                </div>
                <span className="text-[10px] md:text-sm font-black italic text-foreground/60 leading-tight">
                  {rates.kr.name}
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="text-3xl md:text-7xl font-black italic tracking-tighter text-emerald-500">
                {rates.kr.value.toFixed(2)}
              </span>
              <span className="text-lg md:text-2xl font-black italic text-emerald-500/40">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Unified Interest Rate Chart */}
        <div className="bg-secondary/20 border border-border-subtle rounded-[2.5rem] p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg font-black italic tracking-tight mb-1">
                한·미 금리 추이 비교
              </h3>
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                Historical Comparison
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsChartShareModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent/5 hover:bg-accent/10 text-accent rounded-full border border-accent/10 transition-all text-[10px] font-black uppercase tracking-wider group"
              >
                <Share2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                추이 공유
              </button>
              <div className="flex items-center gap-4 bg-background/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">
                    미국
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">
                    한국
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedHistory}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  opacity={0.05}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontWeight: "bold",
                    fill: "currentColor",
                    opacity: 0.4,
                  }}
                  tickFormatter={(value) =>
                    `${value.slice(2, 4)}.${value.slice(4)}`
                  }
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={{
                    fontSize: 10,
                    fontWeight: "bold",
                    fill: "currentColor",
                    opacity: 0.3,
                  }}
                  orientation="right"
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "currentColor",
                    strokeWidth: 1,
                    opacity: 0.1,
                  }}
                />
                <Line
                  name="미국"
                  type="monotone"
                  dataKey="us"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 0 }}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Line
                  name="한국"
                  type="monotone"
                  dataKey="kr"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 0 }}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Educational Content Section - Theoretical Concepts */}
        <div className="space-y-8 pt-10 border-t border-border/50">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-500 rounded-full" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">
                경제 이론 가이드
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black italic tracking-tight">
              금리 역학의 원리
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-medium">
            <div className="space-y-4">
              <div className="p-1.5 px-3 bg-blue-500/10 text-blue-500 text-[10px] font-black w-fit rounded-lg uppercase tracking-widest">
                Mechanism 01
              </div>
              <h4 className="text-xl font-bold">
                국제 자본의 이동 (Hot Money)
              </h4>
              <p className="text-sm text-foreground/60 leading-relaxed italic">
                "자산은 항상 더 높은 수익을 향해 흐릅니다."
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed font-bold">
                두 국가 간에 금리 차이가 발생하면, 투자자들은 상대적으로 낮은
                수익을 주는 곳에서 자금을 빼내 높은 이자를 지급하는 국가로
                자본을 이동시킵니다. 이를 통해 금리가 높은 국가는 자본 유입을
                경험하게 되며, 이는 해당 국가의 금융 자산 수요를 높이는 결과를
                낳습니다.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-1.5 px-3 bg-emerald-500/10 text-emerald-500 text-[10px] font-black w-fit rounded-lg uppercase tracking-widest">
                Mechanism 02
              </div>
              <h4 className="text-xl font-bold">환율 결정의 핵심 변수</h4>
              <p className="text-sm text-foreground/60 leading-relaxed italic">
                "금리는 통화의 가격을 결정하는 중력과 같습니다."
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed font-bold">
                특정 국가의 금리가 더 높다면 그 나라의 통화를 소유하려는 수요가
                늘어납니다. 이 과정에서 금리가 낮은 국가의 통화를 팔고 높은
                국가의 통화를 사게 되는데, 결과적으로 금리가 높은 국가의 통화
                가치는 상승(절상)하고 낮은 국가의 가치는 하락(절하)하게 됩니다.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-1.5 px-3 bg-orange-500/10 text-orange-500 text-[10px] font-black w-fit rounded-lg uppercase tracking-widest">
                Mechanism 03
              </div>
              <h4 className="text-xl font-bold">캐리 트레이드 (Carry Trade)</h4>
              <p className="text-sm text-foreground/60 leading-relaxed italic">
                "금리 차이를 이용한 빌려오기 전략"
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed font-bold">
                저금리 국가에서 돈을 빌려 고금리 국가의 자산에 투자하는 것을
                '캐리 트레이드'라고 합니다. 양국 간의 금리 격차가 벌어질수록
                이러한 거래가 활발해지며, 이는 고금리 국가의 자본시장 호황과
                통화 가치 상승을 더욱 부채질하는 동력이 됩니다.
              </p>
            </div>

            <div className="space-y-4 font-bold">
              <div className="p-1.5 px-3 bg-purple-500/10 text-purple-500 text-[10px] font-black w-fit rounded-lg uppercase tracking-widest">
                Mechanism 04
              </div>
              <h4 className="text-xl font-bold">
                수입 물가와 중앙은행의 딜레마
              </h4>
              <p className="text-sm text-foreground/60 leading-relaxed italic">
                "통화 가치 하락은 물가 상승으로 이어집니다."
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed">
                상대적 저금리로 인해 자국의 통화 가치가 떨어지면 수입하는
                물건들의 가격이 비싸지게 되어 국내 물가 상승(인플레이션)을
                유발합니다. 중앙은행은 금리를 낮게 유지해 경기를 부양하고
                싶어도, 물가를 잡기 위해 어쩔 수 없이 금리를 올려야 하는 상황에
                직면하게 됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isShareModalOpen && (
        <InterestRateShareCard
          data={initialData}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {isChartShareModalOpen && (
        <InterestRateChartShareCard
          data={combinedHistory}
          currentGap={gap}
          onClose={() => setIsChartShareModalOpen(false)}
        />
      )}
    </>
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
    <div className="p-5 rounded-3xl bg-secondary/20 border border-border-subtle group hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-bold">{title}</h4>
      </div>
      <p className="text-xs text-foreground/60 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}
