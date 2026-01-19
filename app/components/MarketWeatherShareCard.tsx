"use client";

import React, { useRef, useState, useEffect } from "react";
import { toBlob } from "html-to-image";
import {
  Download,
  Copy,
  Check,
  Share2,
  X,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Thermometer,
  TrendingUp,
  MapPin,
} from "lucide-react";

interface WeatherDetail {
  name: string;
  status: string;
  comment: string;
}

interface MarketWeatherData {
  weather: string;
  temperature: string;
  title: string;
  briefing: string;
  details: WeatherDetail[];
  updated_at: string;
}

interface MarketWeatherShareCardProps {
  data: MarketWeatherData;
  onClose: () => void;
}

export function MarketWeatherShareCard({
  data,
  onClose,
}: MarketWeatherShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [shareTheme, setShareTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (
      isMobile ||
      (typeof navigator !== "undefined" &&
        typeof navigator.share === "function")
    ) {
      setCanShare(true);
    }
  }, []);

  const getBlob = async () => {
    if (!cardRef.current) return null;

    return await toBlob(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      width: 330,
      height: 440, // Exact 3:4 ratio (330/110=3, 440/110=4)
      backgroundColor: "rgba(0,0,0,0)",
      style: {
        transform: "none",
        margin: "0",
        left: "0",
        top: "0",
        position: "relative",
        borderRadius: "35px",
        boxShadow: "none",
        border: "none",
        backgroundColor: shareTheme === "light" ? "#F0F4F8" : "#0f172a",
      },
    });
  };

  const handleDownload = async () => {
    setIsExporting(true);
    const blob = await getBlob();
    if (blob) {
      // @ts-ignore
      const { saveAs } = await import("file-saver");
      saveAs(
        blob,
        `hangon-market-weather-${new Date().toISOString().split("T")[0]}.png`,
      );
    }
    setIsExporting(false);
  };

  const handleCopyImage = async () => {
    const blob = await getBlob();
    if (!blob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setIsImageCopied(true);
      setTimeout(() => setIsImageCopied(false), 2000);
    } catch (err) {
      console.error("이미지 복사 실패:", err);
    }
  };

  const handleWebShare = async () => {
    const blob = await getBlob();
    if (!blob) return;

    const file = new File([blob], "market-weather.png", { type: "image/png" });

    try {
      await navigator.share({
        files: [file],
        title: "[Hang on!] 글로벌 시장 기상도",
        text: `${data.title}\n날씨: ${data.weather} (${data.temperature}°)`,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        console.error("공유 실패:", err);
    }
  };

  const getWeatherIcon = (weather: string) => {
    const iconClass = "w-16 h-16";
    switch (weather) {
      case "맑음":
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case "구름조금":
        return <CloudSun className={`${iconClass} text-yellow-300`} />;
      case "흐림":
        return <Cloud className={`${iconClass} text-slate-400`} />;
      case "비":
        return <CloudRain className={`${iconClass} text-blue-400`} />;
      case "태풍":
        return <CloudLightning className={`${iconClass} text-purple-500`} />;
      default:
        return <Sun className={`${iconClass} text-yellow-500`} />;
    }
  };

  const getTempColor = (tempStr: string) => {
    const temp = parseInt(tempStr);
    if (temp >= 30) return "text-red-500";
    if (temp >= 15) return "text-orange-400";
    if (temp >= 0) return "text-blue-300";
    return "text-blue-600";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md max-h-[90dvh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20 shrink-0">
          <div className="pl-2">
            <h3 className="font-black text-base">시장 기상도 공유</h3>
            <p className="text-[10px] text-text-muted font-medium">
              오늘의 시장 기류를 한 장에 담았습니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 bg-black/[0.02] dark:bg-white/[0.02] overflow-y-auto flex-1 flex flex-col items-center">
          <div className="pt-8 pb-12 flex flex-col items-center scale-[0.75] xs:scale-[0.85] sm:scale-95 origin-top transition-all duration-300">
            {/* Capture Area: 330x440 (3:4 ratio) */}
            <div
              ref={cardRef}
              className={`w-[330px] h-[440px] p-7 rounded-[35px] shadow-2xl relative overflow-hidden flex flex-col justify-between border ${
                shareTheme === "light"
                  ? "bg-[#F0F4F8] text-neutral-900 border-neutral-100"
                  : "bg-[#0f172a] text-white border-white/5"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span
                    className={`text-[10px] font-black tracking-widest uppercase opacity-40 ${shareTheme === "light" ? "text-neutral-500" : "text-white"}`}
                  >
                    Market Forecast
                  </span>
                  <p
                    className={`text-[10px] font-bold ${shareTheme === "light" ? "text-neutral-400" : "text-white/40"}`}
                  >
                    {new Date(data.updated_at).toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    기준
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 opacity-30 grayscale ${shareTheme === "light" ? "text-neutral-900" : "text-white"}`}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-tighter italic">
                    Hang on!
                  </span>
                </div>
              </div>

              {/* Central Weather Info */}
              <div className="flex flex-col items-center text-center py-4">
                <div
                  className={`p-6 rounded-[2.5rem] mb-4 ${shareTheme === "light" ? "bg-white/60 shadow-inner" : "bg-white/5"}`}
                >
                  {getWeatherIcon(data.weather)}
                </div>
                <h2 className="text-4xl font-black italic tracking-tighter mb-1 uppercase">
                  {data.weather}
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-4xl font-black ${getTempColor(data.temperature)}`}
                  >
                    {data.temperature}°
                  </span>
                  <span
                    className={`text-xs font-bold opacity-40 uppercase tracking-widest ${shareTheme === "light" ? "text-neutral-900" : "text-white"}`}
                  >
                    Temp
                  </span>
                </div>
              </div>

              {/* Briefing */}
              <div
                className={`p-5 rounded-3xl border ${shareTheme === "light" ? "bg-white border-neutral-100 shadow-sm" : "bg-white/5 border-white/10"}`}
              >
                <p className="text-[13px] font-bold leading-relaxed text-center italic break-keep">
                  "{data.title}"
                </p>
              </div>

              {/* Branding Footer */}
              <div className="flex justify-center items-center gap-2 mt-4 opacity-40">
                <div className="w-8 h-[1px] bg-current" />
                <span className="text-[9px] font-black tracking-[0.3em] uppercase">
                  www.hangon.co.kr
                </span>
                <div className="w-8 h-[1px] bg-current" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-muted/30 border-t border-border-subtle shrink-0">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setShareTheme("light")}
              className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                shareTheme === "light"
                  ? "bg-white border-accent text-accent shadow-md scale-105"
                  : "bg-white/50 border-transparent text-text-muted opacity-60 hover:opacity-100"
              }`}
            >
              Light Theme
            </button>
            <button
              onClick={() => setShareTheme("dark")}
              className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                shareTheme === "dark"
                  ? "bg-neutral-900 border-accent text-white shadow-md scale-105"
                  : "bg-neutral-900/50 border-transparent text-text-muted opacity-60 hover:opacity-100"
              }`}
            >
              Dark Theme
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex-1 h-14 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-accent/20"
            >
              <Download className="w-5 h-5" />
              <span>이미지 저장</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="w-14 h-14 bg-secondary hover:bg-secondary/80 rounded-2xl flex items-center justify-center transition-all active:scale-95 border border-border-subtle"
              title="이미지 복사"
            >
              {isImageCopied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>

            {canShare && (
              <button
                onClick={handleWebShare}
                className="w-14 h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-primary/20"
                title="공유하기"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
