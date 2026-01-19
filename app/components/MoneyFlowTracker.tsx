"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Compass,
  ArrowRightLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { MoneyFlowShareCard } from "./MoneyFlowShareCard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface FlowItem {
  symbol: string;
  price: number;
  change: number;
  rel_vol: number;
}

interface MoneyFlowData {
  flow_data: {
    Risk: Record<string, FlowItem>;
    Safe: Record<string, FlowItem>;
    Sectors: Record<string, FlowItem>;
  };
  title: string;
  summary: string;
  analysis: string;
  strategy: string[];
  updated_at: string;
}

export function MoneyFlowTracker() {
  const [data, setData] = useState<MoneyFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [shareConfig, setShareConfig] = useState<{
    isOpen: boolean;
    type: "assets" | "sectors" | "report";
  }>({ isOpen: false, type: "report" });

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: res, error } = await supabase
          .from("money_flow")
          .select("*")
          .eq("id", 1)
          .single();

        if (res) {
          setData(res);
        }
      } catch (err) {
        console.error("Error fetching money flow data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-card/50 animate-pulse rounded-[2.5rem] border border-border-subtle" />
    );
  }

  if (!data)
    return (
      <div className="p-8 text-center bg-card/40 rounded-[2.5rem] border border-dashed border-border-subtle">
        <p className="text-foreground/50 font-medium">
          데이터를 준비 중입니다. 잠시만 기다려주세요.
        </p>
      </div>
    );

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Header Analysis */}
      <div className="bg-gradient-to-br from-accent/10 via-background to-background border border-accent/20 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
            </div>
            <h2 className="text-xl md:text-2xl font-black italic tracking-tight">
              {data.title}
            </h2>
          </div>
          <button
            onClick={() => setShareConfig({ isOpen: true, type: "report" })}
            className="p-2 md:p-2.5 bg-accent/10 hover:bg-accent/20 rounded-xl md:rounded-2xl transition-all"
            title="리포트 공유"
          >
            <Share2 className="w-4 h-4 md:w-5 md:h-5 text-accent" />
          </button>
        </div>
        <p className="text-base md:text-lg font-bold text-foreground/90 mb-4 leading-snug">
          {data.summary}
        </p>
        <div className="relative">
          <p
            className={`text-sm md:text-[15px] leading-relaxed text-foreground/70 font-medium whitespace-pre-line border-t border-accent/10 pt-4 transition-all duration-300 ${
              !showFullAnalysis ? "max-h-24 overflow-hidden" : "max-h-[1000px]"
            }`}
            style={
              !showFullAnalysis
                ? {
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 50%, transparent 100%)",
                  }
                : {}
            }
          >
            {data.analysis}
          </p>
          {!showFullAnalysis && (
            <button
              onClick={() => setShowFullAnalysis(true)}
              className="mt-2 text-xs font-black text-accent uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              분석 자세히 보기 <ChevronRight className="w-3 h-3 rotate-90" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Risk vs Safe Flow */}
        <div className="bg-card/40 border border-border-subtle rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-black italic">자산군별 자금 흐름</h3>
            </div>
            <button
              onClick={() => setShareConfig({ isOpen: true, type: "assets" })}
              className="p-2 hover:bg-muted rounded-xl transition-all"
              title="자산 흐름 공유"
            >
              <Share2 className="w-3.5 h-3.5 text-foreground/40" />
            </button>
          </div>

          <div className="space-y-6 md:space-y-8">
            {/* Risk Assets */}
            <div>
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-foreground/60">
                  위험 자산
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {Object.entries(data.flow_data.Risk).map(([name, item]) => (
                  <AssetCard key={name} name={name} item={item} />
                ))}
              </div>
            </div>

            {/* Safe Assets */}
            <div>
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-foreground/60">
                  안전자산
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {Object.entries(data.flow_data.Safe).map(([name, item]) => (
                  <AssetCard key={name} name={name} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sector Heatmap-ish Flow */}
        <div className="bg-card/40 border border-border-subtle rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 md:w-5 md:h-5 text-accent" />
              <h3 className="text-base md:text-lg font-black italic">
                국내 섹터별 돈의 쏠림
              </h3>
            </div>
            <button
              onClick={() => setShareConfig({ isOpen: true, type: "sectors" })}
              className="p-2 hover:bg-muted rounded-xl transition-all"
              title="섹터 쏠림 공유"
            >
              <Share2 className="w-3.5 h-3.5 text-foreground/40" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {Object.entries(data.flow_data.Sectors).map(([name, item]) => (
              <SectorCard key={name} name={name} item={item} />
            ))}
          </div>

          <div className="mt-6 md:mt-8 p-4 bg-accent/5 rounded-2xl border border-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent" />
              <span className="text-[10px] md:text-[11px] font-black text-accent uppercase tracking-wider">
                측정 방식
              </span>
            </div>
            <p className="text-[10px] md:text-[11px] font-medium text-foreground/50 leading-relaxed">
              *상대 거래량(Rel Vol)이 1.0보다 크면 평소보다 많은 돈이 해당
              섹터에 유입되고 있음을 의미합니다. 가격 상승과 높은 거래량이
              동반될 때 진짜 '돈의 흐름'으로 판단합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Strategies */}
      <div className="bg-secondary/5 border border-border-subtle rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
        <h3 className="text-[10px] md:text-xs font-black text-foreground/40 uppercase tracking-[0.2em] mb-4 md:mb-6 flex items-center gap-2">
          <ChevronRight className="w-3 md:w-3.5 h-3 md:h-3.5" />
          현재 상황에 맞는 투자 전략은?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {data.strategy.map((s, i) => (
            <div key={i} className="relative group">
              <div className="absolute -left-3 top-0 bottom-0 w-[2px] bg-accent/20 group-hover:bg-accent transition-colors" />
              <p className="text-xs md:text-sm font-bold text-foreground/80 leading-relaxed pl-2">
                {s}
              </p>
            </div>
          ))}
        </div>
      </div>

      {shareConfig.isOpen && (
        <MoneyFlowShareCard
          data={data}
          type={shareConfig.type}
          onClose={() => setShareConfig({ ...shareConfig, isOpen: false })}
        />
      )}
    </div>
  );
}

function AssetCard({ name, item }: { name: string; item: FlowItem }) {
  const isPositive = item.change >= 0;
  return (
    <div className="bg-background/40 border border-border-subtle/50 rounded-xl md:rounded-2xl p-3 md:p-4 transition-all hover:border-accent/30 group text-left">
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <span className="text-xs md:text-sm font-black text-foreground/70 group-hover:text-foreground transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
          {name}
        </span>
        {isPositive ? (
          <ArrowUpRight className="w-3 md:w-3.5 h-3 md:h-3.5 text-emerald-500" />
        ) : (
          <ArrowDownRight className="w-3 md:w-3.5 h-3 md:h-3.5 text-red-500" />
        )}
      </div>
      <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
        <span
          className={`text-base md:text-lg font-black tracking-tighter ${isPositive ? "text-emerald-500" : "text-red-500"}`}
        >
          {isPositive ? "+" : ""}
          {item.change}%
        </span>
        <span className="text-[9px] md:text-[10px] font-bold text-foreground/30 tabular-nums lowercase">
          vol {item.rel_vol}x
        </span>
      </div>
    </div>
  );
}

function SectorCard({ name, item }: { name: string; item: FlowItem }) {
  const isFocused = item.rel_vol > 1.2;
  const isPositive = item.change >= 0;

  return (
    <div
      className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
        isFocused
          ? "bg-accent/10 border-accent/40 shadow-[0_0_15px_rgba(var(--accent-rgb),0.05)]"
          : "bg-background/20 border-border-subtle/50"
      }`}
    >
      <div className="flex justify-between items-center mb-1 md:mb-2">
        <span
          className={`text-xs md:text-[13px] font-black ${isFocused ? "text-accent" : "text-foreground/60"} overflow-hidden text-ellipsis whitespace-nowrap`}
        >
          {name}
        </span>
        {isFocused && (
          <div className="flex items-center gap-1">
            <span className="text-[8px] md:text-[9px] font-black text-accent animate-pulse uppercase">
              Focus
            </span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-1">
        <span
          className={`text-lg md:text-xl font-black tracking-tighter ${isPositive ? "text-emerald-500" : "text-red-500"}`}
        >
          {item.change}%
        </span>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-bold text-foreground/30 uppercase leading-none mb-1 hidden md:block">
            Rel Vol
          </span>
          <span
            className={`text-[10px] md:text-xs font-black tabular-nums ${isFocused ? "text-accent" : "text-foreground/40"}`}
          >
            {item.rel_vol}x
          </span>
        </div>
      </div>
    </div>
  );
}
