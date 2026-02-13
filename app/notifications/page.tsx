"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  Settings,
  ChevronRight,
  AlertCircle,
  Zap,
  Calendar,
  TrendingUp,
  Globe,
  DollarSign,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Inbox,
  Moon,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { BackButton } from "../components/layout/BackButton";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

interface PreferenceGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: {
    id: string;
    label: string;
    description: string;
  }[];
}

const NOTIFICATION_GROUPS: PreferenceGroup[] = [
  {
    id: "essential",
    title: "필수 및 주요 알림",
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
    items: [
      {
        id: "breaking_news",
        label: "실시간 속보",
        description: "24시간 실시간 주요 경제 뉴스",
      },
      {
        id: "daily_update",
        label: "데일리 업데이트",
        description: "브리핑 및 뉴스 요약 리포트",
      },
    ],
  },
  {
    id: "us_market",
    title: "미국 시장",
    icon: <DollarSign className="w-5 h-5 text-blue-500" />,
    items: [
      {
        id: "us_fear_greed",
        label: "미국 공탐지수",
        description: "Fear & Greed Index 업데이트 알림",
      },
      {
        id: "us_money_flow",
        label: "미국 증시 자금흐름",
        description: "시장 자금 유입/유출 현황 업데이트",
      },
      {
        id: "us_pcr",
        label: "미국 풋콜옵션 비율",
        description: "시장 심리 지표 PCR 업데이트",
      },
    ],
  },
  {
    id: "kr_market",
    title: "국내 시장",
    icon: <TrendingUp className="w-5 h-5 text-red-500" />,
    items: [
      {
        id: "kr_fear_greed",
        label: "국내 공탐지수",
        description: "한국형 Fear & Greed Index 업데이트",
      },
      {
        id: "kr_money_flow",
        label: "한국 증시 자금흐름",
        description: "국내 시장 자금 데이터 업데이트",
      },
      {
        id: "kr_credit_balance",
        label: "빚투(신용융자) 현황",
        description: "투자자 예탁금 및 신용잔고 현황",
      },
    ],
  },
  {
    id: "common",
    title: "한미공통 & 글로벌",
    icon: <Globe className="w-5 h-5 text-green-500" />,
    items: [
      {
        id: "common_currency",
        label: "원/달러 환율 브리핑",
        description: "환율 급변동 및 주요 시간대 브리핑",
      },
      {
        id: "common_global_sentiment",
        label: "글로벌 투자심리",
        description: "글로벌 주요 국가 투자 심리 지표",
      },
    ],
  },
  {
    id: "schedule",
    title: "마켓 일정",
    icon: <Calendar className="w-5 h-5 text-purple-500" />,
    items: [
      {
        id: "market_holidays",
        label: "휴장 일정 안내",
        description: "한/미 증시 휴장 전날 및 당일 아침 알림",
      },
    ],
  },
];

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [permissionState, setPermissionState] =
    useState<NotificationPermission>("default");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      essential: true,
      us_market: true,
      kr_market: true,
      common: true,
      schedule: true,
    },
  );
  const [isStandalone, setIsStandalone] = useState(false);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // 1. PWA 여부 확인
        const checkStandalone =
          window.matchMedia("(display-mode: standalone)").matches ||
          (navigator as any).standalone ||
          document.referrer.includes("android-app://");
        setIsStandalone(checkStandalone);

        // 2. 권한 상태 확인
        if ("Notification" in window) {
          setPermissionState(Notification.permission);
        }

        // 3. 로컬 개발 환경 테스트용 (127.0.0.1 추가)
        const isDev =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";

        if (isDev) {
          setSubscription({ endpoint: "test-endpoint" });
          const defaultPrefs: Record<string, boolean> = {
            etiquette_mode: false,
          };
          NOTIFICATION_GROUPS.forEach((g) =>
            g.items.forEach((i) => (defaultPrefs[i.id] = true)),
          );
          setPreferences(defaultPrefs);
          // 로컬일 경우 바로 로딩 해제
          setLoading(false);
          return;
        }

        // 2. 운영 환경에서의 실제 구독 정보 불러오기
        if ("serviceWorker" in navigator && "PushManager" in window) {
          // ready가 너무 오래 걸릴 경우를 대비해 2초 타임아웃 설정
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject("Timeout"), 2000),
          );
          const ready = navigator.serviceWorker.ready;

          try {
            await Promise.race([ready, timeout]);
            const registration =
              await navigator.serviceWorker.getRegistration();
            if (registration) {
              const sub = await registration.pushManager.getSubscription();
              setSubscription(sub);
              if (sub) {
                const { data } = await supabase
                  .from("push_subscriptions")
                  .select("preferences")
                  .eq("subscription->>endpoint", sub.endpoint)
                  .maybeSingle();

                if (data?.preferences) {
                  setPreferences(data.preferences);
                }
              }
            }
          } catch (e) {
            console.warn("SW ready timeout or error:", e);
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    }

    init();

    const handleFocus = () => {
      if ("Notification" in window) {
        setPermissionState(Notification.permission);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handlePreferenceChange = async (id: string, value: boolean) => {
    if (!subscription) return;

    const newPrefs = { ...preferences, [id]: value };
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const handleGroupToggle = (groupId: string, value: boolean) => {
    if (!subscription) return;

    const group = NOTIFICATION_GROUPS.find((g) => g.id === groupId);
    if (!group) return;

    const newPrefs = { ...preferences };
    group.items.forEach((item) => {
      newPrefs[item.id] = value;
    });

    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const savePreferences = async (newPrefs: Record<string, boolean>) => {
    setSavingStatus("saving");
    try {
      if (subscription) {
        await supabase
          .from("push_subscriptions")
          .update({ preferences: newPrefs })
          .eq("subscription->>endpoint", subscription.endpoint);

        setSavingStatus("saved");
        setTimeout(() => setSavingStatus("idle"), 2000);
      }
    } catch (err) {
      console.error("Failed to save preferences:", err);
      setSavingStatus("idle");
    }
  };

  const isGroupAllChecked = (groupId: string) => {
    const group = NOTIFICATION_GROUPS.find((g) => g.id === groupId);
    return group?.items.every((item) => preferences[item.id]) ?? false;
  };

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

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js");
      }

      await navigator.serviceWorker.ready;

      if (!registration.active) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const defaultPreferences: Record<string, boolean> = {
        etiquette_mode: false,
      };
      NOTIFICATION_GROUPS.forEach((g) =>
        g.items.forEach((i) => (defaultPreferences[i.id] = true)),
      );

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
      setPreferences(defaultPreferences);
      setPermissionState("granted");
      alert("알림 구독이 완료되었습니다! 🚀");
    } catch (error: any) {
      console.error("Failed to subscribe:", error);
      if (Notification.permission === "denied") {
        alert(
          "알림 권한이 거부되어 있습니다. 브라우저 설정에서 알림을 허용해 주세요.",
        );
        setPermissionState("denied");
      } else {
        alert("알림 구독에 실패했습니다.");
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm font-bold text-foreground/50">설정 로딩 중...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 md:pt-32 pb-20">
        <BackButton />

        <div className="max-w-2xl mt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-black italic tracking-tight uppercase">
                  알림 설정 센터
                </h1>
                <p className="text-xs font-bold text-foreground/40 mt-0.5">
                  나에게 꼭 필요한 마켓 정보만 골라 받으세요.
                </p>
              </div>
            </div>
            {savingStatus === "saving" && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full animate-pulse">
                <Loader2 className="w-3 h-3 text-accent animate-spin" />
                <span className="text-[10px] font-black text-accent uppercase">
                  Saving...
                </span>
              </div>
            )}
            {savingStatus === "saved" && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full text-green-500">
                <Check className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase">Saved!</span>
              </div>
            )}
          </div>

          {permissionState === "denied" ? (
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <BellOff className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-black italic text-red-600">
                  브라우저 알림이 차단되어 있습니다
                </h2>
                <p className="text-sm font-bold text-foreground/70 leading-relaxed max-w-sm mx-auto">
                  현재 브라우저 설정에서 알림 권한이 <b>거부</b> 상태입니다.
                  설정에서 알림을 허용으로 변경해야 알림을 받으실 수 있습니다.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 pt-2 text-left">
                <div className="p-5 bg-background border border-border-subtle rounded-2xl">
                  <p className="text-xs font-black uppercase italic mb-3 text-foreground/40">
                    해결 방법
                  </p>
                  <ol className="text-xs font-bold text-foreground/80 space-y-3 list-decimal ml-4">
                    <li>브라우저 주소창 왼쪽의 자물쇠/설정 아이콘 클릭</li>
                    <li>
                      &apos;알림&apos; 항목을 찾아서 &apos;허용&apos;으로 변경
                    </li>
                    <li>페이지를 새로고침하여 설정을 다시 확인</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : !subscription ? (
            <div className="bg-card border border-border-subtle rounded-3xl p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-10 h-10 text-foreground/20" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black italic">
                  아직 알림을 구독하지 않았습니다.
                </h2>
                <p className="text-sm font-bold text-foreground/60 leading-relaxed">
                  먼저 실시간 알림 받기를 시작해야
                  <br />
                  세부적인 알림 설정이 가능합니다.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={subscribe}
                  disabled={isSubscribing}
                  className="w-full py-4 bg-accent text-white rounded-2xl font-black text-lg shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      신청 중...
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5" />
                      실시간 알림 신청하기
                    </>
                  )}
                </button>
              </div>

              {!isStandalone && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex items-start gap-3 text-left">
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-yellow-700 leading-normal">
                    알림을 받으려면 반드시 <b>앱으로 설치</b>가 필요합니다.
                    브라우저 메뉴의 &apos;앱 설치&apos; 또는 &apos;홈 화면에
                    추가&apos;를 눌러주세요.
                  </p>
                </div>
              )}
              <div className="pt-4 px-4">
                <p className="text-[11px] font-bold text-foreground/30 leading-relaxed">
                  * 안드로이드/PC 사용자는 설치 없이도 가능할 수 있으나,
                  <br />
                  원활한 서비스를 위해 설치를 권장합니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-10">
              {/* 수면 중 에티켓 모드 전용 섹션 */}
              <div className="bg-card border-2 border-accent/20 rounded-[2.5rem] p-6 shadow-sm shadow-accent/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-accent/10 border border-accent/10">
                      <Moon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-black italic tracking-tight text-foreground">
                        수면 에티켓 모드
                      </h3>
                      <p className="text-[11px] font-bold text-foreground/40 mt-0.5 leading-snug">
                        새벽(0~9시) 알림을 오전 9시에 한꺼번에 받습니다.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handlePreferenceChange(
                        "etiquette_mode",
                        !preferences["etiquette_mode"],
                      )
                    }
                    className={`w-14 h-7 rounded-full transition-all relative border-2 ${
                      preferences["etiquette_mode"]
                        ? "bg-accent border-accent shadow-lg shadow-accent/30"
                        : "bg-foreground/5 border-foreground/5"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                        preferences["etiquette_mode"]
                          ? "translate-x-7"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4 pb-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 px-2">
                  Notification Categories
                </h4>
              </div>

              {NOTIFICATION_GROUPS.map((group) => (
                <div
                  key={group.id}
                  className="bg-card border border-border-subtle rounded-3xl overflow-hidden transition-all"
                >
                  <div
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-secondary/20"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-background border border-border-subtle">
                        {group.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-black italic">
                          {group.title}
                        </h3>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2 pr-3 border-r border-border-subtle">
                        <button
                          onClick={() =>
                            handleGroupToggle(
                              group.id,
                              !isGroupAllChecked(group.id),
                            )
                          }
                          className={`w-10 h-5 rounded-full transition-all relative border-2 ${
                            isGroupAllChecked(group.id)
                              ? "bg-accent border-accent"
                              : "bg-foreground/10 border-foreground/5"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${
                              isGroupAllChecked(group.id)
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                      {expandedGroups[group.id] ? (
                        <ChevronUp className="w-5 h-5 text-foreground/30" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-foreground/30" />
                      )}
                    </div>
                  </div>

                  {expandedGroups[group.id] && (
                    <div className="px-5 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border-subtle/50"
                        >
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold">{item.label}</p>
                            <p className="text-[11px] text-foreground/50 font-medium">
                              {item.description}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handlePreferenceChange(
                                item.id,
                                !preferences[item.id],
                              )
                            }
                            className={`w-10 h-5 rounded-full transition-all relative border-2 ${
                              preferences[item.id]
                                ? "bg-accent border-accent"
                                : "bg-foreground/10 border-foreground/5"
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${
                                preferences[item.id]
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-8 p-6 bg-accent/5 border border-accent/10 rounded-3xl flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-accent uppercase italic">
                    알림이 오지 않나요?
                  </p>
                  <p className="text-xs font-bold text-foreground/60 leading-relaxed">
                    브라우저나 시스템 설정에서 &apos;알림 허용&apos;이 되어
                    있는지 확인해 주세요. 앱을 완전히 종료했다가 다시 실행하면
                    대부분 해결됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

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
