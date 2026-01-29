import { supabase } from "@/lib/supabase";
import { BackButton } from "../../components/layout/BackButton";
import { Calendar, TrendingUp, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface DailyReport {
  date: string;
  title: string;
  content: string;
  summary: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const { data: report } = await supabase
    .from("daily_reports")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!report) {
    return {
      title: "데일리 경제 리포트",
      description: "오늘의 글로벌 경제 핵심 요약을 확인하세요.",
    };
  }

  return {
    title: report.title,
    description: report.summary,
    openGraph: {
      title: report.title,
      description: report.summary,
      type: "article",
      publishedTime: report.date,
    },
  };
}

export default async function DailyReportPage() {
  const { data: report, error } = await supabase
    .from("daily_reports")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <BackButton />
        <h1 className="text-2xl font-bold mt-8">리포트를 찾을 수 없습니다.</h1>
        <p className="text-muted-foreground mt-2">
          오늘의 리포트가 아직 생성되지 않았거나 데이터를 불러오는데
          실패했습니다.
        </p>
      </div>
    );
  }

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

  // [설정] 들여쓰기 공백 크기를 조절하려면 아래의 값을 수정하세요 (예: 1ch, 12px, 1em 등)
  const indentSize = "0.5ch";

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 md:py-20">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <BackButton className="mb-0" />
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground bg-secondary/50 px-4 py-1.5 rounded-full border border-border-subtle/50 shadow-sm transition-all hover:bg-secondary w-fit">
          <Calendar className="w-3.5 h-3.5 sm:w-4 h-4 mr-2" />
          {report.date}
        </div>
      </div>

      <article className="md:bg-card md:border md:border-border-subtle/50 md:rounded-[2.5rem] md:overflow-hidden md:shadow-2xl relative">
        {/* 우아한 배경 장식 - 데스크탑에서만 표시 */}
        <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="hidden md:block absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="relative px-0 py-2 md:p-14">
          <div className="flex items-center gap-2 mb-4 md:mb-6 text-accent">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-accent/10 rounded-lg md:rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-bold text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em]">
              Daily Market Insights
            </span>
          </div>

          <h1 className="text-2xl md:text-5xl font-black mb-6 md:mb-8 leading-[1.3] md:leading-[1.2] tracking-tight text-foreground">
            {report.title}
          </h1>

          <div className="bg-accent/5 border-l-4 border-accent p-5 md:p-6 mb-8 md:mb-12 rounded-r-xl md:rounded-r-2xl shadow-sm">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="mt-1 bg-accent rounded-full p-1 shrink-0">
                <Info className="w-3.5 h-3.5 md:w-4 h-4 text-white" />
              </div>
              <p className="text-foreground/90 font-semibold leading-relaxed text-base md:text-lg">
                {report.summary}
              </p>
            </div>
          </div>

          <div
            className="prose prose-slate dark:prose-invert max-w-none 
            prose-p:text-foreground/80 prose-p:leading-7 md:prose-p:leading-8 prose-p:text-base md:prose-p:text-lg
            prose-p:indent-[var(--indent-size)] prose-p:mt-0 prose-p:mb-0
            prose-headings:text-foreground prose-headings:font-black
            prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-10 md:prose-h2:mt-16 prose-h2:mb-6 md:prose-h2:mb-8 prose-h2:border-b prose-h2:pb-4 prose-h2:border-border-subtle/50
            prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-8 md:prose-h3:mt-10 prose-h3:mb-3 md:prose-h3:mb-4 prose-h3:text-accent
            prose-strong:text-foreground prose-strong:font-bold prose-strong:bg-accent/5 prose-strong:px-1 prose-strong:rounded
            prose-li:text-foreground/80 prose-li:leading-7 md:prose-li:leading-8 prose-li:text-base md:prose-li:text-lg
            prose-hr:border-border-subtle/30 prose-hr:my-8 md:prose-hr:my-12
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
                p: ({ children }) => <p className="m-0 mb-4">{children}</p>,
                a: ({ children, href }) => {
                  const isInternal = href?.startsWith("/");
                  if (isInternal) {
                    return (
                      <Link
                        href={href || "#"}
                        className="inline text-accent font-bold underline decoration-accent/30 underline-offset-4 hover:decoration-accent transition-all decoration-clone"
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
                      className="inline font-bold text-accent/80 underline decoration-accent/20 underline-offset-4 hover:text-accent hover:decoration-accent transition-all decoration-clone"
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
        <p className="text-sm text-text-muted leading-relaxed">
          본 리포트는 단순 시장 동향 보고서로 투자의 최종 결정은 본인에게
          있습니다. <br className="hidden md:block" />
          금융 시장의 변동성은 매우 크므로 항상 신중하게 접근하시기 바랍니다.
        </p>
        <div className="mt-6 font-black italic opacity-20 text-3xl tracking-tighter hover:opacity-40 transition-opacity cursor-default">
          Hang on!
        </div>
      </footer>
    </main>
  );
}
