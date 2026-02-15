"use client";

import React from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MarketData } from "../../lib/market";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function MarketTicker({ data: initialData }: { data: MarketData[] }) {
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const symbols = [
    "KOSPI",
    "S&P 500",
    "나스닥",
    "원/달러 환율",
    "비트코인",
    "금 가격",
  ].join(",");

  const { data: liveData } = useSWR<MarketData[]>(
    `/api/market?symbols=${encodeURIComponent(symbols)}`,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: 60000, // 1분마다 자동 갱신
      revalidateOnFocus: true,
    },
  );

  React.useEffect(() => {
    setIsClient(true);
    // On desktop (lg), expand by default
    if (window.innerWidth >= 1024) {
      setIsExpanded(true);
    }
  }, []);

  if (!isClient) {
    return (
      <div className="w-full">
        <div className="h-12 w-full bg-card/20 animate-pulse rounded-2xl border border-border-subtle" />
      </div>
    );
  }

  const displayData = liveData && liveData.length > 0 ? liveData : [];

  if (isClient && displayData.length === 0) {
    return null;
  }

  // 요청된 6가지 지표만 필터링
  const filteredData = displayData.filter((item) =>
    [
      "KOSPI",
      "S&P 500",
      "나스닥",
      "원/달러 환율",
      "비트코인",
      "금 가격",
    ].includes(item.name),
  );

  return (
    <div className="w-full bg-card/40 border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
      {/* Summary Bar - Ticker Style when closed */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group w-full flex items-center justify-between p-3 sm:px-4 hover:bg-card transition-all duration-200 relative"
      >
        <div className="flex items-center flex-1 overflow-hidden">
          {/* Ticker text visible only when collapsed */}
          {!isExpanded && (
            <div className="flex items-center w-full">
              {/* LIVE Badge for Ticker */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-lg mr-4 shrink-0">
                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">
                  Live
                </span>
              </div>

              <div className="flex-1 overflow-hidden relative">
                <div className="animate-marquee group-hover:[animation-play-state:paused] flex items-center gap-8 pr-8">
                  {/* 원활한 루프를 위해 데이터를 두 번 반복 */}
                  {[...filteredData, ...filteredData].map((item, idx) => (
                    <div
                      key={`${item.name}-${idx}`}
                      className="flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span className="text-[10px] font-bold text-text-muted">
                        {item.name}
                      </span>
                      <span className="text-[11px] font-black">
                        {item.value}
                      </span>
                      {item.krwValue && (
                        <span className="text-[9px] font-medium text-text-muted/70">
                          ({item.krwValue})
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-bold ${
                          item.isUp
                            ? "text-red-500"
                            : item.isDown
                              ? "text-blue-500"
                              : "text-text-muted"
                        }`}
                      >
                        {item.isUp ? "▲" : item.isDown ? "▼" : ""}
                        {item.changePercent}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fade out mask to indicate more content */}
                <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background/80 to-transparent pointer-events-none" />
              </div>
            </div>
          )}

          {isExpanded && (
            <div className="flex items-center gap-2 animate-in">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold text-accent">
                실시간 시장지표
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-4">
          <div
            className={`
            flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300
            ${
              isExpanded
                ? "bg-text-muted/10 text-text-muted"
                : "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white"
            }
          `}
          >
            <span>{isExpanded ? "지표 접기" : "상세분석"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Grid Area */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded
            ? "max-h-[500px] opacity-100 border-t border-border-subtle/50"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 pt-4">
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="flex gap-3 min-w-max pb-1">
              {filteredData.map((item) => {
                const getLink = (name: string) => {
                  if (name === "나스닥") return "/nasdaq-futures";
                  if (name === "원/달러 환율") return "/currency-desk";
                  if (name === "KOSPI") return "/kospi-fear-greed";
                  return null;
                };
                const link = getLink(item.name);

                return (
                  <div
                    key={item.name}
                    onClick={() => link && router.push(link)}
                    className={`
                      flex flex-col p-3.5 bg-card border border-border-subtle/60 rounded-xl w-[160px] 
                      shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-none transition-all duration-300
                      ${
                        link
                          ? "cursor-pointer hover:border-accent/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 active:scale-95 group/card"
                          : "opacity-80"
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          {item.name}
                        </span>
                        {link && (
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                            <span className="text-[7px] font-black text-accent uppercase tracking-tighter sm:hidden">
                              Tap
                            </span>
                          </div>
                        )}
                      </div>
                      {item.isUp ? (
                        <TrendingUp className="w-3 h-3 text-red-500" />
                      ) : item.isDown ? (
                        <TrendingDown className="w-3 h-3 text-blue-500" />
                      ) : (
                        <Minus className="w-3 h-3 text-gray-500" />
                      )}
                    </div>

                    <div className="flex flex-col mb-2">
                      <div className="flex flex-col items-start leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black tracking-tight">
                            {item.value}
                          </span>
                          {link && (
                            <span className="text-[8px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded sm:opacity-0 sm:group-hover/card:opacity-100 transition-opacity ml-1 flex items-center gap-0.5">
                              {/* 모바일에서는 항상 보이고, 데스크탑에선 호버 시 보임 */}
                              <span className="sm:inline hidden">GO</span>
                              <span className="sm:hidden inline">VIEW</span>
                            </span>
                          )}
                        </div>
                        {item.krwValue && (
                          <span className="text-[10px] font-medium text-text-muted mt-0.5">
                            ({item.krwValue})
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-[10px] font-bold ${
                          item.isUp
                            ? "text-red-500"
                            : item.isDown
                              ? "text-blue-500"
                              : "text-gray-500"
                        }`}
                      >
                        <span>
                          {item.isUp ? "▲" : item.isDown ? "▼" : ""}
                          {item.change}
                        </span>
                        <span>{item.changePercent}</span>
                      </div>
                    </div>

                    <div className="h-8 w-full mt-auto opacity-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={item.history}>
                          <YAxis hide domain={["dataMin", "dataMax"]} />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={
                              item.isUp
                                ? "#ef4444"
                                : item.isDown
                                  ? "#3b82f6"
                                  : "#94a3b8"
                            }
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={true}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
