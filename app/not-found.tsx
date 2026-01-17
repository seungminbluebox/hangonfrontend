import Link from "next/link";
import { MoveLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-accent/10 p-4 rounded-full mb-6">
        <HelpCircle className="w-12 h-12 text-accent" />
      </div>

      <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4">
        길을 잃으셨나요?
      </h1>

      <p className="text-text-muted text-lg mb-10 max-w-md">
        요청하신 페이지를 찾을 수 없습니다.
        <br />
        주소가 정확한지 확인하시거나,
        <br />
        아래 버튼을 통해 홈으로 돌아가실 수 있습니다.
      </p>

      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
      >
        <MoveLeft className="w-4 h-4" />
        홈으로 돌아가기
      </Link>

      <div className="mt-20 text-sm text-text-muted/50 font-serif italic">
        Hang on! - 글로벌 경제 요약 서비스
      </div>
    </div>
  );
}
