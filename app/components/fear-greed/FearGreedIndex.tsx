"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Info,
  BrainCircuit,
  ShieldAlert,
  ArrowUpRight,
  Share2,
  Microscope,
} from "lucide-react";
import { FearGreedShareCard } from "./FearGreedShareCard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface FearGreedData {
  value: number;
  description: string;
  title: string;
  analysis: string;
  advice: string[];
  updated_at: string;
}

export function FearGreedIndex({
  type = "global",
}: {
  type?: "global" | "kospi";
}) {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>(
    new Date().toLocaleString("ko-KR", {
      month: "numeric",
      day: "numeric",
    }),
  );

  const targetId = type === "kospi" ? 2 : 1;

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: res, error } = await supabase
          .from("fear_greed")
          .select("*")
          .eq("id", targetId)
          .single();

        if (res) {
          setData(res);
        }
      } catch (err) {
        console.error("Error fetching Fear & Greed data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [targetId]);

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-card/50 animate-pulse rounded-[2.5rem] border border-border-subtle" />
    );
  }

  if (!data) return null;

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
        {/* Left: Analog Gauge */}
        <div className="lg:col-span-5 bg-card/40 border border-border-subtle rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
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

        {/* Right: AI Analysis */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card/40 border border-border-subtle rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xl font-black italic mb-4 leading-tight">
              {data.title}
            </h3>
            <p className="text-[15px] leading-relaxed text-foreground/80 font-medium whitespace-pre-line">
              {data.analysis}
            </p>
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
