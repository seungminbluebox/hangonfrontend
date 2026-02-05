import { supabase } from "@/lib/supabase";
import { BackButton } from "../../components/layout/BackButton";
import { Metadata } from "next";
import { ReportViewer } from "./ReportViewer";
import { cache } from "react";

// 데이터 페칭 함수를 캐싱하여 metadata생성과 페이지 렌더링 시 중복 호출 방지
const getLatestReport = cache(async () => {
  const { data: report } = await supabase
    .from("daily_reports")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return report;
});

// 완전 동적 렌더링 대신 1시간마다 재검증하도록 설정 (성능 향상)
export const revalidate = 3600;

interface DailyReport {
  date: string;
  title: string;
  content: string;
  summary: string;
  audio_script?: string;
  audio_content?: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const report = await getLatestReport();

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
  const report = await getLatestReport();

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

  return <ReportViewer report={report as any} />;
}
