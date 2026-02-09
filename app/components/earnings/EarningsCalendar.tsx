"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  DollarSign,
  BarChart3,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { ko } from "date-fns/locale";
import { clsx } from "clsx";

interface EarningsEvent {
  symbol: string;
  company_name: string;
  logo_url?: string;
  date: string;
  country: "US" | "KR";
  eps_estimate: number;
  eps_actual?: number | null;
  revenue_estimate: number;
  revenue_estimate_formatted: string;
  revenue_actual?: number | null;
  revenue_actual_formatted: string;
  revenue_formatted?: string;
  currentPrice?: number | null;
  current_price?: number | null;
}

export function EarningsCalendar() {
  const [events, setEvents] = useState<EarningsEvent[]>([]);
  const [searchResults, setSearchResults] = useState<EarningsEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMonthView, setIsMonthView] = useState(false);

  const isFutureEarning = (earningDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 00:00:00
    const target = new Date(earningDate);
    target.setHours(0, 0, 0, 0); // 타겟 00:00:00
    return target > today;
  };

  const isValidEps = (val: any) => {
    if (val === null || val === undefined || val === "") return false;
    const num = Number(val);
    return !isNaN(num);
  };

  const isValidFormattedValue = (val: string | null | undefined) => {
    if (!val) return false;
    const lower = val.toLowerCase();
    // "nan", "null", "$nan", "$null", "n/a" 등을 걸러냄
    return (
      !lower.includes("nan") &&
      !lower.includes("null") &&
      lower.trim() !== "" &&
      lower.trim() !== "n/a"
    );
  };

  const hasPublishedResults = (event: EarningsEvent) => {
    return (
      isValidEps(event.eps_actual) ||
      isValidFormattedValue(event.revenue_actual_formatted)
    );
  };

  const getCurrencySymbol = (country: string): string => {
    return country === "KR" ? "₩" : "$";
  };

  const getEpsDisplay = (event: EarningsEvent) => {
    const isFuture = isFutureEarning(event.date);
    const isKR = event.country === "KR";

    const formatEps = (val: any) => {
      const num = Number(val);
      if (isKR) {
        return `${num.toLocaleString("ko-KR")}원`;
      }
      return `$${num.toFixed(2)}`;
    };

    const hasActual = isValidEps(event.eps_actual);
    const hasEstimate = isValidEps(event.eps_estimate);

    // 실제 발표 데이터가 있으면 날짜에 상관없이 '과거 데이터(발표됨)' 형식으로 보여줌
    if (hasActual) {
      if (hasEstimate) {
        return {
          actual: formatEps(event.eps_actual),
          estimate: formatEps(event.eps_estimate),
          label: "실제 발표 / 예상치",
          type: "comparison" as const,
        };
      }
      return {
        value: formatEps(event.eps_actual),
        label: "실제 발표 EPS",
        type: "actual" as const,
      };
    }

    // 실제 데이터가 없고 미래 또는 당일인 경우
    if (isFuture || isSameDay(new Date(event.date), new Date())) {
      if (hasEstimate) {
        return {
          value: formatEps(event.eps_estimate),
          label: "예상 EPS",
          type: "estimate" as const,
        };
      }
      return isFuture
        ? "발표 전 예상치 집계 중"
        : "오늘 발표 예정 (예측치 확인 중)";
    }

    // 날짜는 지났으나 실제 데이터가 아직 없는 경우 (대기 중)
    return hasEstimate
      ? "실적 공시를 대기 중입니다"
      : "실적 정보가 집계되지 않았습니다";
  };

  const getRevenueDisplay = (event: EarningsEvent) => {
    const isFuture = isFutureEarning(event.date);

    const hasActual = isValidFormattedValue(event.revenue_actual_formatted);
    const hasEstimate = isValidFormattedValue(event.revenue_estimate_formatted);

    // 실제 발표 데이터가 있으면 날짜에 상관없이 '과거 데이터(발표됨)' 형식으로 보여줌
    if (hasActual) {
      if (hasEstimate) {
        return {
          actual: event.revenue_actual_formatted,
          estimate: event.revenue_estimate_formatted,
          label: "실제 매출 / 예상치",
          type: "comparison" as const,
        };
      }
      return {
        value: event.revenue_actual_formatted,
        label: "실제 발표 매출",
        type: "actual" as const,
      };
    }

    // 실제 데이터가 없고 미래 또는 당일인 경우
    if (isFuture || isSameDay(new Date(event.date), new Date())) {
      if (hasEstimate) {
        return {
          value: event.revenue_estimate_formatted,
          label: "예상 매출액",
          type: "estimate" as const,
        };
      }
      return isFuture
        ? "매출 예상치 확인 중"
        : "오늘 발표 예정 (매출 예상치 확인 중)";
    }

    // 날짜는 지났으나 실제 데이터가 아직 없는 경우
    return hasEstimate
      ? "매출 결과 업데이트 중"
      : "공시된 매출 정보가 없습니다";
  };

  const renderEventCard = (event: EarningsEvent) => (
    <div
      key={`${event.symbol}-${event.date}`}
      className="group bg-background p-4 rounded-[24px] border border-border-subtle hover:border-accent/30 transition-all"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-12 h-12 bg-secondary rounded-[15px] overflow-hidden flex items-center justify-center font-bold text-[11px] transition-all border border-border-subtle/50 shadow-sm shrink-0 group-hover:border-accent/50">
            {event.logo_url ? (
              <img
                src={event.logo_url}
                alt={event.symbol}
                className="w-full h-full object-cover bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  const fallback = (e.target as HTMLImageElement)
                    .nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <span
              className={`text-xs font-black text-accent ${event.logo_url ? "hidden" : "flex"} items-center justify-center`}
              style={{ display: event.logo_url ? "none" : "flex" }}
            >
              {event.symbol.slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm leading-tight line-clamp-1">
              {event.company_name}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={clsx(
                  "text-[9px] px-1.5 py-0.5 rounded-sm font-bold",
                  event.country === "KR"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-blue-500/10 text-blue-500",
                )}
              >
                {event.country}
              </span>
              <span className="text-[10px] text-text-muted font-medium">
                {event.symbol}
              </span>
            </div>
            <div className="text-[9px] text-text-muted/70 mt-1.5 font-medium">
              {format(new Date(event.date), "M월 d일", { locale: ko })}
              {hasPublishedResults(event)
                ? "에 발표됨"
                : isFutureEarning(event.date)
                  ? " 발표 예정"
                  : "에 발표됨"}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[16px] font-black text-accent">
            {(() => {
              const price = event.currentPrice || event.current_price;
              const numPrice = Number(price);
              if (
                price !== null &&
                price !== undefined &&
                !isNaN(numPrice) &&
                numPrice !== 0
              ) {
                return `${getCurrencySymbol(event.country)}${numPrice.toLocaleString("en-US")}`;
              }
              return (
                <span className="text-text-muted/60 text-[9px]">조회중...</span>
              );
            })()}
          </div>
          <div className="text-[8px] text-text-muted/70 mt-1">
            정기 업데이트된 주가
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary/40 p-3 rounded-2xl border border-border-subtle/50">
          <div className="flex items-center gap-1.5 text-text-muted mb-1">
            <BarChart3 className="w-3 h-3" />
            <span className="text-[10px] font-bold">주당순이익(EPS)</span>
          </div>
          <div className="text-sm font-black flex flex-col gap-0.5">
            {(() => {
              const epsDisplay = getEpsDisplay(event);
              if (typeof epsDisplay === "string") {
                return (
                  <div className="text-text-muted/60 text-[11px]">
                    {epsDisplay}
                  </div>
                );
              } else if ("type" in epsDisplay) {
                if (epsDisplay.type === "comparison") {
                  return (
                    <div className="flex flex-col">
                      <div className="flex flex-col leading-tight">
                        <span className="text-accent font-bold">
                          {epsDisplay.actual}
                        </span>
                        <span className="text-[10px] text-text-muted/60 font-normal">
                          {epsDisplay.estimate}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-text-muted/50 mt-1">
                        <span className="text-accent/80 font-bold">발표치</span>
                        <span>/</span>
                        <span>예상치</span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <div className="text-accent">{epsDisplay.value}</div>
                      <span className="text-[9px] text-text-muted/60">
                        {epsDisplay.label}
                      </span>
                    </div>
                  );
                }
              }
            })()}
          </div>
        </div>

        <div className="bg-secondary/40 p-3 rounded-2xl border border-border-subtle/50">
          <div className="flex items-center gap-1.5 text-text-muted mb-1">
            <DollarSign className="w-3 h-3" />
            <span className="text-[10px] font-bold">매출액</span>
          </div>
          <div className="text-sm font-black flex flex-col gap-0.5">
            {(() => {
              const revDisplay = getRevenueDisplay(event);
              if (typeof revDisplay === "string") {
                return (
                  <div className="text-text-muted/60 text-[11px]">
                    {revDisplay}
                  </div>
                );
              } else if ("type" in revDisplay) {
                if (revDisplay.type === "comparison") {
                  return (
                    <div className="flex flex-col">
                      <div className="flex flex-col leading-tight">
                        <span className="text-accent font-bold">
                          {revDisplay.actual}
                        </span>
                        <span className="text-[10px] text-text-muted/60 font-normal">
                          {revDisplay.estimate}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-text-muted/50 mt-1">
                        <span className="text-accent/80 font-bold">발표치</span>
                        <span>/</span>
                        <span>예상치</span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <div className="text-accent">{revDisplay.value}</div>
                      <span className="text-[9px] text-text-muted/60">
                        {revDisplay.label}
                      </span>
                    </div>
                  );
                }
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const previousWeekStart = startOfWeek(addDays(selectedDate, -7), {
    weekStartsOn: 1,
  });
  const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });

  const nextWeekStart = startOfWeek(addDays(selectedDate, 7), {
    weekStartsOn: 1,
  });
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
  });

  const startStr = isMonthView
    ? format(startOfWeek(monthStart, { weekStartsOn: 1 }), "yyyy-MM-dd")
    : format(weekStart, "yyyy-MM-dd");
  const endStr = isMonthView
    ? format(endOfWeek(monthEnd, { weekStartsOn: 1 }), "yyyy-MM-dd")
    : format(weekEnd, "yyyy-MM-dd");

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/market/earnings?start=${startStr}&end=${endStr}`,
        );
        const data = await response.json();
        if (data && !data.error) {
          setEvents(data);
        }
      } catch (error) {
        console.error("Error fetching earnings events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [startStr, endStr]);

  useEffect(() => {
    const searchTerm = searchQuery.trim();

    if (!searchTerm) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    async function searchEarnings() {
      try {
        const response = await fetch(
          `/api/market/earnings/search?query=${encodeURIComponent(searchTerm)}`,
        );
        const data = await response.json();
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching earnings events:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    searchEarnings();
  }, [searchQuery]);

  const selectedDateEvents = searchQuery.trim()
    ? searchResults
    : events.filter((event) => isSameDay(new Date(event.date), selectedDate));

  return (
    <div>
      <div className="flex flex-col gap-6">
        {/* Date Picker Section */}
        <div className="bg-secondary/30 p-3 rounded-[28px] border border-border-subtle backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-accent" />
              <h2 className="font-bold text-[13px] tracking-tight">
                실적 일정
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-background/50 p-0.5 rounded-xl border border-border-subtle/30 shadow-sm">
                <button
                  onClick={() =>
                    setSelectedDate((prev) =>
                      isMonthView ? addMonths(prev, -1) : addDays(prev, -7),
                    )
                  }
                  className="p-1 hover:bg-background active:scale-95 rounded-lg transition-all text-text-muted"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-1.5 text-[10px] font-black text-accent min-w-[65px] text-center">
                  {isMonthView
                    ? format(selectedDate, "yyyy.M")
                    : `${format(weekStart, "M.d")} - ${format(weekEnd, "M.d")}`}
                </span>
                <button
                  onClick={() =>
                    setSelectedDate((prev) =>
                      isMonthView ? addMonths(prev, 1) : addDays(prev, 7),
                    )
                  }
                  className="p-1 hover:bg-background active:scale-95 rounded-lg transition-all text-text-muted"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div
                className="flex items-center bg-background/50 p-0.5 rounded-xl border border-border-subtle/30 shadow-sm cursor-pointer"
                onClick={() => setIsMonthView(!isMonthView)}
              >
                <div
                  className={clsx(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95",
                    !isMonthView
                      ? "bg-accent text-white shadow-sm"
                      : "text-text-muted",
                  )}
                >
                  주
                </div>
                <div
                  className={clsx(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95",
                    isMonthView
                      ? "bg-accent text-white shadow-sm"
                      : "text-text-muted",
                  )}
                >
                  월
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl">
            {isMonthView ? (
              <div className="grid grid-cols-7 gap-1 px-0.5">
                {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                  <div
                    key={day}
                    className="text-center py-1 text-[9px] font-bold text-text-muted/40"
                  >
                    {day}
                  </div>
                ))}
                {monthDays.map((day) => {
                  const hasEvents = events.some((event) =>
                    isSameDay(new Date(event.date), day),
                  );
                  const isCurrentMonth = isSameMonth(day, selectedDate);
                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={clsx(
                        "flex flex-col items-center py-2 rounded-lg transition-all active:scale-95 relative min-h-[42px]",
                        isSameDay(day, selectedDate)
                          ? "bg-accent text-white shadow-md z-10"
                          : isCurrentMonth
                            ? "hover:bg-secondary/50 text-text-main"
                            : "text-text-muted/20 opacity-30",
                      )}
                    >
                      <span className="text-[15px] font-bold">
                        {format(day, "d")}
                      </span>
                      {hasEvents && (
                        <div
                          className={clsx(
                            "absolute bottom-1 w-1 h-1 rounded-full",
                            isSameDay(day, selectedDate)
                              ? "bg-white"
                              : "bg-accent",
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const hasEvents = events.some((event) =>
                    isSameDay(new Date(event.date), day),
                  );
                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={clsx(
                        "flex flex-col items-center py-2.5 rounded-2xl transition-all active:scale-95 relative",
                        isSameDay(day, selectedDate)
                          ? "bg-accent text-white shadow-sm"
                          : "hover:bg-secondary/50",
                      )}
                    >
                      <span className="text-[9px] font-bold opacity-60">
                        {format(day, "EEE", { locale: ko })}
                      </span>
                      <span className="text-[13px] font-black leading-none mt-1">
                        {format(day, "d")}
                      </span>
                      {hasEvents && (
                        <div
                          className={clsx(
                            "absolute bottom-1 w-1 h-1 rounded-full",
                            isSameDay(day, selectedDate)
                              ? "bg-white"
                              : "bg-accent",
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="px-1">
          <input
            type="text"
            placeholder="회사명 또는 티커로 검색...(예: 알파벳,googl)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-secondary/40 border border-border-subtle/50"
          />
        </div>

        {/* Events List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-sm">
              {searchQuery.trim()
                ? "검색 결과"
                : format(selectedDate, "M월 d일", { locale: ko })}
            </h3>
          </div>

          {loading || isSearching ? (
            <div className="py-10 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searchQuery.trim() ? (
            // Search mode: regular list
            <div className="grid gap-3">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => renderEventCard(event))
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-text-muted">
                  <Globe className="w-10 h-10 mb-3 opacity-10" />
                  <p className="text-xs font-bold">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            // Static list mode
            <div className="grid gap-3">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => renderEventCard(event))
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-text-muted">
                  <Globe className="w-10 h-10 mb-3 opacity-10" />
                  <p className="text-xs font-bold">
                    이 날은 데이터가 없습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
