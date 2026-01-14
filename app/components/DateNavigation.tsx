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
    <div className="flex items-center gap-2">
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
            <Calendar className="w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform" />
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
