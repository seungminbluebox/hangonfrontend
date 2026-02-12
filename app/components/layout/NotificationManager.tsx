"use client";

import React, { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, Settings } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function NotificationManager({
  showText = false,
  compact = false,
}: {
  showText?: boolean;
  compact?: boolean;
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBalloon, setShowBalloon] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // PWA 설치 여부 확인
      const checkStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone ||
        document.referrer.includes("android-app://");
      setIsStandalone(checkStandalone);

      // 기존 구독 확인
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });

      const handleFocus = () => {
        setPermission(Notification.permission);
      };
      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }
  }, []);

  const subscribe = async () => {
    if (!isStandalone) {
      if (
        confirm(
          "앱 설치를 하시면 알림을 받을 수 있습니다!\n지금 앱을 설치하시겠습니까?",
        )
      ) {
        const deferredPrompt = (window as any).deferredPrompt;
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === "accepted") {
            (window as any).deferredPrompt = null;
          }
        } else {
          // iOS나 deferredPrompt가 없는 경우
          alert(
            "브라우저 설정 메뉴에서 '앱 설치' 또는 '홈 화면에 추가'를 선택해 주세요!",
          );
        }
      }
      return;
    }

    if (!VAPID_PUBLIC_KEY) {
      alert("VAPID Public Key가 설정되지 않았습니다.");
      return;
    }

    try {
      setIsSubscribing(true);

      // 1. 서비스 워커 등록 확인 및 대기
      let registration = await navigator.serviceWorker.getRegistration();

      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js");
      }

      // 2. 서비스 워커가 활성화될 때까지 대기
      await navigator.serviceWorker.ready;

      // 3. 다시 한 번 활성 서비스 워커를 가져옴 (ready 이후에도 즉시 subscribe가 실패할 수 있음)
      if (!registration.active) {
        // 활성화될 때까지 잠시 대기
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 기본 설정 객체 (한 곳에서 관리하는 것이 좋음)
      const defaultPreferences = {
        breaking_news: true,
        daily_update: true,
        us_fear_greed: true,
        us_money_flow: true,
        us_pcr: true,
        kr_fear_greed: true,
        kr_money_flow: true,
        kr_credit_balance: true,
        common_currency: true,
        common_global_sentiment: true,
        market_holidays: true,
      };

      // Supabase에 중복 확인 후 저장
      const { data: existing } = await supabase
        .from("push_subscriptions")
        .select("id")
        .eq("subscription->>endpoint", sub.endpoint)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("push_subscriptions").insert([
          {
            subscription: sub.toJSON(),
            user_agent: navigator.userAgent,
            preferences: defaultPreferences,
          },
        ]);
        if (error) throw error;
      }

      setSubscription(sub);
      setPermission("granted");
      alert(
        "실시간 마켓 업데이트 구독이 완료되었습니다! 🚀\n\n뉴스, 공포지수, 환율, 자금흐름 등 앞으로 업데이트되는 모든 시장 지표를 즉시 보내드릴게요.",
      );
    } catch (error: any) {
      console.error("Failed to subscribe:", error);
      if (Notification.permission === "denied") {
        alert(
          "알림 권한이 거부되어 있습니다. 브라우저 설정에서 알림을 허용해 주세요.",
        );
        setPermission("denied");
      } else {
        alert("알림 구독에 실패했습니다.");
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribe = async () => {
    try {
      setIsSubscribing(true);
      if (subscription) {
        await subscription.unsubscribe();

        // Supabase에서 삭제 (JSON 필드로 비교하기에는 복잡하므로 여기서는 간단히 처리)
        // 실제로는 subscription.endpoint로 식별하는 것이 좋습니다.
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("subscription->>endpoint", subscription.endpoint);

        setSubscription(null);
        alert("알림 구독이 해지되었습니다.");
      }
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowBalloon(!showBalloon)}
          className={`flex items-center justify-center gap-2 rounded-xl bg-secondary/50 text-text-muted border border-border-subtle hover:bg-secondary/80 transition-all duration-300 group active:scale-95 ${
            showText
              ? compact
                ? "px-3 py-1.5 text-[11px] font-bold"
                : "px-4 py-2.5 text-sm font-bold"
              : "p-2"
          }`}
          title="알림 설치 안내"
        >
          <Bell
            className={showText ? (compact ? "w-3 h-3" : "w-4 h-4") : "w-5 h-5"}
          />
          {showText && <span>알림 안내</span>}
        </button>

        {showBalloon && (
          <div className="absolute top-full mt-3 right-0 z-[100] w-64 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-card border border-border-subtle p-4 rounded-2xl shadow-2xl relative">
              {/* Arrow */}
              <div className="absolute -top-1.5 right-4 w-3 h-3 bg-card border-l border-t border-border-subtle rotate-45" />

              <p className="text-[11px] font-bold text-foreground leading-relaxed mb-2">
                💡 시장 지표 알림을 받으려면 앱 설치가 필요합니다.
              </p>
              <div className="flex flex-col gap-1.5 pl-1">
                <p className="text-[10px] text-foreground/60 leading-relaxed">
                  • <b>뉴스와 지표업데이트를 실시간으로</b> 한 번에 받아보세요.
                </p>
                <p className="text-[10px] text-foreground/60 leading-relaxed">
                  • 홈 화면에 추가하면 강력한 푸시 기능을 사용할 수 있습니다.
                </p>
              </div>
            </div>
            {/* Backdrop for closing */}
            <div
              className="fixed inset-0 z-[-1]"
              onClick={() => setShowBalloon(false)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {subscription ? (
        <>
          <Link
            href="/notifications"
            className={`flex items-center justify-center gap-2 rounded-xl bg-secondary/50 text-text-muted border border-border-subtle hover:bg-secondary/80 transition-all duration-300 group active:scale-95 ${
              showText
                ? compact
                  ? "px-3 py-1.5 text-[11px] font-bold"
                  : "px-4 py-2.5 text-sm font-bold"
                : "p-2"
            }`}
            title="알림 설정"
          >
            <Settings
              className={
                showText ? (compact ? "w-3 h-3" : "w-4 h-4") : "w-5 h-5"
              }
            />
            {showText && <span>설정</span>}
          </Link>
          <button
            onClick={unsubscribe}
            disabled={isSubscribing}
            className={`flex items-center justify-center gap-2 rounded-xl bg-secondary text-text-muted border border-border-subtle hover:bg-secondary/80 transition-all duration-300 group active:scale-95 ${
              showText
                ? compact
                  ? "px-3 py-1.5 text-[11px] font-bold"
                  : "px-4 py-2.5 text-sm font-bold"
                : "p-2"
            }`}
            title="알림 구독중"
          >
            {isSubscribing ? (
              <Loader2
                className={`${
                  showText ? (compact ? "w-3 h-3" : "w-4 h-4") : "w-5 h-5"
                } animate-spin`}
              />
            ) : (
              <BellOff
                className={
                  showText ? (compact ? "w-3 h-3" : "w-4 h-4") : "w-5 h-5"
                }
              />
            )}
            {showText && <span>구독중</span>}
          </button>
        </>
      ) : (
        <button
          onClick={subscribe}
          disabled={isSubscribing}
          className={`flex items-center justify-center gap-2 rounded-xl transition-all duration-300 group active:scale-95 ${
            permission === "denied"
              ? "bg-secondary text-foreground/30 border border-border-subtle"
              : "bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent/90"
          } ${
            showText
              ? compact
                ? "px-3 py-1.5 text-[11px] font-bold"
                : "px-4 py-2.5 text-sm font-bold"
              : "p-2"
          }`}
          title={
            permission === "denied"
              ? "알림 권한이 거부됨 (설정 필요)"
              : "모든 지표 알림 받기"
          }
        >
          {isSubscribing ? (
            <Loader2
              className={`${
                showText ? (compact ? "w-3 h-3" : "w-4 h-4") : "w-5 h-5"
              } animate-spin`}
            />
          ) : permission === "denied" ? (
            <BellOff
              className={
                showText ? (compact ? "w-3 h-3" : "w-4 h-4") : "w-5 h-5"
              }
            />
          ) : (
            <Bell
              className={
                showText ? (compact ? "w-3 h-3" : "w-4 h-4") : "w-5 h-5"
              }
            />
          )}
          {showText && (
            <span>{permission === "denied" ? "차단됨" : "알림 받기"}</span>
          )}
        </button>
      )}
    </div>
  );
}

// Helper function for VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
