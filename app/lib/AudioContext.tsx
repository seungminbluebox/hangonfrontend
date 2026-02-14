"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

interface AudioContextType {
  isPlaying: boolean;
  currentReport: {
    date: string;
    title: string;
  } | null;
  play: (report: { date: string; title: string }, audioContent: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentReport, setCurrentReport] = useState<{
    date: string;
    title: string;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = (
    report: { date: string; title: string },
    audioContent: string,
  ) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audioUrl = `data:audio/mp3;base64,${audioContent}`;
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentReport(null);
    };

    audioRef.current = audio;
    setCurrentReport(report);
    audio.play();
    setIsPlaying(true);
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setCurrentReport(null);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{ isPlaying, currentReport, play, pause, resume, stop }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
