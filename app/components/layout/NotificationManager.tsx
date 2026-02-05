"use client";

import React, { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
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

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // 기존 구독 확인
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const subscribe = async () => {
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
          },
        ]);
        if (error) throw error;
      }

      setSubscription(sub);
      setPermission("granted");
      alert(
        "실시간 마켓 업데이트 구독이 완료되었습니다! 🚀\n\n뉴스, 공포지수, 환율, 자금흐름 등 앞으로 업데이트되는 모든 시장 지표를 즉시 보내드릴게요.",
      );
    } catch (error) {
      console.error("Failed to subscribe:", error);
      alert("알림 구독에 실패했습니다.");
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
      <div className="flex flex-col gap-2 p-4 bg-secondary/30 rounded-2xl border border-dashed border-border-subtle">
        <p className="text-[11px] font-bold text-text-muted leading-relaxed">
          💡 시장 지표 알림을 받으려면 앱 설치가 필요합니다.
        </p>
        <div className="flex flex-col gap-1.5 pl-1">
          <p className="text-[10px] text-text-muted/70">
            • <b>뉴스와 지표업데이트를 실시간으로</b> 한 번에 받아보세요.
          </p>
          <p className="text-[10px] text-text-muted/70">
            • 홈 화면에 추가하면 강력한 푸시 기능을 사용할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {subscription ? (
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
          title="알림 끄기"
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
          {showText && <span>알림 해제</span>}
        </button>
      ) : (
        <button
          onClick={subscribe}
          disabled={isSubscribing}
          className={`flex items-center justify-center gap-2 rounded-xl bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all duration-300 group active:scale-95 ${
            showText
              ? compact
                ? "px-3 py-1.5 text-[11px] font-bold"
                : "px-4 py-2.5 text-sm font-bold"
              : "p-2"
          }`}
          title="모든 지표 알림 받기"
        >
          {isSubscribing ? (
            <Loader2
              className={`${
                showText ? (compact ? "w-3 h-3" : "w-4 h-4") : "w-5 h-5"
              } animate-spin`}
            />
          ) : (
            <Bell
              className={
                showText ? (compact ? "w-3 h-3" : "w-4 h-4") : "w-5 h-5"
              }
            />
          )}
          {showText && <span>알림 받기</span>}
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
