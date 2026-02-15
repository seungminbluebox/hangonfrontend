"use client";

import { useState } from "react";
import {
  TrendingUp,
  Library,
  Volume2,
  Play,
  Pause,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAudio } from "../../lib/AudioContext";

interface DailyReportBannerProps {
  report: {
    date: string;
    title: string;
    summary: string;
    audio_script?: string;
  };
}

export function DailyReportBanner({ report }: DailyReportBannerProps) {
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioContent, setAudioContent] = useState<string | null>(null);
  const { isPlaying, currentReport, play, pause, resume } = useAudio();

  const isThisReportPlaying = currentReport?.date === report.date && isPlaying;

  const handleToggleAudio = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 현재 이 리포트가 재생 중이면 일시정지
    if (currentReport?.date === report.date) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
      return;
    }

    // 이미 로드된 오디오 콘텐츠가 있는 경우 바로 재생
    if (audioContent) {
      play({ date: report.date, title: report.title }, audioContent);
      return;
    }

    // 오디오 데이터가 없는 경우 Supabase에서 온디맨드로 가져옴
    if (report.audio_script) {
      setIsAudioLoading(true);
      try {
        const { data, error } = await supabase
          .from("daily_reports")
          .select("audio_content")
          .eq("date", report.date)
          .single();

        if (error || !data?.audio_content) {
          throw new Error("Audio content not found");
        }

        setAudioContent(data.audio_content);
        play({ date: report.date, title: report.title }, data.audio_content);
      } catch (err) {
        console.error("Error loading audio:", err);
        alert("음성 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsAudioLoading(false);
      }
      return;
    }

    alert("이 리포트는 음성 재생을 지원하지 않습니다.");
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-0">
      <div className="relative overflow-hidden bg-gradient-to-br from-accent to-accent/90 rounded-2xl p-2.5 sm:p-3 text-white shadow-md shadow-accent/10 transition-all duration-300">
        <div className="relative z-10 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 ml-1">
            <div className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <Library className="w-4 h-4" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <h2 className="text-[13px] sm:text-[15px] font-black tracking-tight whitespace-nowrap">
                {(() => {
                  const [year, month, day] = report.date.split("-");
                  return `${parseInt(month)}월 ${parseInt(day)}일 브리핑`;
                })()}
              </h2>
              <span className="hidden lg:inline text-[10px] text-white/60 font-medium">
                오늘의 시장 핵심 요약
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleAudio}
              disabled={isAudioLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-black text-[11px] transition-all active:scale-95 bg-white text-accent hover:bg-white/90 shadow-sm whitespace-nowrap"
            >
              {isAudioLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isThisReportPlaying ? (
                <Pause className="w-3 h-3 fill-current" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              <span>{isThisReportPlaying ? "중지" : "듣기"}</span>
            </button>

            <Link
              href="/news/daily-report"
              className="flex items-center gap-1 py-1.5 px-3 rounded-full font-bold text-[11px] bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
            >
              읽기 <TrendingUp className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
