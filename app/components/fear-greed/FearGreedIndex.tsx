"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  Info,
  BrainCircuit,
  ShieldAlert,
  ArrowUpRight,
  Share2,
  Microscope,
  TrendingUp,
} from "lucide-react";
import { FearGreedShareCard } from "./FearGreedShareCard";
import { FearGreedChart } from "./FearGreedChart";
import { supabase } from "@/lib/supabase";

interface FearGreedData {
  value: number;
  description: string;
  title: string;
  analysis: string;
  advice: string[];
  updated_at: string;
}

interface FearGreedHistory {
  date: string;
  value: number;
}

const fearGreedFetcher = async (key: string): Promise<FearGreedData | null> => {
  const [type, targetId] = key.split(":");
  const { data, error } = await supabase
    .from("fear_greed")
    .select("value, description, title, analysis, advice, updated_at")
    .eq("id", targetId)
    .single();
  if (error) return null;
  return (data as FearGreedData) || null;
};

const historyFetcher = async (key: string): Promise<FearGreedHistory[]> => {
  const [type, historyTable] = key.split(":");
  const { data: histRes, error } = await supabase
    .from(historyTable)
    .select("created_at, value")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return [];

  return (histRes || [])
    .map((h) => ({
      date: h.created_at,
      value: h.value,
    }))
    .reverse();
};

export function FearGreedIndex({
  type = "global",
}: {
  type?: "global" | "kospi";
}) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const targetId = type === "kospi" ? 2 : 1;
  const historyTable =
    type === "kospi" ? "fear_greed_history_kr" : "fear_greed_history_us";

  // SWR: 현재 지수 페칭
  const { data } = useSWR<FearGreedData | null>(
    `fear_greed:${targetId}`,
    fearGreedFetcher,
    { refreshInterval: 60000 },
  );

  // SWR: 히스토리 페칭
  const { data: history = [] } = useSWR<FearGreedHistory[]>(
    `history:${historyTable}`,
    historyFetcher,
    { refreshInterval: 60000 },
  );

  const lastCheckTime = data?.updated_at
    ? new Date(data.updated_at).toLocaleString("ko-KR", {
        month: "numeric",
        day: "numeric",
      })
    : new Date().toLocaleString("ko-KR", {
        month: "numeric",
        day: "numeric",
      });

  if (!data) {
    return (
      <div className="w-full h-[400px] bg-card/50 animate-pulse rounded-[2.5rem] border border-border-subtle" />
    );
  }

  // Gauge calculation: 0 to 180 degrees (from -90 to +90)
  const needleRotation = (data.value / 100) * 180 - 90;

  const getStatusInfo = (value: number) => {
    if (value <= 25)
      return {
        label: "극도의 공포",
        text: "text-red-500",
        bg: "bg-red-500",
        border: "border-red-500",
      };
    if (value <= 45)
      return {
        label: "공포",
        text: "text-orange-500",
        bg: "bg-orange-500",
        border: "border-orange-500",
      };
    if (value <= 55)
      return {
        label: "중립",
        text: "text-yellow-500",
        bg: "bg-yellow-500",
        border: "border-yellow-500",
      };
    if (value <= 75)
      return {
        label: "탐욕",
        text: "text-emerald-500",
        bg: "bg-emerald-500",
        border: "border-emerald-500",
      };
    return {
      label: "극도의 탐욕",
      text: "text-green-500",
      bg: "bg-green-500",
      border: "border-green-500",
    };
  };

  const statusInfo = getStatusInfo(data.value);

  // SVG Gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const semiCircumference = circumference / 2;

  // Segment proportions (total 100 units)
  const segments = [
    { size: 25, color: "text-red-500" },
    { size: 20, color: "text-orange-500" },
    { size: 10, color: "text-yellow-400" },
    { size: 20, color: "text-emerald-500" },
    { size: 25, color: "text-green-500" },
  ];

  let currentOffset = 0;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Microscope className="w-5 h-5 text-accent" />
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight italic">
              <span className="text-accent">
                {type === "kospi" ? "코스피" : ""} 공탐지수
              </span>{" "}
            </h2>
            <span className="text-[10px] font-bold text-foreground/30 leading-none">
              {lastCheckTime} 업데이트됨
              <br />장 마감 시각에 업데이트됩니다.
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-4 py-2 rounded-2xl border border-accent/20 transition-all font-black text-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          공유하기
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Analog Gauge & History Chart */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Analog Gauge Card */}
          <div className="bg-card/40 border border-border-subtle rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative shadow-sm">
            <div className="relative w-72 h-36 mt-8 overflow-hidden">
              {/* SVG Arc segments */}
              <svg
                className="absolute top-0 left-0 w-72 h-72 -rotate-180"
                viewBox="0 0 100 100"
              >
                {/* Background Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={`${semiCircumference} ${circumference}`}
                  className="text-secondary/10"
                />
                {/* Colored Segments */}
                {segments.map((seg, i) => {
                  const strokeDasharray = `${(seg.size / 100) * semiCircumference} ${circumference}`;
                  const strokeDashoffset = -currentOffset;
                  currentOffset += (seg.size / 100) * semiCircumference;
                  return (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className={`${seg.color} opacity-80`}
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                  );
                })}
              </svg>

              {/* The Needle */}
              <div
                className="absolute bottom-0 left-1/2 w-2 h-32 origin-bottom transition-all duration-1000 ease-out z-10 bg-foreground"
                style={{
                  transform: `translateX(-50%) rotate(${needleRotation}deg)`,
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                }}
              />
              {/* Needle Center Point */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-foreground rounded-full z-20 shadow-lg border-[6px] border-card" />
            </div>

            <div className="mt-8 text-center bg-secondary/5 px-8 py-4 rounded-3xl border border-border-subtle/30 shadow-inner">
              <div
                className={`text-7xl font-black  tracking-tighter transition-colors duration-500 ${statusInfo.text}`}
              >
                {Math.round(data.value)}
              </div>
              <div
                className={`text-sm font-black mt-1 uppercase tracking-[0.3em] ${statusInfo.text}`}
              >
                {statusInfo.label}
              </div>
            </div>

            <div className="absolute bottom-4 right-8 flex items-center gap-1.5 opacity-30">
              <div className="w-1 h-1 rounded-full bg-foreground" />
              <span className="text-[10px] font-bold tracking-tight">
                Market Mood Gauge
              </span>
            </div>
          </div>

          {/* history chart */}
          {showChart && history.length > 0 && <FearGreedChart data={history} />}
        </div>

        {/* Right: AI Analysis */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card/40 border border-border-subtle rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xl font-black italic mb-4 leading-tight">
              {data.title}
            </h3>
            <div className="space-y-4">
              {data.analysis
                .split(". ")
                .filter((line) => line.trim().length > 0)
                .map((line, index) => (
                  <p
                    key={index}
                    className="text-[15px] leading-relaxed text-foreground/80 font-medium flex gap-2"
                  >
                    <span className="text-accent shrink-0">•</span>
                    <span>
                      {line.trim()}
                      {line.trim().endsWith(".") ? "" : "."}
                    </span>
                  </p>
                ))}
            </div>
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-accent" />
              <h4 className="text-xs font-black text-accent uppercase tracking-[0.2em]">
                투자 대응 전략
              </h4>
            </div>
            <div className="space-y-3">
              {data.advice.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-accent">
                      {idx + 1}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground/70 tracking-tight">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <FearGreedShareCard
          data={data}
          onClose={() => setShowShareModal(false)}
          type={type}
        />
      )}
    </div>
  );
}
