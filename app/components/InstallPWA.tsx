"use client";

import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 0. 서비스 워커 등록 (PWA 설치 가능 조건)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {});
    }

    // 1. iOS 감지
    const isApple =
      /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isApple);

    // 2. 이미 앱으로 접속 중인지 확인
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone ||
      document.referrer.includes("android-app://");

    // 3. 브라우저가 설치를 준비하면 버튼 활성화를 위해 이벤트 저장만 수행
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setIsVisible(true);
      }
    };

    const readyHandler = () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
        if (!isStandalone) {
          setIsVisible(true);
        }
      }
    };

    // 이미 layout.tsx 스크립트에서 잡았는지 확인
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      if (!isStandalone) {
        setIsVisible(true);
      }
    }

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("pwa-prompt-ready", readyHandler);

    const timer = setTimeout(() => {
      if (!isStandalone) {
        setIsVisible(true);
      }
    }, 2000);

    // 폴링 추가
    const checkInterval = setInterval(() => {
      if ((window as any).deferredPrompt && !deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
      }
    }, 500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("pwa-prompt-ready", readyHandler);
      clearInterval(checkInterval);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        "브라우저의 '점 세 개' 메뉴에서 '앱 설치' 또는 '홈 화면에 추가'를 선택해 주세요!"
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-card/95 backdrop-blur-xl border border-border-subtle p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between gap-4 relative">
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-card border border-border-subtle rounded-full p-1 shadow-md hover:bg-background transition-colors"
        >
          <X className="w-3 h-3 text-text-muted" />
        </button>

        <div className="flex-1 pl-1">
          <p className="text-[13px] font-bold text-foreground tracking-tight">
            매일 뉴스받기 편리해집니다!
          </p>
          <p className="text-[11px] text-text-muted mt-0.5 leading-tight">
            {isIOS
              ? "공유 메뉴에서 '홈 화면에 추가' 클릭"
              : "홈 화면에 앱으로 설치하고 바로 사용하세요"}
          </p>
        </div>

        {isIOS ? (
          <div className="bg-accent/10 p-2.5 rounded-2xl shrink-0">
            <Share2 className="w-5 h-5 text-accent animate-bounce" />
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="bg-accent text-white px-5 py-2.5 rounded-2xl text-[12px] font-black flex items-center gap-2 active:scale-95 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] shrink-0"
          >
            <Download className="w-4 h-4 outline-3" />
            설치
          </button>
        )}
      </div>
    </div>
  );
}
