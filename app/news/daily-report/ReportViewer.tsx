"use client";

import { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  Info,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { BackButton } from "../../components/layout/BackButton";

interface DailyReport {
  date: string;
  title: string;
  content: string;
  summary: string;
  audio_script?: string;
  audio_content?: string;
}

export function ReportViewer({ report }: { report: DailyReport }) {
  const [showSummary, setShowSummary] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 5초 후에 툴팁 자동으로 사라짐
    const timer = setTimeout(() => setShowTooltip(false), 80000);
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggleAudio = async () => {
    setShowTooltip(false);
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // 이미 DB에 저장된 오디오가 있는 경우 사용
    if (report.audio_content) {
      const audioUrl = `data:audio/mp3;base64,${report.audio_content}`;
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
      audio.play();
      setIsPlaying(true);
      return;
    }

    alert(
      "이 리포트는 음성 재생을 지원하지 않습니다. (최신 리포트부터 지원됩니다)",
    );
  };

  // 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${year}년 ${month}월 ${day}일`;
  };

  // 문장 단위로 분리하여 가독성을 높이는 헬퍼 함수
  const formattedContent = report.content
    .split("\n")
    .map((line: string) => {
      if (
        line.trim().startsWith("-") ||
        line.trim().startsWith("*") ||
        line.trim().match(/^\d+\./) ||
        line.trim().startsWith("#")
      ) {
        return line;
      }
      return line.replace(/([.!?])\s+(?=[가-힣A-Z])/g, "$1\n\n");
    })
    .join("\n");

  const indentSize = "0.5ch";

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 md:py-20 relative">
      {/* 상단 네비게이션 및 요약 버튼 */}
      <div className="mb-6 md:mb-10 flex items-center justify-between gap-4">
        <BackButton className="mb-0" />
        <div className="flex items-center gap-2">
          {/* Audio Button with Tooltip */}
          <div className="relative">
            {showTooltip && !isPlaying && report.audio_content && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 animate-bounce z-10">
                <div className="bg-accent text-white text-[10px] md:text-xs py-1.5 px-3 rounded-xl whitespace-nowrap shadow-lg relative">
                  바쁜 일상엔 핵심만 짚은 리포트를 들어보세요! 🎧
                  {/* Tooltip Arrow - centered */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-2 h-2 bg-accent rotate-45" />
                </div>
              </div>
            )}

            <button
              onClick={handleToggleAudio}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-2.5 px-6 md:px-10 py-2.5 min-w-[72px] md:min-w-0 rounded-2xl md:rounded-full font-black text-[10px] md:text-sm transition-all active:scale-95 group shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] hover:scale-105 ${
                isPlaying
                  ? "bg-red-500 text-white shadow-red-500/20"
                  : "bg-background border border-border-subtle/50 text-foreground"
              } ${!isPlaying && report.audio_content ? "ring-2 ring-accent/20 animate-pulse" : ""}`}
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Volume2
                  size={16}
                  className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform"
                />
              )}
              <span className="whitespace-nowrap">
                {isPlaying ? "중지" : "듣기"}
              </span>
            </button>
          </div>

          <button
            onClick={() => setShowSummary(!showSummary)}
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2.5 px-6 md:px-10 py-2.5 min-w-[72px] md:min-w-0 bg-accent text-white rounded-2xl md:rounded-full font-black text-[10px] md:text-sm shadow-[0_10px_20px_-5px_rgba(var(--accent-rgb),0.3)] hover:scale-105 hover:shadow-[0_15px_25px_-5px_rgba(var(--accent-rgb),0.4)] transition-all active:scale-95 group"
          >
            {showSummary ? (
              <X size={18} />
            ) : (
              <div className="relative">
                <FileText
                  size={16}
                  className="md:w-[18px] md:h-[18px] group-hover:rotate-12 transition-transform"
                />
              </div>
            )}
            <span className="whitespace-nowrap">
              {showSummary ? "닫기" : "요약"}
            </span>
          </button>
        </div>
      </div>

      {/* 요약 패널 (Show/Hide) */}
      {showSummary && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowSummary(false)}
        >
          <div
            className="bg-card/95 border border-border-subtle/50 w-full max-w-3xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-0 relative overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 상단 포인트 라인 */}
            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

            <div className="p-8 md:p-12">
              <div className="flex items-center gap-2 text-accent mb-8 md:mb-12">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                <div className="h-3 w-[1px] bg-border-subtle mx-1" />
                <span className="font-bold text-[10px] uppercase tracking-widest opacity-50">
                  Daily Insights
                </span>
              </div>

              <div className="space-y-10 md:space-y-14">
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black leading-tight text-foreground tracking-tight whitespace-pre-wrap break-keep">
                    {report.title}
                  </h2>

                  <div className="relative">
                    <div className="absolute top-0 left-0 w-6 h-0.5 bg-accent rounded-full" />
                    <p className="pt-6 text-base md:text-lg font-medium text-foreground/70 leading-relaxed break-keep">
                      {report.summary}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSummary(false)}
                  className="w-full py-4 bg-accent text-white font-bold rounded-2xl hover:brightness-105 active:scale-[0.98] transition-all shadow-lg shadow-accent/10 text-base md:text-lg"
                >
                  리포트 본문 읽기
                </button>
              </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
          </div>
        </div>
      )}

      {/* 메인 리포트 본체 */}
      <article className="md:bg-card md:border md:border-border-subtle/50 md:rounded-[2.5rem] md:overflow-hidden md:shadow-2xl relative">
        <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl" />

        <div className="relative px-0 py-2 md:p-14">
          {/* 요청하신 날짜 제목 */}
          <div className="flex flex-col gap-2 mb-10 md:mb-16">
            <div className="flex items-center gap-2 text-accent font-black text-xs uppercase tracking-widest">
              <Calendar size={14} />
              <span>Report Archive</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">
              {formatDate(report.date)}의 <br className="sm:hidden" />
              <span className="text-accent underline decoration-accent/20 underline-offset-8">
                데일리 리포트
              </span>
            </h1>
          </div>

          <div
            className="prose prose-slate dark:prose-invert max-w-none 
            prose-p:text-foreground/80 prose-p:leading-7 md:prose-p:leading-8 prose-p:text-base md:prose-p:text-lg
            prose-p:mt-0 prose-p:mb-0
            prose-headings:text-foreground prose-headings:font-black
            prose-h1:text-3xl md:prose-h1:text-5xl prose-h1:mb-2 prose-h1:mt-20 prose-h1:border-b prose-h1:border-border-subtle/50
            [&_h1:first-of-type]:mt-0
            prose-h2:text-xl md:prose-h2:text-2xl prose-h2:border-b prose-h2:border-border-subtle/50
            prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-8 md:prose-h3:mt-12 prose-h3:mb-4 prose-h3:text-accent
            prose-strong:text-foreground prose-strong:font-bold prose-strong:bg-accent/5 prose-strong:px-1 prose-strong:rounded
            prose-li:text-foreground/80 prose-li:leading-7 md:prose-li:leading-8 prose-li:text-base md:prose-li:text-lg
            prose-hr:border-border-subtle/30 prose-hr:my-10 md:prose-hr:my-16
            prose-a:no-underline"
            style={{ "--indent-size": indentSize } as any}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-xl md:text-2xl font-black mb-2 mt-4 border-b pb-0 border-border-subtle/50">
                    {children}
                  </h2>
                ),
                p: ({ children }) => <p className="m-0 mb-0">{children}</p>,
                a: ({ children, href }) => {
                  const isInternal = href?.startsWith("/");
                  if (isInternal) {
                    return (
                      <Link
                        href={href || "#"}
                        className="inline text-accent font-bold underline decoration-accent/30 underline-offset-4 hover:decoration-accent transition-all"
                      >
                        {children}
                      </Link>
                    );
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline font-bold text-accent/80 underline decoration-accent/20 underline-offset-4 hover:text-accent transition-all"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {formattedContent}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      <footer className="mt-16 py-10 border-t border-border-subtle/30 text-center">
        hangon. All rights reserved.
      </footer>
    </main>
  );
}
