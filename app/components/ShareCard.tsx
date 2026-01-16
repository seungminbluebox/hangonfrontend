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
  onClose: () => void;
}

export function ShareCard({
  title,
  category,
  summary,
  onClose,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

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
      backgroundColor: "#ffffff",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        width: "400px",
        height: "auto",
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
          title: `[한곳] ${title}`,
          text: summary,
        });
      } else if (typeof navigator.share === "function") {
        // 파일 공유 비지원 시 텍스트만이라도 공유
        await navigator.share({
          title: `[한곳] ${title}`,
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
        backgroundColor: "#ffffff",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          width: "400px",
          height: "auto",
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
    const text = `[한곳] 오늘의 뉴스 요약\n\n제목: ${title}\n\n${summary}\n\n#한곳 #뉴스요약 #경제뉴스`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-muted/20">
          <div>
            <h3 className="font-black text-lg">소식 공유하기</h3>
            <p className="text-[11px] text-text-muted font-medium">
              인스타, 카톡 등에 예쁘게 공유해보세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
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

        <div className="p-8 bg-black/5 dark:bg-white/5 overflow-y-auto max-h-[60vh] flex flex-col items-center">
          {/* 이미지로 렌더링될 영역: 더 세련된 카드 디자인 */}
          <div
            ref={cardRef}
            className="w-[360px] bg-white text-slate-900 p-10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col gap-8 border border-slate-100"
            style={{ fontFamily: "var(--font-sans)", color: "#0f172a" }}
          >
            {/* 세련된 배경 패턴 */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/[0.03] rounded-full -mr-24 -mt-24 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/[0.04] rounded-full -ml-20 -mb-20 blur-2xl" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-accent rounded-full" />
                <span className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase">
                  {category} BRIEF
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-300 font-mono tracking-tighter">
                {new Date()
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
              <h2 className="text-2xl font-black leading-[1.3] tracking-tight break-keep text-slate-800">
                {title}
              </h2>

              <div className="space-y-4">
                {summary
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0" />
                      <p className="text-[15px] leading-relaxed text-slate-600 font-semibold break-keep">
                        {line.replace(/^[•-]\s*/, "")}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="mt-6 pt-8 border-t border-slate-100 flex items-center justify-between relative z-10">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  Global Insight
                </span>
                <span className="text-lg font-black text-accent tracking-tighter italic">
                  HANGON
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center">
                  <span className="text-[8px] font-black text-slate-300 tracking-tighter">
                    QR
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[10px] text-text-muted font-medium">
            카드는 1:1 비율로 인스타그램 스토리에 최적화되어 있습니다.
          </p>
        </div>

        <div className="p-6 bg-card border-t border-border-subtle flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {canShare ? (
              <button
                onClick={handleWebShare}
                className="col-span-2 flex items-center justify-center gap-2 py-4 bg-accent text-white hover:bg-accent/90 rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-lg shadow-accent/20"
              >
                <Share2 className="w-4 h-4" />
                카톡 / 인스타 / 네이버 공유하기
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
