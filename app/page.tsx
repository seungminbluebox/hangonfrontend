import { createClient } from "@supabase/supabase-js";
import { ThemeToggle } from "./components/ThemeToggle";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const { data: news, error } = await supabase
    .from("daily_news")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error)
    return (
      <div className="p-10 text-center">
        데이터를 불러오는 중 에러가 발생했어-
      </div>
    );

  return (
    // 배경색과 글자색을 다크모드에 따라 자동 전환
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white max-w-md mx-auto transition-colors duration-300 border-x border-gray-100 dark:border-gray-900">
      <header className="p-6 pt-12 border-b border-gray-100 dark:border-gray-900 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic mb-1">
            Hang on!
          </h1>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
            Global Economic Summary
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="divide-y divide-gray-100 dark:divide-gray-900">
        {news?.map((item) => (
          <article
            key={item.id}
            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
          >
            {/* 카테고리 태그 - 가독성을 위해 배경색 살짝 조정 */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                item.category === "KR"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : item.category === "US"
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              }`}
            >
              {item.category}
            </span>

            <h2 className="text-xl font-bold mt-3 leading-tight tracking-tight">
              {item.keyword}
            </h2>

            {/* 요약 내용 - 다크/라이트 테마에 따라 텍스트 대비 조정 */}
            <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed whitespace-pre-line">
                {item.summary}
              </p>
            </div>

            {/* 관련 기사 링크 - 테마 대응 */}
            <div className="mt-6 flex flex-wrap gap-2">
              {item.links?.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 py-1.5 px-3 rounded-md transition-all border border-gray-200 dark:border-gray-800 shadow-sm"
                >
                  {link.title.length > 20
                    ? link.title.slice(0, 20) + "..."
                    : link.title}{" "}
                  ↗
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>

      <footer className="p-10 text-center text-gray-400 dark:text-gray-600 text-xs border-t border-gray-100 dark:border-gray-900">
        © 2026 Hang on! All rights reserved.
      </footer>
    </main>
  );
}
