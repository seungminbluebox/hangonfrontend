// app/privacy/page.tsx

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20 text-foreground">
      <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>

      <div className="space-y-6 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-2">
            1. 개인정보의 처리 목적
          </h2>
          <p>
            Hang on!(이하 '서비스')은(는) 다음의 목적을 위하여 개인정보를
            처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는
            이용되지 않습니다.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>서비스 제공 및 콘텐츠 이용</li>
            <li>접속 빈도 파악 및 서비스 이용 통계 (Google Analytics)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-2">
            2. 수집하는 개인정보의 항목
          </h2>
          <p>
            서비스는 회원가입 없이 이용 가능하며, 서비스 이용 과정에서 아래
            정보가 자동으로 생성되어 수집될 수 있습니다.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>IP 주소, 쿠키(Cookie), 접속 로그, 방문 일시, 브라우저 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-2">
            3. 쿠키(Cookie)의 운용 및 거부
          </h2>
          <p>
            이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 웹 브라우저
            상단의 도구 &gt; 인터넷 옵션 &gt; 개인정보 메뉴의 옵션 설정을 통해
            쿠키 저장을 거부할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-2">4. 문의처</h2>
          <p>
            서비스 이용과 관련된 문의사항은 아래 연락처로 접수해 주시기
            바랍니다.
          </p>
          <p className="mt-2 font-medium">이메일: boxmagic25@gmail.com</p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-border-subtle text-center">
        <a href="/" className="text-accent hover:underline font-bold">
          ← 홈으로 돌아가기
        </a>
      </div>
    </main>
  );
}
