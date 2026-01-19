"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import {
  Menu,
  X,
  TrendingUp,
  BarChart3,
  PieChart,
  Home,
  CloudSun,
  Compass,
} from "lucide-react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showMenuHint, setShowMenuHint] = useState(false);
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
    { name: "데일리 뉴스", href: "/", icon: Home },
    { name: "주식 기상예보", href: "/market-weather", icon: CloudSun },
    { name: "자금 흐름", href: "/money-flow", icon: Compass },
    { name: "공탐지수 분석", href: "/fear-greed", icon: PieChart },
    { name: "코스피 공탐지수", href: "/kospi-fear-greed", icon: BarChart3 },
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
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-accent/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter italic">
                Hang on<span className="text-accent">!</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-2xl border border-border-subtle/50">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        pathname === link.href
                          ? "bg-background text-accent shadow-sm"
                          : "text-text-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
              <div className="w-px h-6 bg-border-subtle/50" />
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-3">
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
        className={`fixed inset-0 ${scrolled ? "top-[52px]" : "top-[72px]"} z-[55] bg-background/95 backdrop-blur-xl md:hidden overflow-y-auto transition-all duration-500 ease-out ${
          isOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col p-6 space-y-6">
          {/* 메뉴 헤더 */}
          <div
            className={`transition-all duration-500 ${
              isOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
            style={{ transitionDelay: isOpen ? "0ms" : "0ms" }}
          >
            <h2 className="text-2xl font-black tracking-tight text-foreground mb-2">
              무엇이 궁금하신가요?🤔
            </h2>
            <div className="h-1 w-16 bg-accent rounded-full"></div>
          </div>

          {/* 메뉴 아이템 */}
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border-subtle/50 transition-all duration-500 hover:bg-secondary/50 hover:border-accent/30 ${
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                }`}
                style={{
                  transitionDelay: isOpen ? `${(index + 1) * 100}ms` : "0ms",
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-lg font-black tracking-tight">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
