"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import {
  Menu,
  X,
  TrendingUp,
  Gauge,
  Home,
  CloudSun,
  Compass,
  RefreshCcw,
  Landmark,
  Activity,
  ChevronDown,
} from "lucide-react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showMenuHint, setShowMenuHint] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 첫 방문 시 메뉴 힌트 표시
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
    },
    {
      name: "환율분석 데스크",
      href: "/currency-desk",
      icon: RefreshCcw,
      desc: "스마트한 환전 타이밍 중계",
    },
    {
      name: "한/미 금리 현황",
      href: "/interest-rate",
      icon: Landmark,
      desc: "경제의 기초 체력, 양국 금리 정보",
    },
    {
      name: "나스닥 선물(나선)",
      href: "/nasdaq-futures",
      icon: Activity,
      desc: "미국 시장의 선행지표",
    },
    {
      name: "공탐지수 분석",
      href: "/fear-greed",
      icon: Gauge,
      desc: "인간의 탐욕과 공포 데이터 분석",
    },
    {
      name: "코스피 공탐지수",
      href: "/kospi-fear-greed",
      icon: Gauge,
      desc: "KOSPI 시장의 심리 지수 추적",
    },
    {
      name: "자금 흐름",
      href: "/money-flow",
      icon: Compass,
      desc: "돈의 쏠림이 만드는 투자의 기회",
    },
    {
      name: "주식 기상예보",
      href: "/market-weather",
      icon: CloudSun,
      desc: "데이터 기반 시장 상황 분석",
    },
  ];

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
            <Link href="/" className="flex items-center gap-2 group">
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
                {/* 1. 홈 (Standalone) */}
                <Link
                  href="/"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    pathname === "/"
                      ? "bg-background text-accent shadow-sm"
                      : "text-text-muted hover:text-foreground hover:bg-background/40"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>뉴스홈</span>
                </Link>

                {/* 2. 실시간 지표 (Dropdown) */}
                <div
                  className="relative group h-full"
                  onMouseEnter={() => setActiveDropdown("live")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      [
                        "/currency-desk",
                        "/interest-rate",
                        "/nasdaq-futures",
                      ].includes(pathname)
                        ? "text-accent"
                        : "text-text-muted hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>실시간 지표</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        activeDropdown === "live" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute top-full left-0 pt-2 w-56 transition-all duration-300 z-50 ${
                      activeDropdown === "live"
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="bg-background/95 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden">
                      {navLinks.slice(1, 4).map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
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

                {/* 3. 시장 통찰 (Dropdown) */}
                <div
                  className="relative group h-full"
                  onMouseEnter={() => setActiveDropdown("analysis")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      [
                        "/fear-greed",
                        "/kospi-fear-greed",
                        "/money-flow",
                        "/market-weather",
                      ].includes(pathname)
                        ? "text-accent"
                        : "text-text-muted hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>시장 통찰</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        activeDropdown === "analysis" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute top-full right-0 md:left-0 pt-2 w-64 transition-all duration-300 z-50 ${
                      activeDropdown === "analysis"
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="bg-background/95 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-2xl p-2 flex flex-col gap-1">
                      {navLinks.slice(4).map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
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
              </div>
              <div className="hidden xl:block w-px h-6 bg-border-subtle/50" />
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-3">
              <ThemeToggle />
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={`p-2 rounded-xl bg-accent/10 text-accent border-2 border-accent/20 shadow-lg shadow-accent/20 hover:bg-accent hover:text-white transition-all duration-300 ${
                    showMenuHint ? "animate-pulse" : ""
                  }`}
                >
                  {isOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
                {showMenuHint && !isOpen && (
                  <div className="absolute -bottom-12 right-0 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg animate-bounce whitespace-nowrap">
                    메뉴 보기 👆
                    <div className="absolute -top-1 right-4 w-2 h-2 bg-accent rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

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

          {/* 카테고리 1: 뉴스 */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest ml-1">
              Main Dashboard
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[navLinks[0]].map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border-subtle/50 transition-all duration-500 ${
                      isOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }`}
                    style={{ transitionDelay: isOpen ? "100ms" : "0ms" }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-black tracking-tight truncate">
                        {link.name}
                      </span>
                      <span className="text-[10px] font-bold text-foreground/40 mt-0.5 truncate">
                        {link.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 카테고리 2: 실시간 지표 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
              <Activity className="w-3 h-3 text-accent/50" />
              <h3 className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest">
                실시간 지표가 궁금하다면?
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {navLinks.slice(1, 4).map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border-subtle/50 transition-all duration-500 ${
                      isOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }`}
                    style={{
                      transitionDelay: isOpen
                        ? `${(index + 2) * 100}ms`
                        : "0ms",
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-black tracking-tight truncate">
                        {link.name}
                      </span>
                      <span className="text-[10px] font-bold text-foreground/40 mt-0.5 truncate">
                        {link.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 카테고리 3: 시장 분석 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
              <Compass className="w-3 h-3 text-accent/50" />
              <h3 className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest">
                시장 상황이 궁금하다면?
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {navLinks.slice(4).map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border-subtle/50 transition-all duration-500 ${
                      isOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }`}
                    style={{
                      transitionDelay: isOpen
                        ? `${(index + 5) * 100}ms`
                        : "0ms",
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-black tracking-tight truncate">
                        {link.name}
                      </span>
                      <span className="text-[10px] font-bold text-foreground/40 mt-0.5 truncate">
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
