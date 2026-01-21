"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  href = "/",
  label = "Back to Dashboard",
  className = "",
}: BackButtonProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <Link
        href={href}
        className="group inline-flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-full border border-border-subtle hover:bg-secondary/50 hover:border-border transition-all duration-300"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 group-hover:text-foreground transition-colors">
          {label}
        </span>
      </Link>
    </div>
  );
}
