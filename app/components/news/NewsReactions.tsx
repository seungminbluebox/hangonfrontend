"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";

interface NewsReactionsProps {
  newsId: string;
  keyword?: string;
  summary?: string;
}

type ReactionType = "good" | "bad" | "neutral";

// 감정 분석 (키워드 기반)
const detectSentiment = (keyword: string, summary: string): ReactionType => {
  const goodWords = [
    "상승",
    "상승세",
    "급등",
    "최고",
    "돌파",
    "호재",
    "증가",
    "낙관",
    "랠리",
    "회복",
    "반등",
    "추월",
    "이익",
    "흑자",
    "수동",
  ];
  const badWords = [
    "하락",
    "하락세",
    "급락",
    "최저",
    "붕괴",
    "악재",
    "감소",
    "비관",
    "폭락",
    "위기",
    "손실",
    "적자",
    "부담",
    "우려",
    "전망치 하회",
  ];

  const text = (keyword + summary).toLowerCase();

  let goodCount = 0;
  let badCount = 0;

  goodWords.forEach((word) => {
    if (text.includes(word)) goodCount++;
  });
  badWords.forEach((word) => {
    if (text.includes(word)) badCount++;
  });

  if (goodCount > badCount) return "good";
  if (badCount > goodCount) return "bad";
  return "neutral";
};

// 24시간 동안 선형적으로 증가하는 가중치 계산
const getTimeWeight = (createdAt?: string): number => {
  if (!createdAt) return 1;

  const createdTime = new Date(createdAt).getTime();
  const currentTime = new Date().getTime();
  const elapsedMs = currentTime - createdTime;
  const growthMs = 24 * 60 * 60 * 1000; // 24시간

  if (elapsedMs <= 0) return 0;
  if (elapsedMs >= growthMs) return 1;

  return elapsedMs / growthMs;
};

// 결정론적 가짜 숫자 생성 (편향 적용)
export const getFakeCount = (
  id: string,
  type: ReactionType,
  sentiment?: ReactionType,
  createdAt?: string,
): number => {
  // 1. 고유 씨드 생성
  let hash = 0;
  const seed = id + type;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const baseRandom = Math.abs(hash);

  // 2. 가중 뉴스 여부 판단 (일부 뉴스는 아주 압도적인 반응을 보이게 함)
  const isExtreme = baseRandom % 10 < 3; // 30% 확률로 극단적인 뉴스

  let baseFakeCount = 0;

  // 3. 감정에 따른 범위 설정
  if (sentiment === "good") {
    if (type === "good") {
      baseFakeCount =
        (isExtreme ? 180 + (baseRandom % 121) : 60 + (baseRandom % 61)) * 10; // 극단적이면 1800~3000, 아니면 600~1200
    } else if (type === "bad") {
      baseFakeCount = (2 + (baseRandom % 8)) * 10; // 호재 뉴스에 악재는 20~100개로 아주 적게
    } else {
      baseFakeCount = (10 + (baseRandom % 21)) * 10; // 중립은 100~300
    }
  } else if (sentiment === "bad") {
    if (type === "bad") {
      baseFakeCount =
        (isExtreme ? 180 + (baseRandom % 121) : 60 + (baseRandom % 61)) * 10; // 극단적이면 1800~3000, 아니면 600~1200
    } else if (type === "good") {
      baseFakeCount = (2 + (baseRandom % 8)) * 10; // 악재 뉴스에 호재는 20~100개로 아주 적게
    } else {
      baseFakeCount = (10 + (baseRandom % 21)) * 10; // 중립은 100~300
    }
  } else {
    // 중립 뉴스는 숫자가 자잘하게 흩어지게
    baseFakeCount = (15 + (baseRandom % 36)) * 10; // 150~500
  }

  // 4. 시간에 따른 선형 증가 적용
  const weight = getTimeWeight(createdAt);
  return Math.floor(baseFakeCount * weight);
};

export const getTotalFakeCount = (
  id: string,
  keyword?: string,
  summary?: string,
  createdAt?: string,
): number => {
  const sentiment = detectSentiment(keyword || "", summary || "");
  return (
    getFakeCount(id, "good", sentiment, createdAt) +
    getFakeCount(id, "bad", sentiment, createdAt) +
    getFakeCount(id, "neutral", sentiment, createdAt)
  );
};

interface ReactionData {
  good: number;
  bad: number;
  neutral: number;
}

interface NewsReactionsProps {
  newsId: string;
  keyword?: string;
  summary?: string;
  createdAt?: string;
}

export function NewsReactions({
  newsId,
  keyword,
  summary,
  createdAt,
}: NewsReactionsProps) {
  const [counts, setCounts] = useState<ReactionData>({
    good: 0,
    bad: 0,
    neutral: 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clickEffect, setClickEffect] = useState<ReactionType | null>(null);

  useEffect(() => {
    // 뉴스 ID가 바뀔 때마다 상태 초기화
    setIsLoaded(false);
    setUserReaction(null);
    setCounts({ good: 0, bad: 0, neutral: 0 });

    async function fetchReactions() {
      // 1. 유저의 기존 반응 확인 (Local Storage)
      const stored = localStorage.getItem(`reaction_${newsId}`);
      if (stored) {
        setUserReaction(stored as ReactionType);
      } else {
        setUserReaction(null); // 저장된 게 없으면 확실히 null로
      }

      // 2. 실제 DB 데이터 가져오기 (단일 행 구조)
      const { data, error } = await supabase
        .from("news_reactions")
        .select("*")
        .eq("news_id", newsId)
        .single();

      const realCounts = {
        good: data?.good_count || 0,
        bad: data?.bad_count || 0,
        neutral: data?.neutral_count || 0,
      };

      // 3. 감정 분석
      const sentiment = detectSentiment(keyword || "", summary || "");

      // 4. 가짜 데이터와 합치기
      setCounts({
        good:
          getFakeCount(newsId, "good", sentiment, createdAt) + realCounts.good,
        bad: getFakeCount(newsId, "bad", sentiment, createdAt) + realCounts.bad,
        neutral:
          getFakeCount(newsId, "neutral", sentiment, createdAt) +
          realCounts.neutral,
      });
      setIsLoaded(true);
    }

    fetchReactions();
  }, [newsId, keyword, summary, createdAt]);

  const handleReact = async (type: ReactionType) => {
    if (!isLoaded || userReaction === type) return;

    const oldReaction = userReaction;

    // 로컬 상태 즉시 업데이트 (Optimistic Update)
    setCounts((prev) => {
      const next = { ...prev };
      if (oldReaction) {
        next[oldReaction] = Math.max(0, next[oldReaction] - 1);
      }
      next[type] = next[type] + 1;
      return next;
    });

    setUserReaction(type);
    localStorage.setItem(`reaction_${newsId}`, type);

    // 스플래시 애니메이션 효과
    setClickEffect(type);
    setTimeout(() => setClickEffect(null), 600);

    try {
      // 1. 현재 DB 값 가져오기
      const { data: currentData } = await supabase
        .from("news_reactions")
        .select("*")
        .eq("news_id", newsId)
        .single();

      const updates: any = {
        news_id: newsId,
        updated_at: new Date().toISOString(),
      };

      // 2. 기존 반응이 있었다면 해당 컬럼 -1
      if (oldReaction) {
        const oldCol = `${oldReaction}_count`;
        updates[oldCol] = Math.max(0, (currentData?.[oldCol] || 1) - 1);
      }

      // 3. 새로운 반응 컬럼 +1
      const newCol = `${type}_count`;
      updates[newCol] = (currentData?.[newCol] || 0) + 1;

      // 4. 다른 컬럼들도 초기값 유지 (insert 대비)
      if (!currentData) {
        if (!updates.good_count) updates.good_count = 0;
        if (!updates.bad_count) updates.bad_count = 0;
        if (!updates.neutral_count) updates.neutral_count = 0;
      }

      await supabase.from("news_reactions").upsert(updates);
    } catch (err) {
      console.error("Failed to update reaction:", err);
    }
  };

  const reactions: {
    type: ReactionType;
    label: string;
    icon: any;
    color: string;
    shadow: string;
  }[] = [
    {
      type: "good",
      label: "호재",
      icon: TrendingUp,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      shadow: "shadow-emerald-500/40",
    },
    {
      type: "neutral",
      label: "중립",
      icon: HelpCircle,
      color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
      shadow: "shadow-slate-500/40",
    },
    {
      type: "bad",
      label: "악재",
      icon: TrendingDown,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      shadow: "shadow-rose-500/40",
    },
  ];

  return (
    <div className=" border-t border-b border-border-subtle/40 mt-2 mb-2">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="w-1 h-3 rounded-full bg-accent" />
        <h4 className="text-[13px] font-bold text-foreground/70">
          이 소식은 어떤가요?
        </h4>
      </div>
      <div className="grid grid-cols-3 gap-2.5 pt-2">
        {reactions.map((r) => {
          const isSelected = userReaction === r.type;
          const isClicking = clickEffect === r.type;
          const Icon = r.icon;

          return (
            <button
              key={r.type}
              onClick={() => handleReact(r.type)}
              disabled={!isLoaded}
              className={`relative flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl border transition-all duration-500 overflow-visible ${
                isSelected
                  ? `${r.color} ${r.shadow} border-current -translate-y-1.5 shadow-[0_12px_25px_-5px_rgba(0,0,0,0.1)]`
                  : "border-border-subtle bg-card hover:border-accent hover:-translate-y-1 hover:shadow-lg group shadow-sm"
              } active:translate-y-0 active:scale-95`}
            >
              {/* Neon Glow Layer */}
              {isSelected && (
                <div
                  className={`absolute inset-x-2 -bottom-2 h-4 blur-xl rounded-full bg-current opacity-30 transition-opacity duration-500`}
                />
              )}

              <Icon
                className={`w-5 h-5 transition-all duration-500 ${
                  isSelected
                    ? `text-current ${isClicking ? "animate-[bounce_0.6s_ease-in-out_1] scale-125" : "scale-110"}`
                    : "text-text-muted group-hover:text-accent"
                }`}
              />

              <div className="flex flex-col items-center leading-none">
                <span
                  className={`text-[10px] font-bold mb-0.5 transition-all duration-300 ${isSelected ? "text-current" : "text-text-muted group-hover:text-foreground"}`}
                >
                  {r.label}
                </span>
                <span
                  className={`text-[13px] font-black tabular-nums transition-all duration-300 ${isSelected ? "text-current" : "text-foreground/80"}`}
                >
                  {isLoaded ? counts[r.type] : ".."}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
