"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Coffee,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Globe,
} from "lucide-react";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  isSaturday,
  isSunday,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { clsx } from "clsx";

interface MarketHoliday {
  id: number;
  date: string;
  country: "KR" | "US";
  name: string;
  name_ko: string;
  type: "holiday" | "half_day";
  is_dst: boolean;
  close_time?: string;
}

export function MarketHolidays() {
  const [holidays, setHolidays] = useState<MarketHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const year = currentMonth.getFullYear();
        const start = `${year}-01-01`;
        const end = `${year}-12-31`;
        const res = await fetch(
          `/api/market/holidays?start=${start}&end=${end}`,
        );
        const data = await res.json();
        setHolidays(data);
      } catch (error) {
        console.error("Failed to fetch holidays:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHolidays();
  }, [currentMonth.getFullYear()]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  // Using Sunday start (weekStartsOn: 0) as standard for KR calendars
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
  });

  const selectedHolidays = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return holidays.filter((h) => h.date === dateStr);
  }, [selectedDate, holidays]);

  const getHolidaysForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return holidays.filter((h) => h.date === dateStr);
  };

  const isUSDSTCurrently = useMemo(() => {
    const nyTimeStr = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const nyDate = new Date(nyTimeStr);
    const year = nyDate.getFullYear();

    const march1st = new Date(year, 2, 1);
    const dstStart = new Date(year, 2, 8 + ((7 - march1st.getDay()) % 7) + 7);
    dstStart.setHours(2, 0, 0, 0);

    const nov1st = new Date(year, 10, 1);
    const dstEnd = new Date(year, 10, 1 + ((7 - nov1st.getDay()) % 7));
    dstEnd.setHours(2, 0, 0, 0);

    return nyDate >= dstStart && nyDate < dstEnd;
  }, []);

  const getKstHours = (
    country: "KR" | "US",
    type: "holiday" | "half_day" | "normal",
    is_dst: boolean,
  ) => {
    if (country === "KR") {
      if (type === "holiday") return "휴장";
      if (type === "half_day") return "09:00 ~ 13:30";
      return "09:00 ~ 15:30";
    } else {
      if (type === "holiday") return "휴장";
      if (is_dst) {
        if (type === "half_day") return "22:30 ~ 02:00";
        return "22:30 ~ 05:00";
      } else {
        if (type === "half_day") return "23:30 ~ 03:00";
        return "23:30 ~ 06:00";
      }
    }
  };

  const getLocalHours = (
    country: "KR" | "US",
    type: "holiday" | "half_day",
  ) => {
    if (type === "holiday") return "-";
    return country === "KR" ? "09:00 ~ 13:30" : "09:30 ~ 13:00";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Coffee className="w-12 h-12 text-text-muted/20 mb-4" />
        <p className="text-text-muted font-bold text-xs uppercase tracking-widest">
          Syncing Calendar...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Market Status (심플 대시보드 디자인) */}
      <section className="bg-secondary/30 p-3 px-5 rounded-[32px] border border-border-subtle backdrop-blur-md">
        <div className="flex items-center justify-between gap-6 relative">
          {/* KRX */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px]">🇰🇷</span>
              <span className="text-[11px] font-bold opacity-80">한국</span>
            </div>
            <div className="flex items-baseline gap-1">
              <div className="flex flex-col leading-[0.9]">
                <span className="text-[24px] font-black italic tracking-tighter">
                  09:00
                </span>
                <span className="text-[20px] font-black italic tracking-tighter opacity-40">
                  ~15:30
                </span>
              </div>
              <span className="text-[9px] font-black text-accent uppercase">
                KST
              </span>
            </div>
          </div>

          {/* Center Divider */}
          <div className="w-px h-10 bg-border-subtle/50" />

          {/* NYSE */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px]">🇺🇸</span>
                <span className="text-[11px] font-bold opacity-80">미국</span>
              </div>
              {isUSDSTCurrently && (
                <span className="text-[7px] font-black text-orange-500 italic uppercase bg-orange-500/10 px-1 rounded-sm">
                  Summer
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <div className="flex flex-col leading-[0.9]">
                  <span className="text-[22px] font-black italic tracking-tighter">
                    {isUSDSTCurrently ? "22:30" : "23:30"}
                  </span>
                  <span className="text-[19px] font-black italic tracking-tighter opacity-40">
                    ~{isUSDSTCurrently ? "05:00" : "06:00"}
                  </span>
                </div>
                <span className="text-[9px] font-black text-accent uppercase">
                  KST
                </span>
              </div>
              <div className="flex items-baseline gap-1 opacity-30 text-[11px] font-bold italic leading-none">
                <span>09:30-16:00</span>
                <span className="text-[9px] uppercase tracking-tighter whitespace-nowrap">
                  현지시각
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Calendar Grid (Match Earnings 스타일) */}
      <section className="bg-secondary/30 p-3 rounded-[28px] border border-border-subtle backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-accent" />
            <h2 className="font-bold text-[13px] tracking-tight">휴장 달력</h2>
          </div>
          <div className="flex items-center bg-background/50 p-0.5 rounded-xl border border-border-subtle/30 shadow-sm">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:bg-background active:scale-95 rounded-lg transition-all text-text-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-1.5 text-[10px] font-black text-accent min-w-[65px] text-center">
              {format(currentMonth, "yyyy.MM")}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:bg-background active:scale-95 rounded-lg transition-all text-text-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 px-0.5">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div
              key={day}
              className={clsx(
                "text-center py-1 text-[9px] font-bold uppercase",
                day === "일"
                  ? "text-red-500/40"
                  : day === "토"
                    ? "text-blue-500/40"
                    : "text-text-muted/40",
              )}
            >
              {day}
            </div>
          ))}
          {calendarDays.map((day) => {
            const dateHolidays = getHolidaysForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={clsx(
                  "flex flex-col items-center py-2 rounded-xl transition-all active:scale-95 relative min-h-[42px]",
                  isSelected
                    ? "bg-accent text-white shadow-md z-10"
                    : isCurrentMonth
                      ? "hover:bg-secondary/50 text-foreground"
                      : "text-text-muted/10 opacity-20 pointer-events-none",
                )}
              >
                <span className="text-[15px] font-black">
                  {format(day, "d")}
                </span>
                <div className="flex gap-0.5 mt-0.5">
                  {dateHolidays.map((h, i) => (
                    <div
                      key={i}
                      className={clsx(
                        "w-1 h-1 rounded-full",
                        isSelected
                          ? "bg-white"
                          : h.country === "KR"
                            ? "bg-red-500"
                            : "bg-blue-500",
                      )}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Details (Match Earnings 스타일) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-xs uppercase tracking-widest text-text-muted opacity-50">
            Details:{" "}
            {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Date"}
          </h3>
        </div>

        <div className="grid gap-3">
          {selectedHolidays.length > 0 ? (
            selectedHolidays.map((holiday) => (
              <div
                key={`${holiday.country}-${holiday.date}`}
                className={clsx(
                  "group bg-card p-4 rounded-[24px] border border-border-subtle transition-all flex items-center gap-4",
                  holiday.country === "KR"
                    ? "hover:border-blue-500/30"
                    : "hover:border-red-500/30",
                )}
              >
                <div
                  className={clsx(
                    "w-12 h-12 rounded-[15px] flex items-center justify-center text-xl shadow-inner border border-border-subtle/50 shrink-0",
                    holiday.country === "KR" ? "bg-blue-500/5" : "bg-red-500/5",
                  )}
                >
                  {holiday.country === "KR" ? "🇰🇷" : "🇺🇸"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={clsx(
                        "text-[13px] font-black",
                        holiday.country === "KR"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {holiday.country === "KR" ? "대한민국" : "미국"}
                    </span>
                    <span className="text-[10px] font-bold py-0.5 px-1.5 bg-secondary rounded-md text-text-muted/80">
                      {holiday.name_ko}
                    </span>
                  </div>

                  {holiday.type === "half_day" ? (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="bg-secondary/40 p-2 rounded-xl border border-border-subtle/50">
                        <p className="text-[8px] font-bold text-text-muted mb-0.5">
                          LOCAL
                        </p>
                        <p
                          className={clsx(
                            "text-[11px] font-black",
                            holiday.country === "KR"
                              ? "text-blue-500"
                              : "text-red-500",
                          )}
                        >
                          {getLocalHours(holiday.country, holiday.type)}
                        </p>
                      </div>
                      <div className="bg-secondary/40 p-2 rounded-xl border border-border-subtle/50">
                        <p className="text-[8px] font-bold text-text-muted mb-0.5">
                          KST
                        </p>
                        <p
                          className={clsx(
                            "text-[11px] font-black",
                            holiday.country === "KR"
                              ? "text-blue-500"
                              : "text-red-500",
                          )}
                        >
                          {getKstHours(
                            holiday.country,
                            holiday.type,
                            holiday.is_dst,
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={clsx(
                          "text-[10px] font-black uppercase italic",
                          holiday.country === "KR"
                            ? "text-blue-500"
                            : "text-red-500",
                        )}
                      >
                        휴장
                      </span>
                      <div
                        className={clsx(
                          "h-px flex-1",
                          holiday.country === "KR"
                            ? "bg-blue-500/10"
                            : "bg-red-500/10",
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-text-muted/30 border border-dashed border-border-subtle rounded-[24px]">
              <Globe className="w-10 h-10 mb-3 opacity-10" />
              <p className="text-[11px] font-black uppercase tracking-widest">
                한국, 미국 모두 정상 거래일이에요!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
