import { Providers } from "./providers";
import { InstallPWA } from "./components/InstallPWA";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hangon.co.kr"),
  title: {
    default: "Hang on! | 글로벌 경제 1분 요약",
    template: "%s | Hang on!", // 하위 페이지에서 제목을 동적으로 바꿀 때 사용
  },
  description:
    "매일 아침, 한국, 미국, 글로벌 핵심 경제 뉴스를 AI가 5줄로 요약해 드립니다. 바쁜 당신을 위한 데일리 경제 브리핑.",
  // 검색 엔진 로봇 설정
  robots: {
    index: true,
    follow: true,
  },

  // 소셜 미디어 공유 미리보기
  openGraph: {
    title: "Hang on! - 오늘의 경제를 붙잡다",
    description:
      "복잡한 경제 뉴스, 딱 1분만 투자하세요. KR/US/Global 핵심 요약.",
    siteName: "Hang on!",
    locale: "ko_KR",
    type: "website",
    // [수정] 새 도메인으로 변경
    url: "https://hangon.co.kr",
    images: [
      {
        url: "https://hangon.co.kr/og-image.png",
        width: 800,
        height: 420,
        alt: "Hang on! Dashboard Preview",
      },
    ],
  },

  // 트위터 미리보기 카드
  twitter: {
    card: "summary",
    title: "Hang on! , 글로벌 경제 1분 요약",
    description: "매일 아침 업데이트되는 AI 경제 요약 서비스",
    images: ["https://hangon.co.kr/og-image.png"],
  },

  // 기타 메타태그 (네이버 등 대응)
  other: {
    "naver-site-verification": "e8GFaticEEwsz1Dk9jxOUBF1MsiZJIW7vV9QQV5Rulo", // google verification과 별개라면
    image: "https://hangon.co.kr/og-image.png",
  },

  // 파비콘 및 아이콘 설정
  icons: {
    icon: "/favicon.ico",
  },

  // PWA 관련 설정
  manifest: "/manifest.json", // [중요] manifest 경로 명시 (기존 코드에 없었다면 추가)
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hang on!",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: "e8GFaticEEwsz1Dk9jxOUBF1MsiZJIW7vV9QQV5Rulo", // 기존 코드가 유효한지 확인 필요
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Hang on(행온)!",
      alternateName: ["행온", "Hangon"],
      url: "https://hangon.co.kr",
      image: "https://hangon.co.kr/og-image.png",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Hang on(행온)!",
      url: "https://hangon.co.kr",
      logo: "https://hangon.co.kr/og-image.png",
    },
  ];

  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
              });
            `,
          }}
        />
      </head>
      <meta
        name="google-site-verification"
        content="e8GFaticEEwsz1Dk9jxOUBF1MsiZJIW7vV9QQV5Rulo"
      />
      {/* {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />} */}
      <body className="font-sans antialiased text-[15px] tracking-tight">
        <Providers>
          {children}
          <InstallPWA />
        </Providers>
        <GoogleAnalytics gaId="G-GGHNG01WQ9" />
      </body>
    </html>
  );
}
