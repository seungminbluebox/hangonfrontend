# 유지보수 및 컨텐츠 확장 가이드

이 문서는 HangOn 프로젝트의 안정적인 운영과 새로운 기능 확장을 위한 엔지니어링 지침 및 체크리스트를 제공합니다.

---

## 1. 신규 컨텐츠 추가 프로세스 (Extension Process)

새로운 금융/경제 테마 데이터를 추가할 때 다음 단계를 준수하십시오.

### Step 1: 백엔드 데이터 수집 (Backend)

- [ ] `backend/[category]` 폴더 생성 및 Python 스크립트 작성.
- [ ] `yfinance`, `requests` 등을 사용하여 데이터 수집.
- [ ] Supabase Client를 통한 DB 저장 로직 구현.
- [ ] `.env` 파일에 필요한 API 키(Gemini, AlphaVantage 등) 추가.

### Step 2: 프론트엔드 연동 (Frontend)

- [ ] `frontend/app/[new-content]/page.tsx` 생성.
- [ ] `frontend/app/lib/market.ts`에 새로운 지표 심볼 정의.
- [ ] `frontend/app/components/[category]`에 개별 컴포넌트(UI, ShareCard) 구현.

### Step 3: 데이터 갱신 자동화 (Automation)

- [ ] 백엔드 스크립트 끝에 `revalidate_path('/new-content')` 호출 추가.
- [ ] GitHub Actions 또는 서버 스케줄러(Cron)에 스크립트 등록.

---

## 2. 유지보수 핵심 고려 사항 (Maintenance Checklist)

### API 및 라이브러리 보안

- **환경 변수 관리**: 브라우저에 노출되면 안 되는 API 키는 `NEXT_PUBLIC_` 접두사를 붙이지 말고 서버 컴포넌트에서만 사용하십시오.
- **백엔드 보안**: `revalidate` API 호출 시 반드시 `REVALIDATE_SECRET` 토큰을 검증해야 합니다.

### 데이터 무결성 및 에러 처리

- **Null Safety**: API 응답 지연이나 데이터 누락 시 화면이 깨지지 않도록 기본값(Default value) 또는 로딩 상태(Skeleton UI)를 철저히 구현하십시오.
- **Error Boundaries**: Next.js의 `error.tsx`를 활용하여 개별 페이지 오류가 전체 서비스 중단으로 이어지지 않게 하십시오.

---

## 3. 추가 유지보수 확장 주제 (Recommended Topics)

### 📈 SEO 및 검색 엔진 최적화 (SEO Automation)

- **Sitemap**: `/sitemap.ts`에 신규 경로 자동 추가 로직 확인.
- **Robots**: `/robots.ts` 설정 준수.
- **Metadata**: 컨텐츠가 업데이트될 때마다 `generateMetadata`를 사용하여 동적 메타데이터(타이틀, 설명)를 생성하십시오.

### 🔔 알림 시스템 (Notification System)

- **Push Notifications**: `backend/news/push_notification.py`를 활용하여 주요 지표 변동 시 사용자에게 즉각적인 알림을 보낼 수 있는 로직을 유지하십시오.
- **PWA**: `public/sw.js` 및 `manifest.json`를 통해 앱처럼 설치 가능한 사용자 경험을 제공하십시오.

### 🧪 성능 최적화 (Performance)

- **Image Optimization**: `next/image`를 사용하여 이미지 리소스를 최적화하십시오.
- **Bundle Size**: 불필요한 클라이언트 사이드 라이브러리 사용을 자제하고 서버 사이드 렌더링(SSR) 비중을 높이십시오.
- **Intl Formatters**: `Intl.DateTimeFormat`, `Intl.NumberFormat`을 미리 인스턴스화하여 렌더링 성능을 높이십시오 (`market.ts` 참조).

### 🛠 모니터링 및 로깅 (Monitoring)

- **Vercel Analytics**: 실제 사용자 유입 및 페이지 성능 모니터링.
- **Supabase Logs**: 데이터베이스 쿼리 성능 및 크롤링 실패 로그 확인.
- **Discord/Slack Webhook**: 백엔드 오류 발생 시 알림을 받을 수 있는 웹훅 연동 권장.
