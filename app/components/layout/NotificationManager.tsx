"use client";

import React from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationManager({
  showText = false,
  compact = false,
}: {
  showText?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href="/notifications"
      className={`flex items-center justify-center gap-2 rounded-xl bg-secondary/50 text-text-muted border border-border-subtle hover:bg-secondary/80 transition-all duration-300 group active:scale-95 ${
        showText
          ? compact
            ? "px-3 py-1.5 text-[11px] font-bold"
            : "px-4 py-2.5 text-sm font-bold"
          : "p-2"
      }`}
      title="알림 설정"
    >
      <Bell
        className={showText ? (compact ? "w-3 h-3" : "w-4 h-4") : "w-5 h-5"}
      />
      {showText && <span>알림 설정</span>}
    </Link>
  );
}
