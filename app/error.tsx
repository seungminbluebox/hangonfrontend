"use client";

import { useEffect } from "react";
import { RefreshCcw, AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러를 모니터링 서비스에 로깅할 수 있습니다.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-500/10 p-4 rounded-full mb-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
        서비스 이용에 불편을 드려 죄송합니다
      </h1>

      <p className="text-text-muted text-lg mb-10 max-w-md">
        일시적인 오류가 발생했습니다.
        <br />
        아래 버튼을 눌러 다시 시도해 주세요.
        <br />
        <span className="text-sm opacity-50 mt-2 block">
          에러 코드: {error.digest || "알 수 없는 오류"}
        </span>
      </p>

      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
      >
        <RefreshCcw className="w-4 h-4" />
        다시 시도하기
      </button>
    </div>
  );
}
