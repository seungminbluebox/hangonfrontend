"use client";

import { useEffect, useState } from "react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. 이미 설치되었는지 확인
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) return;

    // 2. 닫은 기록 확인 (거절했으면 3일 동안 묻지 않음)
    const lastDismissed = localStorage.getItem("hangon-pwa-last-dismissed");
    const now = Date.now();
    if (lastDismissed && now - parseInt(lastDismissed) < 259200000) {
      // 3일
      return;
    }

    // iOS 감지
    const isIOS =
      /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    const showNativePrompt = async (e: any) => {
      // 약간의 지연 후 알림창 표시 (페이지 로드 즉시는 차단될 수 있음)
      setTimeout(() => {
        if (window.confirm("Hang on! 앱을 설치하시겠습니까?")) {
          e.prompt();
          e.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === "accepted") {
              console.log("User accepted the install prompt");
            } else {
              localStorage.setItem(
                "hangon-pwa-last-dismissed",
                Date.now().toString(),
              );
            }
            setDeferredPrompt(null);
          });
        } else {
          localStorage.setItem(
            "hangon-pwa-last-dismissed",
            Date.now().toString(),
          );
        }
      }, 2000);
    };

    // 안드로이드/크롬 환경
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      showNativePrompt(e);
    };

    // iOS 환경 (네이티브 프로토콜이 없어서 수동 안내)
    const handleIOS = () => {
      if (isIOS && !isStandalone) {
        setTimeout(() => {
          if (
            window.confirm(
              "Hang on! 앱으로 설치하시겠습니까?\n\n아이폰은 하단 '공유' 버튼을 누른 뒤\n'홈 화면에 추가'를 선택해 주세요!",
            )
          ) {
            // iOS는 브라우저가 창을 띄울 수 없으므로 가이드만 제공
          } else {
            localStorage.setItem(
              "hangon-pwa-last-dismissed",
              Date.now().toString(),
            );
          }
        }, 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // 이전에 캡처된 프롬프트가 있는지 확인 (layout.tsx에서 설정함)
    if ((window as any).deferredPrompt) {
      const savedPrompt = (window as any).deferredPrompt;
      setDeferredPrompt(savedPrompt);
      showNativePrompt(savedPrompt);
    }

    if (isIOS) {
      handleIOS();
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  return null; // UI는 브라우저 알림창(confirm/native)으로 대체하므로 null 반환
}
