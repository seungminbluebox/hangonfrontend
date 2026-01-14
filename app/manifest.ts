import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hang on! | 경제 1분 요약",
    short_name: "Hang on!",
    description: "매일 아침, 글로벌 경제 흐름을 꽉 잡다",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfcfc",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
