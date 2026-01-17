"use client";

import React, { useRef, useState, useEffect } from "react";
import { toPng, toBlob } from "html-to-image";
import {
  Download,
  Copy,
  Check,
  Share2,
  Quote,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";

interface ShareCardProps {
  title: string;
  category: string;
  summary: string;
  date: string;
  onClose: () => void;
}

export function ShareCard({
  title,
  category,
  summary,
  date,
  onClose,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [shareTheme, setShareTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // 모바일 기기이거나 공유 기능이 있으면 공유 버튼 활성화
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (
      isMobile ||
      (typeof navigator !== "undefined" &&
        typeof navigator.share === "function")
    ) {
      setCanShare(true);
    }
  }, []);

  const getBlob = async () => {
    if (!cardRef.current) return null;
    return await toBlob(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "rgba(0,0,0,0)",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        width: "320px",
        backgroundColor: shareTheme === "light" ? "#F8F7F4" : "#0f172a",
        borderRadius: "35px",
        boxShadow: "none",
      },
    });
  };

  const handleWebShare = async () => {
    if (typeof navigator.share !== "function") {
      alert(
        "현재 브라우저 환경에서는 바로 공유 기능을 사용할 수 없습니다. '이미지 저장'을 이용해 주세요!"
      );
      return;
    }

    const blob = await getBlob();
    if (!blob) return;

    const file = new File([blob], "hangon-news.png", { type: "image/png" });

    try {
      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `[Hang on!] ${title}`,
          text: summary,
        });
      } else if (typeof navigator.share === "function") {
        // 파일 공유 비지원 시 텍스트만이라도 공유
        await navigator.share({
          title: `[Hang on!] ${title}`,
          text: `${title}\n\n${summary}`,
          url: window.location.href,
        });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("공유 실패:", err);
      }
    }
  };

  const handleCopyImage = async () => {
    const blob = await getBlob();
    if (!blob) return;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setIsImageCopied(true);
      setTimeout(() => setIsImageCopied(false), 2000);
    } catch (err) {
      console.error("이미지 복사 실패:", err);
      alert(
        "이미지 복사를 지원하지 않는 브라우저입니다. 이미지 저장 기능을 이용해주세요."
      );
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "rgba(0,0,0,0)",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          width: "320px",
          backgroundColor: shareTheme === "light" ? "#F8F7F4" : "#0f172a",
          borderRadius: "35px",
          boxShadow: "none",
        },
      });

      const link = document.createElement("a");
      link.download = `hangon-news-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("이미지 생성 실패:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = () => {
    const text = `[Hang on!] 오늘의 뉴스 요약\n\n제목: ${title}\n\n${summary}\n\n#HangOn #뉴스요약 #경제뉴스`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-muted/20">
          <div className="pl-2">
            <h3 className="font-black text-base">소식 공유하기</h3>
            <p className="text-[10px] text-text-muted font-medium">
              인스타, 카톡 등에 예쁘게 공유해보세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors mr-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-4 py-6 bg-black/5 dark:bg-white/5 overflow-y-auto max-h-[60vh] flex flex-col items-center justify-center min-h-[450px]">
          <div className="flex-shrink-0 scale-[0.75] xs:scale-[0.85] sm:scale-[0.9] origin-center transition-all duration-300">
            {/* 이미지로 렌더링될 영역: 더 세련된 카드 디자인 */}
            <div
              ref={cardRef}
              className={`w-[340px] pt-8 px-8 pb-10 rounded-[35px] shadow-2xl relative overflow-hidden flex flex-col gap-6 border transition-colors duration-300 ${
                shareTheme === "light"
                  ? "bg-[#F8F7F4] text-slate-900 border-slate-100"
                  : "bg-[#0f172a] text-slate-100 border-slate-800"
              }`}
              style={{
                fontFamily: "var(--font-sans)",
                borderRadius: "35px",
              }}
            >
              {/* 세련된 배경 패턴 */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/[0.03] rounded-full -mr-24 -mt-24 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/[0.04] rounded-full -ml-20 -mb-20 blur-2xl" />

              <div className="flex items-center justify-between relative z-10 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-6 bg-accent rounded-full" />
                  <span
                    className={`text-[11px] font-black tracking-[0.2em] uppercase transition-colors ${
                      shareTheme === "light"
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    {category} BRIEF
                  </span>
                </div>
                <span
                  className={`text-[11px] font-bold font-mono tracking-tighter transition-colors ${
                    shareTheme === "light" ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {new Date(date)
                    .toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                    .replace(/\. /g, ".")
                    .replace(/\.$/, "")}
                </span>
              </div>

              <div className="relative z-10 flex flex-col gap-6">
                <h2
                  className={`text-2xl font-black leading-[1.3] tracking-tight break-keep transition-colors ${
                    shareTheme === "light" ? "text-slate-800" : "text-slate-100"
                  }`}
                >
                  {title}
                </h2>

                <div className="space-y-4">
                  {summary
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((line, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0" />
                        <p
                          className={`text-[15px] leading-relaxed font-semibold break-keep transition-colors ${
                            shareTheme === "light"
                              ? "text-slate-600"
                              : "text-slate-300"
                          }`}
                        >
                          {line.replace(/^[•-]\s*/, "")}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              <div
                className={`mt-0 pt-0 border-t flex items-end justify-between relative z-10 py-4 transition-colors ${
                  shareTheme === "light"
                    ? "border-slate-100"
                    : "border-slate-800"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${
                      shareTheme === "light"
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    Economic Insight
                  </span>
                  <span className="text-lg font-black text-accent tracking-tighter italic">
                    HANG ON!
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[8px] font-bold uppercase tracking-tight transition-colors ${
                      shareTheme === "light"
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    더 많은 정보는?
                  </span>
                  <span
                    className={`text-[10px] font-bold font-mono tracking-tighter transition-colors ${
                      shareTheme === "light"
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    www.hangon.co.kr
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border-t border-border-subtle flex flex-col gap-4">
          <div className="flex bg-muted/50 p-1 rounded-2xl w-full">
            <button
              onClick={() => setShareTheme("light")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                shareTheme === "light"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              라이트 모드
            </button>
            <button
              onClick={() => setShareTheme("dark")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                shareTheme === "dark"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              다크 모드
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {canShare ? (
              <button
                onClick={handleWebShare}
                className="col-span-2 flex items-center justify-center gap-2 py-4 bg-accent text-white hover:bg-accent/90 rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-lg shadow-accent/20"
              >
                <Share2 className="w-4 h-4" />
                공유하기
              </button>
            ) : (
              <button
                onClick={handleCopyImage}
                className="col-span-2 flex items-center justify-center gap-2 py-4 bg-accent text-white hover:bg-accent/90 rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-lg shadow-accent/20"
              >
                {isImageCopied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
                {isImageCopied ? "이미지 복사됨!" : "이미지 복사해서 붙여넣기"}
              </button>
            )}

            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 py-3.5 bg-muted hover:bg-muted/80 rounded-2xl font-bold text-[13px] transition-colors"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              텍스트 복사
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 py-3.5 bg-muted hover:bg-muted/80 rounded-2xl font-bold text-[13px] transition-all active:scale-95 disabled:opacity-50"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              이미지 저장
            </button>
          </div>

          <div className="flex items-center gap-2 justify-center py-1">
            <span className="text-[10px] text-text-muted">
              팁: 모바일에서는 <b>바로 공유하기</b>, PC에서는 <b>이미지 복사</b>
              가 가장 편합니다.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
