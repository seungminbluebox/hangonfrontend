"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { InstallButton } from "./InstallButton";
import { NotificationManager } from "./NotificationManager";
import {
  Menu,
  X,
  TrendingUp,
  Zap,
  Gauge,
  Home,
  Compass,
  RefreshCcw,
  Landmark,
  Activity,
  BarChart3,
  ChevronDown,
  Building2,
  Library,
  Flag,
  DollarSign,
  Banknote,
  Globe,
  Shuffle,
  Waves,
  Bell,
  LayoutDashboard,
} from "lucide-react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showMenuHint, setShowMenuHint] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isNotified, setIsNotified] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const handleLinkClick = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // PWA 및 팁 표시 로직
  useEffect(() => {
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone ||
      document.referrer.includes("android-app://");
    setIsStandalone(isPWA);

    // iOS 감지
    const checkIOS =
      /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(checkIOS);

    // 알림 구독 여부 확인 (권한 및 기존 구독 여부)
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setIsNotified(true);
      }
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          if (sub) setIsNotified(true);
        });
      });
    }

    // 팁은 2초 뒤에 표시
    const timer = setTimeout(() => {
      setShowTips(true);
      // 8초 뒤에 자동으로 숨김
      setTimeout(() => setShowTips(false), 8000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 첫 방문 시 메뉴 힌트 표시 (기존 로직 유지)
  useEffect(() => {
    const hasSeenMenuHint = localStorage.getItem("hasSeenMenuHint");
    if (!hasSeenMenuHint) {
      setShowMenuHint(true);
      setTimeout(() => {
        setShowMenuHint(false);
        localStorage.setItem("hasSeenMenuHint", "true");
      }, 5000);
    }
  }, []);

  // 모바일 메뉴가 열렸을 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setShowMenuHint(false); // 메뉴 열면 힌트 숨김
    } else {
      document.body.style.overflow = "unset";
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    {
      name: "데일리 뉴스",
      href: "/",
      icon: Home,
      desc: "오늘 꼭 알아야 할 핵심 이슈",
      category: "main",
    },
    {
      name: "데일리 리포트",
      href: "/news/daily-report",
      icon: Library,
      desc: "거시경제 맥락과 시장 분석 요약",
      category: "main",
    },
    {
      name: "실시간 속보",
      href: "/live",
      icon: Zap,
      desc: "24시간 멈추지 않는 마켓 시그널",
      category: "main",
    },
    // 국내 증시
    {
      name: "공탐지수",
      href: "/kospi-fear-greed",
      icon: Gauge,
      desc: "KOSPI 시장의 심리 지수 추적",
      category: "domestic",
    },
    {
      name: "자금흐름",
      href: "/money-flow/domestic",
      icon: Waves,
      desc: "한국 시장의 돈의 쏠림 분석",
      category: "domestic",
    },
    {
      name: "코스피 선물",
      href: "/kospi-futures",
      icon: Activity,
      desc: "국내 시장의 선행지표",
      category: "domestic",
    },
    {
      name: "빛투 현황",
      href: "/credit-balance",
      icon: BarChart3,
      desc: "개인 투자자의 신용융자 잔고 추적",
      category: "domestic",
    },

    // 미국 증시
    {
      name: "공탐지수",
      href: "/fear-greed",
      icon: Gauge,
      desc: "미국 시장의 탐욕과 공포",
      category: "us",
    },
    {
      name: "자금흐름",
      href: "/money-flow/us",
      icon: Waves,
      desc: "미국 섹터별 자금 유입 추적",
      category: "us",
    },
    {
      name: "나스닥 선물",
      href: "/nasdaq-futures",
      icon: Activity,
      desc: "미국 시장의 선행지표",
      category: "us",
    },
    {
      name: "풋/콜 옵션",
      href: "/put-call-ratio",
      icon: BarChart3,
      desc: "옵션 시장 투자 심리",
      category: "us",
    },
    // 한미 공통
    {
      name: "환율분석",
      href: "/currency-desk",
      icon: RefreshCcw,
      desc: "스마트한 환전 타이밍 중계",
      category: "global",
    },
    {
      name: "금리",
      href: "/interest-rate",
      icon: Flag,
      desc: "양국 금리 정보",
      category: "global",
    },
    {
      name: "글로벌 투자심리",
      href: "/money-flow/safe",
      icon: Compass,
      desc: "현재 시장은, 안전자산vs위험자산? ",
      category: "global",
    },
  ];

  const currentCategory =
    navLinks.find((link) => link.href === pathname)?.category || "main";
  const subLinks = navLinks.filter((link) => link.category === currentCategory);

  const categoryNames: Record<string, string> = {
    main: "메인",
    domestic: "국내",
    us: "미국",
    global: "글로벌",
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border-subtle py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              onClick={handleLinkClick}
            >
              <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-accent/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black italic">
                Hang on<span className="text-accent">!</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-8">
              <div className="flex items-center gap-1.5 bg-secondary/30 p-1 rounded-2xl border border-border-subtle/50">
                {/* 1. 주요 소식 (Dropdown) */}
                <div
                  className="relative group h-full"
                  onMouseEnter={() => setActiveDropdown("news")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      ["/", "/news/daily-report", "/live"].includes(pathname)
                        ? "text-accent"
                        : "text-text-muted hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>주요 소식</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        activeDropdown === "news" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute top-full left-0 pt-2 w-64 transition-all duration-300 z-50 ${
                      activeDropdown === "news"
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="bg-background/95 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden">
                      {navLinks.slice(0, 3).map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                              pathname === link.href
                                ? "bg-accent/10 text-accent"
                                : "hover:bg-secondary/50 text-text-muted hover:text-foreground"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-accent" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="truncate">{link.name}</span>
                              <span className="text-[10px] opacity-40 font-medium truncate mt-0.5">
                                {link.desc}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. 국내 증시 (Dropdown) */}
                <div
                  className="relative group h-full"
                  onMouseEnter={() => setActiveDropdown("domestic")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      [
                        "/kospi-fear-greed",
                        "/money-flow/domestic",
                        "/credit-balance",
                        "/kospi-futures",
                      ].includes(pathname)
                        ? "text-domestic"
                        : "text-text-muted hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    <span>국내 증시</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        activeDropdown === "domestic" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute top-full left-0 pt-2 w-56 transition-all duration-300 z-50 ${
                      activeDropdown === "domestic"
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="bg-background/95 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden">
                      {navLinks.slice(3, 7).map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                              pathname === link.href
                                ? "bg-domestic/10 text-domestic"
                                : "hover:bg-secondary/50 text-text-muted hover:text-foreground"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-domestic/10 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-domestic" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="truncate">{link.name}</span>
                              <span className="text-[10px] opacity-40 font-medium truncate mt-0.5">
                                {link.desc}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. 미국 증시 (Dropdown) */}
                <div
                  className="relative group h-full"
                  onMouseEnter={() => setActiveDropdown("us")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      [
                        "/fear-greed",
                        "/money-flow/us",
                        "/nasdaq-futures",
                        "/put-call-ratio",
                      ].includes(pathname)
                        ? "text-us"
                        : "text-text-muted hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>미국 증시</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        activeDropdown === "us" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute top-full left-0 pt-2 w-64 transition-all duration-300 z-50 ${
                      activeDropdown === "us"
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="bg-background/95 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-2xl p-2 flex flex-col gap-1">
                      {navLinks.slice(7, 11).map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                              pathname === link.href
                                ? "bg-us/10 text-us"
                                : "hover:bg-secondary/50 text-text-muted hover:text-foreground"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-us/10 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-us" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="truncate">{link.name}</span>
                              <span className="text-[10px] opacity-40 font-medium truncate mt-0.5">
                                {link.desc}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. 글로벌 매크로 (Dropdown) */}
                <div
                  className="relative group h-full"
                  onMouseEnter={() => setActiveDropdown("macro")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      [
                        "/currency-desk",
                        "/interest-rate",
                        "/money-flow/safe",
                      ].includes(pathname)
                        ? "text-common"
                        : "text-text-muted hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>한미 공통</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        activeDropdown === "macro" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute top-full right-0 md:left-0 pt-2 w-64 transition-all duration-300 z-50 ${
                      activeDropdown === "macro"
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="bg-background/95 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-2xl p-2 flex flex-col gap-1">
                      {navLinks.slice(11).map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                              pathname === link.href
                                ? "bg-common/10 text-common"
                                : "hover:bg-secondary/50 text-text-muted hover:text-foreground"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-common/10 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-common" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="truncate">{link.name}</span>
                              <span className="text-[10px] opacity-40 font-medium truncate mt-0.5">
                                {link.desc}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden xl:block w-px h-6 bg-border-subtle/50" />
              <div className="hidden lg:block">
                <InstallButton />
              </div>
              <NotificationManager />
              <ThemeToggle />
            </div>

            {/* Mobile Menu Actions (Top) */}
            <div className="flex lg:hidden items-center gap-2">
              <div className="relative">
                <InstallButton />
                {!isStandalone && showTips && (
                  <div className="absolute top-full mt-3 right-0 z-50 animate-in fade-in slide-in-from-top-2 duration-700">
                    <div className="bg-accent text-white text-[10px] py-2 px-3 rounded-xl whitespace-nowrap shadow-[0_10px_25px_rgba(37,99,235,0.4)] relative font-black tracking-tight animate-bounce-subtle">
                      {isIOS
                        ? "앱 설치 : 공유 버튼 누르고 '홈 화면에 추가' 클릭! 📱"
                        : "앱으로 설치하고 더 편하게 보세요! 📱"}
                      <div className="absolute bottom-full right-3.5 -mb-1 w-2 h-2 bg-accent rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <NotificationManager />
                {isStandalone && !isNotified && showTips && (
                  <div className="absolute top-full mt-3 right-0 z-50 animate-in fade-in slide-in-from-top-2 duration-700">
                    <div className="bg-accent text-white text-[10px] py-2 px-3 rounded-xl whitespace-nowrap shadow-[0_10px_25px_rgba(37,99,235,0.4)] relative font-black tracking-tight animate-bounce-subtle">
                      중요한 경제 소식, 실시간 알림 받기! 🔔
                      <div className="absolute bottom-full right-3.5 -mb-1 w-2 h-2 bg-accent rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sub-Navigation (Top horizontal scroll) */}
      <div
        className={`lg:hidden fixed ${
          scrolled ? "top-[52px]" : "top-[72px]"
        } left-0 right-0 z-[50] bg-card/95 backdrop-blur-xl border-b border-border-subtle/80 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-300`}
      >
        <div className="flex items-center no-scrollbar overflow-x-auto h-[52px]">
          {/* Category Badge */}
          <div className="sticky left-0 flex items-center h-full pl-4 pr-3 bg-card/95 backdrop-blur-xl z-20 shrink-0 after:content-[''] after:absolute after:right-0 after:top-1/4 after:h-1/2 after:w-px after:bg-border-subtle/50">
            <span className="text-[15px] font-black text-accent uppercase tracking-[0.15em]   rounded-md  ">
              {categoryNames[currentCategory]}
            </span>
          </div>

          <div className="flex items-center gap-2 px-4">
            {subLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap text-[11px] font-black transition-all duration-300 ${
                    isActive
                      ? "bg-accent text-white shadow-lg shadow-accent/25 ring-2 ring-accent ring-offset-2 ring-offset-card"
                      : "bg-secondary border border-border-subtle/30 text-text-muted hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? "stroke-[2.5px] scale-110" : "stroke-2 opacity-70"}`}
                  />
                  {link.name}
                </Link>
              );
            })}
          </div>
          {/* End gradient mask for scroll indication */}
          <div className="sticky right-0 w-8 h-full bg-gradient-to-l from-card to-transparent pointer-events-none z-10 shrink-0" />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-background/90 backdrop-blur-xl border-t border-border-subtle px-4 py-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="grid grid-cols-5 items-center max-w-sm mx-auto">
          {[
            {
              name: "국내",
              href: "/kospi-fear-greed",
              icon: Flag,
              cat: "domestic",
            },
            {
              name: "미국",
              href: "/fear-greed",
              icon: DollarSign,
              cat: "us",
            },
            { name: "홈", href: "/", icon: Home, cat: "main" },
            {
              name: "글로벌",
              href: "/currency-desk",
              icon: Globe,
              cat: "global",
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentCategory === item.cat;

            // 중앙 홈 버튼 디자인 (--O--)
            if (item.cat === "main") {
              return (
                <div
                  key={item.name}
                  className="relative flex flex-col items-center"
                >
                  <div className="absolute top-1/2 left-0 right-0 flex items-center justify-between px-1 pointer-events-none opacity-20">
                    <div className="h-[2px] w-3 bg-foreground rounded-full" />
                    <div className="h-[2px] w-3 bg-foreground rounded-full" />
                  </div>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`relative z-10 flex flex-col items-center gap-1 transition-all active:scale-90 ${
                      isActive ? "text-accent" : "text-text-muted"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-accent shadow-[0_4px_12px_rgba(25,99,235,0.3)] text-white scale-110"
                          : "bg-secondary/80 border border-border-subtle"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`}
                      />
                    </div>
                    <span
                      className={`text-[9px] font-black ${isActive ? "opacity-100" : "opacity-40"}`}
                    >
                      {item.name}
                    </span>
                  </Link>
                </div>
              );
            }

            // 일반 버튼
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
                  isActive
                    ? "text-accent"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isActive ? "bg-accent/10" : "group-hover:bg-secondary/50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`}
                  />
                </div>
                <span
                  className={`text-[10px] font-black tracking-tight ${isActive ? "opacity-100" : "opacity-60"}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* 메뉴 토글 버튼 */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
              isOpen ? "text-accent" : "text-text-muted hover:text-foreground"
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-all duration-300 ${
                isOpen ? "bg-accent/10" : "group-hover:bg-secondary/50"
              }`}
            >
              {isOpen ? (
                <X className="w-5 h-5 stroke-[2.5px]" />
              ) : (
                <Menu className="w-5 h-5 stroke-2" />
              )}
            </div>
            <span
              className={`text-[10px] font-black tracking-tight ${isOpen ? "opacity-100" : "opacity-60"}`}
            >
              메뉴
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 ${scrolled ? "top-[52px]" : "top-[72px]"} z-[55] bg-background/95 backdrop-blur-xl lg:hidden overflow-y-auto transition-all duration-500 ease-out ${
          isOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col p-6 space-y-8 pb-32">
          {/* 메뉴 헤더 */}
          <div
            className={`transition-all duration-500 ${
              isOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
          >
            <h2 className="text-2xl font-black tracking-tight text-foreground mb-2">
              무엇이 궁금하신가요? 🤔
            </h2>
            <div className="h-1 w-12 bg-accent rounded-full"></div>
          </div>

          {/* 알림 구독 (모바일 전용 위치) */}
          <div
            className={`transition-all duration-500 delay-100 ${
              isOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
          >
            <div className="bg-secondary/20 backdrop-blur-md border border-border-subtle/50 rounded-[1.25rem] p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden ml-0.5">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/10">
                  <Bell className="w-4.5 h-4.5 text-accent" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-[13px] font-black text-foreground truncate">
                    실시간 알림
                  </h4>
                  <p className="text-[10px] text-text-muted/60 font-medium truncate">
                    뉴스 및 지표 업데이트
                  </p>
                </div>
              </div>
              <NotificationManager showText={true} compact={true} />
            </div>
          </div>

          {/* 카테고리 1: 뉴스 */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest ml-1">
              Main Dashboard
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {navLinks.slice(0, 3).map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                      pathname === link.href
                        ? "bg-accent text-white border-accent shadow-lg shadow-accent/25"
                        : "bg-secondary/30 border-border-subtle/50"
                    } ${
                      isOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }`}
                    style={{
                      transitionDelay: isOpen ? `${index * 30}ms` : "0ms",
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        pathname === link.href ? "bg-white/20" : "bg-accent/10"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          pathname === link.href ? "text-white" : "text-accent"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-black tracking-tight truncate">
                        {link.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold mt-0.5 truncate ${
                          pathname === link.href
                            ? "text-white/60"
                            : "text-foreground/40"
                        }`}
                      >
                        {link.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 카테고리 2: 국내 증시 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
              <Flag className="w-3 h-3 text-domestic/50" />
              <h3 className="text-[13px] font-black text-text-muted/40 uppercase tracking-widest">
                국내 증시
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {navLinks.slice(3, 7).map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                      pathname === link.href
                        ? "bg-domestic text-white border-domestic shadow-lg shadow-domestic/25"
                        : "bg-secondary/30 border-border-subtle/50"
                    } ${
                      isOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }`}
                    style={{
                      transitionDelay: isOpen ? `${(index + 3) * 30}ms` : "0ms",
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        pathname === link.href
                          ? "bg-white/20"
                          : "bg-domestic/10"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          pathname === link.href
                            ? "text-white"
                            : "text-domestic"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-black tracking-tight truncate">
                        {link.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold mt-0.5 truncate ${
                          pathname === link.href
                            ? "text-white/60"
                            : "text-foreground/40"
                        }`}
                      >
                        {link.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 카테고리 3: 미국 증시 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
              <DollarSign className="w-3 h-3 text-us/50" />
              <h3 className="text-[13px] font-black text-text-muted/40 uppercase tracking-widest">
                미국 증시
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {navLinks.slice(7, 11).map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                      pathname === link.href
                        ? "bg-us text-white border-us shadow-lg shadow-us/25"
                        : "bg-secondary/30 border-border-subtle/50"
                    } ${
                      isOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }`}
                    style={{
                      transitionDelay: isOpen ? `${(index + 7) * 30}ms` : "0ms",
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        pathname === link.href ? "bg-white/20" : "bg-us/10"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          pathname === link.href ? "text-white" : "text-us"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-black tracking-tight truncate">
                        {link.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold mt-0.5 truncate ${
                          pathname === link.href
                            ? "text-white/60"
                            : "text-foreground/40"
                        }`}
                      >
                        {link.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 카테고리 4: 글로벌 매크로 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
              <Globe className="w-3 h-3 text-common/50" />
              <h3 className="text-[13px] font-black text-text-muted/40 uppercase tracking-widest">
                한미 공통
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {navLinks.slice(11).map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                      pathname === link.href
                        ? "bg-common text-white border-common shadow-lg shadow-common/25"
                        : "bg-secondary/30 border-border-subtle/50"
                    } ${
                      isOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }`}
                    style={{
                      transitionDelay: isOpen
                        ? `${(index + 11) * 30}ms`
                        : "0ms",
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        pathname === link.href ? "bg-white/20" : "bg-common/10"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          pathname === link.href ? "text-white" : "text-common"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-black tracking-tight truncate">
                        {link.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold mt-0.5 truncate ${
                          pathname === link.href
                            ? "text-white/60"
                            : "text-foreground/40"
                        }`}
                      >
                        {link.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
