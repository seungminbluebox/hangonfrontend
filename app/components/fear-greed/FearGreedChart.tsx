"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HistoryData {
  date: string;
  value: number;
}

interface FearGreedChartProps {
  data: HistoryData[];
}

export function FearGreedChart({ data }: FearGreedChartProps) {
  if (!data || data.length === 0) return null;

  // 날짜 포맷팅 (MM.DD)
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString("ko-KR", {
      month: "numeric",
      day: "numeric",
    }),
  }));

  return (
    <div className="w-full h-full min-h-[250px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "rgba(255,255,255,0.3)",
              fontSize: 10,
              fontWeight: "bold",
            }}
            minTickGap={30}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "rgba(255,255,255,0.3)",
              fontSize: 10,
              fontWeight: "bold",
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const val = payload[0].value as number;
                let color = "text-yellow-500";
                if (val <= 25) color = "text-red-500";
                else if (val <= 45) color = "text-orange-500";
                else if (val <= 75) color = "text-emerald-500";
                else color = "text-green-500";

                return (
                  <div className="bg-card/95 backdrop-blur-md border border-border-subtle p-3 rounded-2xl shadow-2xl">
                    <p className="text-[10px] font-black text-foreground/40 mb-1 uppercase tracking-tight">
                      {payload[0].payload.date}
                    </p>
                    <p className={`text-sm font-black italic ${color}`}>
                      {val}점
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
