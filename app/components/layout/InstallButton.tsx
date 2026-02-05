"use client";

import { useEffect, useState } from "react";
import { Download, Share2 } from "lucide-react";

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 이미 설치되었는지 확인
    const checkStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone ||
      document.referrer.includes("android-app://");

    setIsStandalone(checkStandalone);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const readyHandler = () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
      }
    };

    // 초기값 확인
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("pwa-prompt-ready", readyHandler);

    // 이미 설치 이벤트가 발생했을지 모르니 주기적으로 체크 (폴링)
    const interval = setInterval(() => {
      if ((window as any).deferredPrompt && !deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
      }
    }, 1000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("pwa-prompt-ready", readyHandler);
      clearInterval(interval);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    const isIOS =
      /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIOS) {
      // 1. 실제로 공유 시트를 열어서 설치 메뉴(홈 화면에 추가) 접근을 돕습니다.
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Hang on! | 글로벌 경제 1분 요약",
            url: window.location.href,
          });
          return;
        } catch (err) {
          // 사용자가 취소한 경우는 제외하고 에러 시에만 가이드 알림 표시
          if ((err as Error).name !== "AbortError") {
            console.error(err);
          } else {
            return;
          }
        }
      }

      // 2. 공유 시트가 지원되지 않거나 에러 발생 시 안내 가이드 표시
      alert(
        "아이폰(iOS)에서 앱으로 설치하려면:\n\n1. Safari 하단 바 가운데의 '공유' 버튼(네모에서 화살표가 나가는 모양)을 누르세요.\n2. 메뉴를 아래로 내려 '홈 화면에 추가'를 선택해 주세요! 📱",
      );
      return;
    }
    // ... 안드로이드/PC 설치 로직

    const prompt = deferredPrompt || (window as any).deferredPrompt;

    if (!prompt) {
      alert("브라우저 메뉴에서 '앱 설치'를 선택해 주세요!");
      return;
    }

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    }
  };

  // 하이드레이션 방지 및 설치된 경우 숨김
  if (!mounted || isStandalone) return null;

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  return (
    <button
      onClick={handleInstallClick}
      className="p-2 rounded-xl bg-accent/10 text-accent border-2 border-accent/20 shadow-lg shadow-accent/20 hover:bg-accent hover:text-white transition-all duration-300 flex items-center justify-center group active:scale-95"
      title="앱 설치하기"
    >
      <Download className="w-6 h-6 transition-transform" />
    </button>
  );
}
