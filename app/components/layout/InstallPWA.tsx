"use client";

import { useEffect, useState } from "react";
import { X, Smartphone, Download } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. 이미 설치되었는지 확인
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) return;

    // 2. 닫은 기록 확인 (7일 동안 묻지 않음)
    const lastDismissed = localStorage.getItem("hangon-pwa-last-dismissed");
    const now = Date.now();
    if (lastDismissed && now - parseInt(lastDismissed) < 604800000) {
      return;
    }

    // iOS 감지
    const checkIOS =
      /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(checkIOS);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // 페이지 로드 3초 후 슬그머니 보여줌
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS는 이벤트가 없으므로 별도 트리거
    if (checkIOS) {
      setTimeout(() => setIsVisible(true), 4000);
    }

    // 초기값 확인 (layout.tsx에서 캡처한 경우)
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      setTimeout(() => setIsVisible(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert(
        "아이폰은 하단 '공유' 버튼 클릭 후 '홈 화면에 추가'를 선택해 주세요! 📱",
      );
      setIsVisible(false);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hangon-pwa-last-dismissed", Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[150] md:left-auto md:right-8 md:bottom-8 md:w-[320px] animate-in slide-in-from-bottom-5 duration-500 pointer-events-none">
      <div className="bg-card/95 backdrop-blur-2xl border border-border-subtle p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 pointer-events-auto">
        {/* 앱 아이콘 느낌의 영역 */}
        <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
          <Smartphone className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-black text-foreground leading-tight">
            Hang on! 앱 설치
          </h4>
          <p className="text-[11px] text-text-muted mt-0.5 leading-tight truncate">
            {isIOS
              ? "홈 화면에 추가하고 편하게 보세요"
              : "홈 화면에 추가하여 바로 확인"}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-accent text-white px-4 py-2 rounded-xl text-[12px] font-black active:scale-95 transition-all"
          >
            설치
          </button>
          <button
            onClick={handleClose}
            className="text-text-muted text-[11px] font-bold py-1 hover:text-foreground transition-colors text-center"
          >
            나중에
          </button>
        </div>
      </div>
    </div>
  );
}
