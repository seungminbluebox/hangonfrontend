"use client";

import React from "react";
import { useAudio } from "../../lib/AudioContext";
import { Play, Pause, X, Volume2, Activity } from "lucide-react";

export function AudioControlBar() {
  const { isPlaying, currentReport, pause, resume, stop } = useAudio();

  if (!currentReport) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96 z-[70] animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-card/90 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-2xl p-4 flex items-center gap-4">
        {/* Progress Visualizer */}
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          {isPlaying ? (
            <Activity className="w-5 h-5 text-accent animate-pulse" />
          ) : (
            <Volume2 className="w-5 h-5 text-accent opacity-50" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-0.5">
            지금 재생 중
          </p>
          <h4 className="text-[13px] font-black text-foreground truncate leading-tight">
            {currentReport.date} 리포트
          </h4>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={pause}
              className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors"
            >
              <Pause className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={resume}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent-dark transition-colors"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          )}

          <button
            onClick={stop}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center text-text-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
