import { Providers } from "./providers";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 실제 배포된 도메인 주소 입력 (매우 중요)
  metadataBase: new URL("https://hang-on.vercel.app"),

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

  // 소셜 미디어 공유 미리보기 (카톡, 페이스북 등)
  openGraph: {
    title: "Hang on! - 오늘의 경제를 붙잡다",
    description:
      "복잡한 경제 뉴스, 딱 1분만 투자하세요. KR/US/Global 핵심 요약.",
    siteName: "Hang on!",
    locale: "ko_KR",
    type: "website",
    // Vercel 배포 후 'public' 폴더에 og-image.png를 넣어두면 자동으로 잡힘
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hang on! Daily News",
      },
    ],
  },

  // 트위터 미리보기 카드
  twitter: {
    card: "summary_large_image",
    title: "Hang on! , 글로벌 경제 1분 요약",
    description: "매일 아침 업데이트되는 AI 경제 요약 서비스",
  },

  // 파비콘 및 아이콘 설정
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="font-sans antialiased text-[15px] tracking-tight">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
