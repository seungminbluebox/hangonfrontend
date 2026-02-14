"use client";

import { ThemeProvider } from "next-themes";
import { AudioProvider } from "./lib/AudioContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AudioProvider>{children}</AudioProvider>
    </ThemeProvider>
  );
}
