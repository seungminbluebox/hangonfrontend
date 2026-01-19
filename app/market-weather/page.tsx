import { MarketWeather } from "../components/MarketWeather";
import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
} from "lucide-react";

export const metadata: Metadata = {
  title: "글로벌 시장 기상도",
  description: "AI가 분석한 오늘의 글로벌 금융 시장 날씨 리포트입니다.",
};

export default function MarketWeatherPage() {
  const weatherGuides = [
    {
      status: "맑음",
      icon: <Sun className="w-4 h-4 text-yellow-500" />,
      desc: "시장이 전반적으로 큰 저항 없이 꾸준히 상승하는 상태",
    },
    {
      status: "구름조금",
      icon: <CloudSun className="w-4 h-4 text-yellow-300" />,
      desc: "지수별로 방향이 다르거나 아주 완만하게 움직이는 상태",
    },
    {
      status: "흐림",
      icon: <Cloud className="w-4 h-4 text-slate-400" />,
      desc: "투자자들의 경계심이 늘어나며 지수가 정체되거나 밀리는 상태",
    },
    {
      status: "비",
      icon: <CloudRain className="w-4 h-4 text-blue-400" />,
      desc: "금리나 환율 등 대외 악재로 인해 시장 전반이 하락하는 상태",
    },
    {
      status: "태풍",
      icon: <CloudLightning className="w-4 h-4 text-purple-500" />,
      desc: "예고 없는 급락이나 강한 공포가 시장을 지배하는 위기 상태",
    },
  ];

  const tempGuides = [
    {
      status: "30도 이상",
      color: "text-red-500",
      desc: "시장이 매우 뜨겁게 과열된 강한 상승장",
    },
    {
      status: "15 ~ 25도",
      color: "text-orange-400",
      desc: "적당히 따뜻하고 활기찬 안정적 시장",
    },
    {
      status: "0 ~ 10도",
      color: "text-blue-300",
      desc: "거래가 한산하고 활력이 없는 정체 국면",
    },
    {
      status: "영하 (0도 미만)",
      color: "text-blue-600",
      desc: "심리가 꽁꽁 얼어붙은 급격한 위축 상태",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground max-w-6xl mx-auto px-4 sm:px-8 pb-20">
      <div className="pt-8 sm:pt-16 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Back to Dashboard
          </span>
        </Link>
      </div>

      <div className="pt-2 sm:pt-5">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter italic">
              Market <span className="text-accent">Weather</span>
            </h1>
            <p className="text-text-muted font-medium mt-2">
              오늘의 글로벌 경제 기류를 한눈에 확인하세요.
            </p>
          </div>
        </header>

        <MarketWeather />

        <div className="mt-12 pt-10 border-t border-border-subtle/50">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <h2 className="text-sm font-black uppercase tracking-widest text-text-muted">
              기상도 가이드
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-accent">
                  날씨의 의미
                </h3>
                <div className="space-y-2">
                  {weatherGuides.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between text-[11px] font-bold p-2.5 bg-secondary/20 rounded-xl"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        {item.icon}
                        <span className="text-accent">{item.status}</span>
                      </div>
                      <span className="text-text-muted text-right">
                        {item.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-accent">
                  온도의 의미
                </h3>
                <div className="space-y-2">
                  {tempGuides.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between text-[11px] font-bold p-2.5 bg-secondary/20 rounded-xl"
                    >
                      <span className={`${item.color} shrink-0 w-24`}>
                        {item.status}
                      </span>
                      <span className="text-text-muted text-right">
                        {item.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-text-muted/60 italic">
                * 주식 일기예보는 국내(KOSPI, KOSDAQ) 및 해외 주요 지표를 종합
                분석한 결과이며, 투자 참고용으로만 활용해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
