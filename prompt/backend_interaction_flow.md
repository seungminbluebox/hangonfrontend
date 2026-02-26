# 백엔드 상호작용 및 데이터 갱신 아키텍처 (Backend Interaction Flow)

이 문서는 백엔드(Python)와 프론트엔드(Next.js) 간의 데이터 통신 및 자동 갱신 메커니즘을 설명합니다.

## 1. 아키텍처 다이어그램 (Concept)

```text
[Data Source] -> [Backend Tracker] -> [Supabase DB] -> [Revalidate Signal] -> [Frontend Cache] -> [User View]
     (1)               (2)               (3)               (4)                 (5)               (6)
```

## 2. 단계별 상세 설명

### (1) 데이터 소스 및 수집 (Data Source)

- **대상**: 야후 파이낸스, 인베스팅닷컴, 금융투자협회, 뉴스 포털 등.
- **도구**: `yfinance`, `BeautifulSoup`, `requests`, `selenium` (필요 시).

### (2) 백엔드 처리 (Backend Tracker)

- **위치**: `backend/` 디렉토리 내 각 모듈 (`currency/`, `fear-greed/`, `news/` 등).
- **역할**: 수집된 로우(Raw) 데이터를 정제하고, 필요한 경우 AI(Gemini)를 통해 분석 텍스트 생성.

### (3) 데이터 저장 (Supabase DB)

- **위치**: Supabase (PostgreSQL).
- **역할**: 정제된 데이터를 JSON 또는 테이블 형태로 저장하여 프론트엔드에서 즉시 쿼리할 수 있도록 함.

### (4) 리밸리데이션 신호 (Revalidate Signal)

- **위치**: `backend/revalidate.py`.
- **로직**: 데이터 업데이트 완료 후 프론트엔드의 `/api/revalidate` 엔드포인트에 `GET` 또는 `POST` 요청 전송.
- **보안**: `REVALIDATE_SECRET` 헤더를 포함하여 비인가 요청 차단.

### (5) 프론트엔드 캐시 무효화 (Frontend Cache)

- **위치**: `frontend/app/api/revalidate/route.ts`.
- **역할**: 전달받은 `path` 파라미터(예: `/currency-desk`)를 `revalidatePath()` 함수에 전달하여 Next.js의 정적 캐시 무효화.

### (6) 사용자 뷰 (User View)

- **역할**: 다음 사용자 접속 시 최신 데이터가 반영된 새로운 정적 페이지가 생성(ISR)되어 고속 제공됨.

---

## 3. 개발 시 준수 사항 (Developer Guidelines)

- **새로운 트래커 작성 시**: 반드시 마지막에 `revalidate_path` 함수를 호출하여 프론트엔드에 업데이트를 알리십시오.
- **API 응답 형식**: 프론트엔드에서 `getMarketData` 등을 통해 쉽게 파싱할 수 있도록 DB 컬럼명과 타입을 일관되게 유지하십시오.
- **에러 핸들링**: 백엔드에서 데이터 수집 실패 시 DB를 갱신하지 않고 기존 데이터를 유지하거나, 에러 플래그를 심어 프론트엔드에서 대응하게 하십시오.

---

## 4. 백엔드 주요 환경 변수 (.env)

- `SUPABASE_URL`: DB 주소
- `SUPABASE_KEY`: DB 접근 키 (Service Role 권장)
- `REVALIDATE_SECRET`: 프론트엔드 통신용 비밀 토큰
- `GEMINI_API_KEY`: AI 분석용 키
- `FRONTEND_URL`: 프론트엔드 주소 (Vercel 정식 주소)
