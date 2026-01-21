"use client";

import { useState, useEffect } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Thermometer,
  Clock,
  TrendingUp,
  Share2,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { MarketWeatherShareCard } from "./MarketWeatherShareCard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface WeatherDetail {
  name: string;
  status: string;
  comment: string;
}

interface MarketWeather {
  weather: string;
  temperature: string;
  title: string;
  briefing: string;
  details: WeatherDetail[];
  updated_at: string;
}

export function MarketWeather() {
  const [data, setData] = useState<MarketWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      const { data: weatherData, error } = await supabase
        .from("market_weather")
        .select("*")
        .single();

      if (weatherData) {
        setData(weatherData);
      }
      setLoading(false);
    }
    fetchWeather();
  }, []);

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "맑음":
        return (
          <Sun className="w-16 h-16 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-pulse" />
        );
      case "구름조금":
        return (
          <CloudSun className="w-16 h-16 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.4)]" />
        );
      case "흐림":
        return (
          <Cloud className="w-16 h-16 text-slate-400 drop-shadow-[0_0_15px_rgba(148,163,184,0.4)]" />
        );
      case "비":
        return (
          <CloudRain className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)]" />
        );
      case "태풍":
        return (
          <CloudLightning className="w-16 h-16 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-bounce" />
        );
      default:
        return <Sun className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getTempColor = (tempStr: string) => {
    const temp = parseInt(tempStr);
    if (temp >= 30) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    if (temp >= 15)
      return "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]";
    if (temp >= 0) return "bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.5)]";
    return "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]";
  };

  const getFlag = (name: string) => {
    const n = name.toUpperCase();
    if (
      n.includes("KOSPI") ||
      n.includes("KOSDAQ") ||
      n.includes("코스피") ||
      n.includes("코스닥")
    )
      return "🇰🇷";
    if (
      n.includes("S&P") ||
      n.includes("NASDAQ") ||
      n.includes("나스닥") ||
      n.includes("10Y") ||
      n.includes("DOLLAR") ||
      n.includes("VIX")
    )
      return "🇺🇸";
    return "🌐";
  };

  const getStatusColor = (status: string) => {
    if (
      status.includes("맑음") ||
      status.includes("상승") ||
      status.includes("강세")
    )
      return "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
    if (status.includes("구름조금"))
      return "bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.5)]";
    if (
      status.includes("흐림") ||
      status.includes("정체") ||
      status.includes("보합")
    )
      return "bg-slate-400";
    if (
      status.includes("비") ||
      status.includes("하락") ||
      status.includes("약세")
    )
      return "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]";
    if (
      status.includes("태풍") ||
      status.includes("위기") ||
      status.includes("폭락")
    )
      return "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse";
    return "bg-slate-400";
  };

  if (loading)
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-card rounded-[2.5rem] border border-dashed border-border-subtle animate-pulse">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-black text-text-muted uppercase tracking-widest">
          Analysing Global Weather Patterns...
        </p>
      </div>
    );
  if (!data) return null;

  return (
    <>
      <div className="relative bg-card rounded-[2.5rem] border border-border-subtle overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        {/* Share Button Floating */}
        <button
          onClick={() => setShowShareModal(true)}
          className="absolute top-6 right-6 z-20 p-3 bg-white/10 hover:bg-white/20 dark:bg-black/10 dark:hover:bg-black/20 rounded-2xl backdrop-blur-md border border-white/10 transition-all active:scale-90 group"
        >
          <Share2 className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
        </button>

        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            {/* Weather Icon & Temp */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/40 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-8 rounded-[2.5rem] bg-secondary/30 relative backdrop-blur-sm border border-white/5 transition-transform duration-500 group-hover:scale-105">
                  {getWeatherIcon(data.weather)}
                  <div
                    className={`absolute -bottom-2 -right-2 ${getTempColor(data.temperature)} text-white px-4 py-1.5 rounded-full text-sm font-black flex items-center gap-1.5 shadow-lg`}
                  >
                    <Thermometer className="w-3.5 h-3.5" />
                    {data.temperature}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-black italic tracking-tighter">
                  {data.weather}
                </h3>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-text-muted">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em]">
                    Live Forecast
                  </p>
                </div>
              </div>
            </div>

            {/* Briefing Text */}
            <div className="flex-1 space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full border border-border-subtle/30">
                  <Clock className="w-3 h-3 text-accent" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                    {(() => {
                      const d = new Date(data.updated_at);
                      const month = d.getUTCMonth() + 1;
                      const day = d.getUTCDate();
                      return `${month}월 ${day}일 `;
                    })()}{" "}
                    Report
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-[1.1] italic text-foreground">
                  "{data.title}"
                </h2>
              </div>
              <p className="text-sm sm:text-base font-medium leading-relaxed text-text-muted/90 break-keep border-l-4 border-accent/20 pl-4 py-1">
                {data.briefing}
              </p>
            </div>
          </div>

          {/* Detailed Pills - Styled as Weather Station Data */}
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4 px-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-text-muted">
                Global Market Stations
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.details.map((detail, idx) => (
                <div
                  key={idx}
                  className="group relative bg-secondary/15 rounded-[1.5rem] p-5 border border-border-subtle/50 flex flex-col gap-2 hover:bg-secondary/25 transition-all duration-300 hover:border-accent/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-all">
                      <span className="text-xs">{getFlag(detail.name)}</span>
                      <span className="text-[11px] font-black uppercase tracking-widest italic group-hover:text-accent">
                        {detail.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-background/50 px-2 py-0.5 rounded-full border border-border-subtle/50">
                      <div
                        className={`w-1 h-1 rounded-full ${getStatusColor(detail.status)}`}
                      />
                      <span className="text-[10px] font-bold">
                        {detail.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold leading-snug break-keep text-text-muted group-hover:text-foreground transition-colors">
                    {detail.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showShareModal && data && (
        <MarketWeatherShareCard
          data={data}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}
