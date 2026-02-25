"use client";

import { useEffect, useState } from "react";
import { X, Smartphone, Download } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 0. 서비스 워커 등록 (PWA 필수 조건)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // 1. 이미 설치되었는지 확인
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) return;

    // 2. 닫은 기록 확인 (24시간 동안 절대 묻지 않음)
    const lastDismissed = localStorage.getItem("hangon-pwa-last-dismissed");
    const now = Date.now();

    // 만약 기록이 있고, 현재 시간이 기록된 시간 + 24시간보다 작으면 노출 안함
    if (lastDismissed && now < parseInt(lastDismissed) + 86400000) {
      setIsVisible(false);
      return;
    }

    // iOS 감지
    const checkIOS =
      /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(checkIOS);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;

      // handler 내에서도 다시 한번 체크 (더 확실하게)
      const dismissed = localStorage.getItem("hangon-pwa-last-dismissed");
      const currentTime = Date.now();
      if (dismissed && currentTime < parseInt(dismissed) + 86400000) {
        return;
      }

      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("pwa-prompt-ready", () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);

        const dismissed = localStorage.getItem("hangon-pwa-last-dismissed");
        const currentTime = Date.now();
        if (dismissed && currentTime < parseInt(dismissed) + 86400000) {
          return;
        }

        setTimeout(() => setIsVisible(true), 3000);
      }
    });

    // iOS는 이벤트가 없으므로 별도 트리거
    if (checkIOS) {
      setTimeout(() => {
        const dismissed = localStorage.getItem("hangon-pwa-last-dismissed");
        const currentTime = Date.now();
        if (dismissed && currentTime < parseInt(dismissed) + 86400000) {
          return;
        }
        setIsVisible(true);
      }, 4000);
    }

    // 초기값 확인 (layout.tsx에서 캡처한 경우)
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      setTimeout(() => setIsVisible(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    // InstallButton.tsx와 동일한 로직 구현
    const checkIOS =
      /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (checkIOS) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Hang on! | 글로벌 경제 1분 요약",
            url: window.location.href,
          });
          setIsVisible(false);
          return;
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            console.error(err);
          } else {
            return;
          }
        }
      }

      alert(
        "아이폰(iOS)에서 앱으로 설치하려면:\n\n1. Safari 하단 바 가운데의 '공유' 버튼을 누르세요.\n2. 메뉴를 아래로 내려 '홈 화면에 추가'를 선택해 주세요! 📱",
      );
      setIsVisible(false);
      return;
    }

    const prompt = deferredPrompt || (window as any).deferredPrompt;

    if (!prompt) {
      alert("브라우저 메뉴에서 '앱 설치'를 선택해 주세요!");
      setIsVisible(false);
      return;
    }

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    }
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hangon-pwa-last-dismissed", Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[150] md:left-auto md:right-8 md:bottom-8 md:w-[280px] animate-in slide-in-from-bottom-8 duration-700 pointer-events-none">
      <div className="bg-[#1a1c1e] dark:bg-white p-2.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-3 pointer-events-auto relative border border-white/5 dark:border-gray-100 group">
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-[#1a1c1e] dark:bg-white border border-white/10 dark:border-gray-100 rounded-full p-1 text-white/50 dark:text-gray-400 hover:text-white dark:hover:text-gray-900 transition-colors shadow-md"
        >
          <X className="w-3 h-3" />
        </button>

        {/* 앱 아이콘 - 더 작고 심플하게 */}
        <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <Smartphone className="w-5 h-5 text-white stroke-[2.5px]" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-black tracking-tight leading-none text-white dark:text-gray-900">
            {isIOS ? "앱으로 보기" : "hang on! 앱 설치"}
          </h4>
        </div>

        <button
          onClick={handleInstallClick}
          className="bg-accent text-white px-3.5 py-1.5 rounded-lg text-[12px] font-black hover:bg-blue-600 active:scale-95 transition-all shrink-0"
        >
          {isIOS ? "열기" : "설치"}
        </button>
      </div>
    </div>
  );
}
