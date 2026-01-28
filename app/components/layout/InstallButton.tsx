"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

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

  // 하이드레이션 방지 및 설치된 경우/IOS인 경우(IOS는 버튼으로 설치 불가) 숨김
  // 단, IOS는 수동 안내를 위해 InstallPWA가 담당하므로 여기서는 버튼만 깔끔하게 PC/Android용으로 처리
  if (!mounted || isStandalone) return null;

  // iOS 감지 (버튼 방식은 iOS에서 작동안하므로 숨김)
  const isIOS =
    /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  if (isIOS) return null;

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
