"use client";

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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

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

export function CurrencyDesk() {
  const [data, setData] = useState<CurrencyData | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Header & AI Report - Simplified for Mobile */}
      <div className="bg-gradient-to-br from-blue-500/10 via-background to-background border border-blue-500/20 rounded-[2rem] p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <RefreshCcw className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-black italic tracking-tight">
              {data.title}
            </h2>
            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-0.5">
              Live Currency Analysis
            </p>
          </div>
        </div>

        <div className="relative p-4 md:p-5 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-sm md:text-[15px] leading-relaxed text-foreground/90 font-bold whitespace-pre-line">
            {data.analysis}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Exchange Rates Grid */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(data.currency_data).map(([name, item]) => (
              <CurrencyRateCardWithGraph key={name} name={name} item={item} />
            ))}
          </div>
        </div>

        {/* Consideration / Tips - Simplified for Mobile */}
        <div className="bg-secondary/20 border border-border-subtle rounded-[2rem] p-5 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Wallet className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
              <h3 className="text-base md:text-lg font-black italic">
                환전 전략 팁
              </h3>
            </div>

            <div className="space-y-3 md:space-y-4">
              <TipItem
                id="01"
                color="emerald"
                title="분할 환전"
                desc="필요 예산을 3~4회로 나누어 평균 단가를 맞추세요."
              />
              <TipItem
                id="02"
                color="blue"
                title="우대율 확인"
                desc="트래블로그 등 앱을 통한 100% 우대 여부를 확인하세요."
              />
              <TipItem
                id="03"
                color="orange"
                title="현지 결제"
                desc="해외 결제 시 현지 통화 기준으로 결제해 수수료를 방지하세요."
              />
            </div>
          </div>

          <div className="mt-6 md:mt-8 pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-foreground/30">
              <AlertCircle className="w-3 h-3" />
              <span>*데이터 지연 가능성 및 실거래 환율 차이 유의</span>
            </div>
          </div>
        </div>
      </div>
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

function CurrencyRateCardWithGraph({
  name,
  item,
}: {
  name: string;
  item: CurrencyItem;
}) {
  const isPositive = item.change >= 0;

  const getIcon = (name: string) => {
    if (name.includes("USD")) return <DollarSign className="w-3.5 h-3.5" />;
    if (name.includes("JPY"))
      return <span className="font-black text-[10px]">¥</span>;
    if (name.includes("EUR"))
      return <span className="font-black text-[10px]">€</span>;
    if (name.includes("CNY"))
      return <span className="font-black text-[10px]">元</span>;
    return <RefreshCcw className="w-3.5 h-3.5" />;
  };

  return (
    <div className="bg-card/40 border border-border-subtle/50 rounded-2xl p-4 transition-all hover:border-blue-500/30 group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isPositive
                ? "bg-red-500/10 text-red-500"
                : "bg-emerald-500/10 text-emerald-500"
            }`}
          >
            {getIcon(name)}
          </div>
          <span className="text-xs font-black text-foreground/70 group-hover:text-foreground transition-colors uppercase">
            {name}
          </span>
        </div>
        <div
          className={`flex items-center gap-0.5 text-[10px] font-black ${
            isPositive ? "text-red-500" : "text-emerald-500"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {Math.abs(item.change)}%
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col">
          <span
            className={`text-xl font-black tracking-tighter ${
              isPositive ? "text-red-500" : "text-emerald-500"
            }`}
          >
            {item.price.toLocaleString()}
            <span className="text-[10px] ml-1 opacity-60">원</span>
          </span>
        </div>

        {/* Sparkline Graph */}
        {item.history && (
          <div className="h-10 w-24 md:w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={item.history}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? "#ef4444" : "#10b981"}
                  strokeWidth={2}
                  dot={false}
                />
                <YAxis hide domain={["dataMin", "dataMax"]} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
