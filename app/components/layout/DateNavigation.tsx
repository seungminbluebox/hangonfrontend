"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
  Loader2,
} from "lucide-react";
import { useRef, useTransition, useState, useEffect } from "react";

export function DateNavigation({ currentDate }: { currentDate: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setDate = (newDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    startTransition(() => {
      router.push(`?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  };

  const changeDate = (days: number) => {
    const [year, month, day] = currentDate.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);

    const dateStr = [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-");
    setDate(dateStr);
  };

  const resetDate = () => {
    startTransition(() => {
      router.push("/");
      router.refresh();
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  };

  // 클라이언트에서만 오늘 날짜를 기준으로 판단하여 하이드레이션 오류 방지
  const getKSTDateString = (dateObj: Date = new Date()) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(
      dateObj,
    );

  const todayStr = isMounted ? getKSTDateString() : currentDate;
  const isToday = isMounted ? currentDate === getKSTDateString() : true;

  const displayDate = new Date(`${currentDate}T12:00:00Z`).toLocaleDateString(
    "ko-KR",
    {
      timeZone: "Asia/Seoul",
      month: "long",
      day: "numeric",
      weekday: "short",
    },
  );

  return (
    <div
      className={`flex items-center gap-2 transition-opacity duration-300 ${
        isPending ? "opacity-70 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex items-center p-1 rounded-full border border-border-subtle bg-card/30 backdrop-blur-sm shadow-sm">
        {/* Previous Day Button */}
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-full hover:bg-card hover:text-accent transition-all active:scale-95"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Date Display & Picker Trigger */}
        <div className="relative mx-1">
          <button
            onClick={() => dateInputRef.current?.showPicker()}
            className="px-4 py-1.5 rounded-full border border-transparent hover:border-border-subtle/50 hover:bg-card/50 text-[15px] font-black flex items-center gap-2 transition-all group"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
            ) : (
              <Calendar className="w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform" />
            )}
            {displayDate}
          </button>
          <input
            ref={dateInputRef}
            type="date"
            className="absolute opacity-0 pointer-events-none"
            onChange={(e) => setDate(e.target.value)}
            value={currentDate}
            max={todayStr}
          />
        </div>

        {/* Next Day Button */}
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="p-2 rounded-full hover:bg-card hover:text-accent transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Reset Button (Outside to keep the < Date > layout clean) */}
      {!isToday && (
        <button
          onClick={resetDate}
          className="p-2.5 rounded-full border border-border-subtle bg-card/30 hover:bg-card text-accent transition-all shadow-sm active:rotate-[-45deg]"
          aria-label="Reset to Today"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
