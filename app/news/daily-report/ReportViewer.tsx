"use client";

import { useState } from "react";
import {
  TrendingUp,
  Info,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
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
}

export function ReportViewer({ report }: { report: DailyReport }) {
  const [showSummary, setShowSummary] = useState(false);

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
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-accent text-white rounded-full font-black text-xs md:text-sm shadow-[0_10px_20px_-5px_rgba(var(--accent-rgb),0.3)] hover:scale-105 hover:shadow-[0_15px_25px_-5px_rgba(var(--accent-rgb),0.4)] transition-all active:scale-95 group"
        >
          {showSummary ? (
            <X size={18} />
          ) : (
            <div className="relative">
              <FileText
                size={18}
                className="group-hover:rotate-12 transition-transform"
              />
            </div>
          )}
          <span>{showSummary ? "닫기" : "요약"}</span>
        </button>
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
            prose-p:mt-0 prose-p:mb-6
            prose-headings:text-foreground prose-headings:font-black
            prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-12 md:prose-h2:mt-20 prose-h2:mb-6 md:prose-h2:mb-8 prose-h2:border-b prose-h2:pb-4 prose-h2:border-border-subtle/50
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
                  <h2 className="text-xl md:text-2xl font-black mb-6 mt-10 border-b pb-4 border-border-subtle/50">
                    {children}
                  </h2>
                ),
                p: ({ children }) => <p className="m-0 mb-6">{children}</p>,
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
        <p className="text-sm text-text-muted leading-relaxed italic opacity-70">
          본 리포트는 AI 시장 분석 보고서로 투자 결과에 대한 법적 책임은
          없습니다.
        </p>
      </footer>
    </main>
  );
}
