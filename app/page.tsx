import { createClient } from "@supabase/supabase-js";
import { ThemeToggle } from "./components/ThemeToggle";
import { DateNavigation } from "./components/DateNavigation";
import { NewsDashboard } from "./components/NewsDashboard";
import { TrendingUp, Globe, Calendar } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: selectedDate } = await searchParams;
  const targetDate = selectedDate || new Date().toISOString().split("T")[0];

  // targetDate의 시작과 끝 범위를 설정 (UTC 기준)
  const startOfDay = `${targetDate}T00:00:00Z`;
  const endOfDay = `${targetDate}T23:59:59Z`;

  const { data: news, error } = await supabase
    .from("daily_news")
    .select("*")
    .filter("created_at", "gte", startOfDay)
    .filter("created_at", "lte", endOfDay)
    .order("created_at", { ascending: false });

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center">
        <p className="text-red-500 font-medium mb-2">Error</p>
        <p className="text-text-muted">
          데이터를 불러오는 중 문제가 발생했습니다.
        </p>
      </div>
    );

  const displayDate = new Date(targetDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <main className="min-h-screen bg-background text-foreground max-w-6xl mx-auto px-4 sm:px-8 transition-colors duration-500">
      <header className="py-12 sm:py-20 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <span className="text-[9px] sm:text-[10px] font-black tracking-[0.3em] uppercase text-accent/80 dark:text-accent">
              Daily Insights
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter italic mb-0.5 sm:mb-1">
            Hang on<span className="text-accent dark:text-accent">!</span>
          </h1>
          <p className="text-text-muted text-[11px] sm:text-sm font-medium tracking-wide">
            Global Economic Summary
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
          <DateNavigation currentDate={targetDate} />
          <ThemeToggle />
        </div>
      </header>

      {news && news.length > 0 ? (
        <NewsDashboard news={news} />
      ) : (
        <div className="col-span-full py-32 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-card border border-border-subtle flex items-center justify-center">
            <Calendar className="w-6 h-6 text-text-muted opacity-20" />
          </div>
          <p className="text-text-muted font-medium text-sm">
            이 날짜에는 등록된 뉴스가 없습니다.
          </p>
        </div>
      )}

      <footer className="py-20 text-center space-y-4 border-t border-border-subtle">
        <div className="flex items-center justify-center gap-2 opacity-50">
          <Globe className="w-4 h-4" />
          <span className="text-[10px] font-bold tracking-widest uppercase">
            Hang on! News Network
          </span>
        </div>
        <p className="text-text-muted text-[10px] font-medium">
          © {new Date().getFullYear()} Hang on! All rights reserved.
        </p>
      </footer>
    </main>
  );
}
