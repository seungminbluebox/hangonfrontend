"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";
import { RollingNumber } from "./RollingNumber";

interface NewsReactionsProps {
  newsId: string;
  keyword?: string;
  summary?: string;
  createdAt?: string;
  onReactionChange?: (counts: {
    good: number;
    bad: number;
    neutral: number;
  }) => void;
  serverTime?: number;
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
const getTimeWeight = (createdAt?: string, now?: number): number => {
  if (!createdAt) return 1;

  const createdTime = new Date(createdAt).getTime();
  const currentTime = now || new Date().getTime();
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
  now?: number,
): number => {
  // 1. 고유 씨드 생성 (v4 업데이트 - 수치 다양화 및 10단위 절대 방지)
  let hash = 0;
  const salts: Record<ReactionType, string> = {
    good: "gv4_good_99",
    bad: "bv4_bad_44",
    neutral: "nv4_neutral_22",
  };
  const seed = id + (salts[type] || type);
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const baseRandom = Math.abs(hash);

  // 2. 가중 뉴스 여부 판단
  const isExtreme = baseRandom % 100 < 25;

  let baseFakeCount = 0;

  // 3. 감정에 따른 범위 설정
  if (sentiment === "good") {
    if (type === "good") {
      baseFakeCount = isExtreme
        ? 1521 + (baseRandom % 1347)
        : 543 + (baseRandom % 629);
    } else if (type === "bad") {
      baseFakeCount = 17 + (baseRandom % 74);
    } else {
      baseFakeCount = 89 + (baseRandom % 187);
    }
  } else if (sentiment === "bad") {
    if (type === "bad") {
      baseFakeCount = isExtreme
        ? 1489 + (baseRandom % 1412)
        : 527 + (baseRandom % 648);
    } else if (type === "good") {
      baseFakeCount = 14 + (baseRandom % 83);
    } else {
      baseFakeCount = 92 + (baseRandom % 194);
    }
  } else {
    baseFakeCount = 143 + (baseRandom % 378);
  }

  // 4. 시간에 따른 선형 증가 적용
  const weight = getTimeWeight(createdAt, now);
  const weightedCount = baseFakeCount * weight;

  // 5. 최종 보정: 일의 자리가 0이 되는 것을 원천 차단
  let result = Math.floor(weightedCount);

  if (result > 0 && weight > 0.1) {
    // 해시 기반으로 1~9 사이의 결정론적 값을 생성
    const noise = (baseRandom % 9) + 1;

    // 10의 배수라면 무조건 noise를 더해 0을 회피
    if (result % 10 === 0) {
      result += noise;
    } else if (baseRandom % 3 === 0) {
      // 33% 확률로 1~2 정도를 더해 일의 자리 숫자를 더 다양화
      result += (baseRandom % 2) + 1;
    }
  }

  return result;
};

export const getTotalFakeCount = (
  id: string,
  keyword?: string,
  summary?: string,
  createdAt?: string,
  realGood: number = 0,
  realBad: number = 0,
  realNeutral: number = 0,
  now?: number,
): number => {
  const sentiment = detectSentiment(keyword || "", summary || "");
  const g = getFakeCount(id, "good", sentiment, createdAt, now) + realGood;
  const b = getFakeCount(id, "bad", sentiment, createdAt, now) + realBad;
  const n =
    getFakeCount(id, "neutral", sentiment, createdAt, now) + realNeutral;

  let total = g + b + n;

  // 합계 수치도 10단위일 경우 강제로 보정 (UI 자연스러움)
  if (total > 0 && total % 10 === 0) {
    const salt = id.length > 0 ? id.charCodeAt(id.length - 1) : 7;
    total += (salt % 9) + 1;
  }

  return total;
};

interface ReactionData {
  good: number;
  bad: number;
  neutral: number;
}

interface NewsReactionsInnerProps {
  newsId: string;
  keyword?: string;
  summary?: string;
  createdAt?: string;
  serverTime: number;
  onReactionChange?: (counts: {
    good: number;
    bad: number;
    neutral: number;
  }) => void;
}

export function NewsReactions({
  newsId,
  keyword,
  summary,
  createdAt,
  serverTime: now,
  onReactionChange,
}: NewsReactionsProps) {
  const [counts, setCounts] = useState<ReactionData>({
    good: 0,
    bad: 0,
    neutral: 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clickEffect, setClickEffect] = useState<ReactionType | null>(null);
  const [lastTick, setLastTick] = useState(now);

  // 1분마다 강제 리렌더링을 위한 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setLastTick(Date.now());
    }, 60000); // 60초마다 업데이트
    return () => clearInterval(timer);
  }, []);

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
      const finalCounts = {
        good:
          getFakeCount(newsId, "good", sentiment, createdAt, lastTick) +
          realCounts.good,
        bad:
          getFakeCount(newsId, "bad", sentiment, createdAt, lastTick) +
          realCounts.bad,
        neutral:
          getFakeCount(newsId, "neutral", sentiment, createdAt, lastTick) +
          realCounts.neutral,
      };

      setCounts(finalCounts);
      setIsLoaded(true);

      // 상위 컴포넌트에 실제 DB 카운트 전달 (가짜 제외한 순수 DB 값)
      if (onReactionChange) {
        onReactionChange(realCounts);
      }
    }

    fetchReactions();
  }, [newsId, keyword, summary, createdAt, lastTick]); // lastTick 추가로 자동 갱신 트리거

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

      const realCounts = {
        good: currentData?.good_count || 0,
        bad: currentData?.bad_count || 0,
        neutral: currentData?.neutral_count || 0,
      };

      const updates: any = {
        news_id: newsId,
        updated_at: new Date().toISOString(),
      };

      // 2. 기존 반응이 있었다면 해당 컬럼 -1
      if (oldReaction) {
        const oldCol = `${oldReaction}_count`;
        updates[oldCol] = Math.max(
          0,
          (realCounts[oldReaction as keyof typeof realCounts] || 1) - 1,
        );
        realCounts[oldReaction as keyof typeof realCounts] = updates[oldCol];
      }

      // 3. 새로운 반응 컬럼 +1
      const newCol = `${type}_count`;
      updates[newCol] = (realCounts[type as keyof typeof realCounts] || 0) + 1;
      realCounts[type as keyof typeof realCounts] = updates[newCol];

      // 4. 다른 컬럼들도 초기값 유지 (insert 대비)
      if (!currentData) {
        if (!updates.good_count) updates.good_count = 0;
        if (!updates.bad_count) updates.bad_count = 0;
        if (!updates.neutral_count) updates.neutral_count = 0;
      }

      const { error: upsertError } = await supabase
        .from("news_reactions")
        .upsert(updates);

      if (upsertError) throw upsertError;

      // 상위 컴포넌트에 업데이트된 실제 카운트 전달
      if (onReactionChange) {
        onReactionChange(realCounts);
      }
    } catch (err) {
      console.error("Failed to update reaction:", err);
      // 에러 발생 시 상태 롤백 로직 (생략하거나 간단히 구현 가능)
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
                  {isLoaded ? <RollingNumber value={counts[r.type]} /> : ".."}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
