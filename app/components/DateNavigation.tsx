"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, RotateCcw, Calendar } from "lucide-react";
import { useRef } from "react";

export function DateNavigation({ currentDate }: { currentDate: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const setDate = (newDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    router.push(`?${params.toString()}`);
  };

  const changeDate = (days: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    const dateStr = date.toISOString().split("T")[0];
    setDate(dateStr);
  };

  const resetDate = () => {
    router.push("/");
  };

  const isToday =
    new Date(currentDate).toDateString() === new Date().toDateString();

  const displayDate = new Date(currentDate).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="flex items-center gap-3">
      {/* Date Display & Picker Trigger */}
      <div className="relative">
        <button
          onClick={() => dateInputRef.current?.showPicker()}
          className="px-4 py-2 rounded-full border border-border-subtle bg-card/50 backdrop-blur-sm text-[10px] font-bold flex items-center gap-2 shadow-sm hover:border-accent/40 hover:bg-card transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-accent" />
          {displayDate}
        </button>
        <input
          ref={dateInputRef}
          type="date"
          className="absolute opacity-0 pointer-events-none"
          onChange={(e) => setDate(e.target.value)}
          value={currentDate}
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="flex items-center gap-1.5 p-1 rounded-full border border-border-subtle bg-card/30">
        <button
          onClick={() => changeDate(-1)}
          className="p-1.5 rounded-full hover:bg-card hover:text-accent transition-colors"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {!isToday && (
          <button
            onClick={resetDate}
            className="p-1.5 rounded-full hover:bg-card text-accent transition-colors"
            aria-label="Reset to Today"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="p-1.5 rounded-full hover:bg-card hover:text-accent transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
