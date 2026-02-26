# 컨텐츠별 분석 및 데이터 흐름

이 문서는 HangOn 프로젝트의 주요 컨텐츠들이 데이터를 어떻게 가져오고, 백엔드와 어떻게 상호작용하며, 어느 주기로 업데이트되는지에 대한 분석을 담고 있습니다.

## 1. 개요 (Data Architecture)

- **Data Source**: Yahoo Finance, Investing.com, 금융투자협회, CBOE, CNN 등
- **Backend**: Python 스크립트 기반 크롤러 및 데이터 가공 (APScheduler 또는 수동 실행)
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Next.js 14+ (App Router), ISR(Incremental Static Regeneration) 사용
- **Revalidation**: 백엔드 업데이트 완료 후 `api/revalidate` 호출을 통해 프론트엔드 캐시 갱신

---

## 2. 주요 컨텐츠 분석

### 💵 환율 브리핑 (Currency Desk)

- **데이터 소스**: Yahoo Finance (`USDKRW=X`)
- **수집 방식**: 백엔드(`currencyDesk.py`)에서 `yfinance` 라이브러리를 통해 수집 후 Gemini AI를 활용하여 시황 분석 생성.
- **업데이트 주기**: 매일 오전 07:00 ~ 08:00 (미국 정규 시장 마감 직후).
- **프론트엔드 로직**:
  - `getMarketData`를 통해 Supabase에 저장된 최근 데이터 및 AI 분석 리포트 호출.
  - 야후 API를 통해 현재가 실시간 반영.
- **경로**: `/currency-desk`

### 📊 달러 인덱스 (Dollar Index)

- **데이터 소스**: Yahoo Finance (`DX-Y.NYB`)
- **수집 방식**: 프론트엔드에서 `getMarketData`를 통해 직접 야후 API 호출 (Client-side 1분 간격).
- **업데이트 주기**: 실시간 (시장 운영 시간 내).
- **특이사항**: 백엔드 의존도 낮음, 프론트엔드 라이브 데이터 위주.
- **경로**: `/dollar-index`

### 🌙 코스피 야간선물 (KOSPI Night Futures)

- **데이터 소스**: Investing.com 또는 별도 증권사 API 스크래핑.
- **수집 방식**: 백엔드 트래커가 야간 개장 시간 동안 주기적으로 Supabase 업데이트.
- **업데이트 주기**: 한국 시간 18:00 ~ 익일 05:00 (평일).
- **프론트엔드 로직**: `market-night-futures.ts` 라이브러리를 통해 데이터 호출.
- **경로**: `/kospi-night-futures`

### 📅 데일리 업데이트 (Earnings & News)

- **수집 방식**:
  - **Earnings**: `earningsTracker.py`가 실적 발표 일정을 수집.
  - **News**: `dailyNews.py`가 주요 뉴스 속보를 수집하여 DB 저장 및 푸시 알림 전송.
- **업데이트 주기**: 뉴스(실시간 수시), 실적(매일/분기별).
- **경로**: `/earnings`, `/news/daily-report`

### 😱 공포와 탐욕 지수 (Fear & Greed / K-Fear & Greed)

- **데이터 소스**: CNN Business (Global), 자체 산출 (K-Fear & Greed).
- **수집 방식**: 백엔드(`fearAndGreed.py`, `K-FearAndGreed.py`)가 크롤링 및 계산 후 DB 저장.
- **업데이트 주기**: 매일 오전 06:00 ~ 09:00 사이.
- **경로**: `/fear-greed`, `/kospi-fear-greed`

### 📉 기타 지표 (신용잔고, PCR, 자금흐름 등)

- **신용잔고**: 금융투자협회 데이터 (매일 업데이트).
- **Put-Call Ratio**: CBOE API/CSV 데이터 (매일 업데이트).
- **Money Flow**: 투자자별 매매동향 데이터 스크래핑.

---

## 3. 백엔드-프론트엔드 상호작용 흐름

1. **[Backend]** Python 크롤러 실행 (데이터 수집 및 분석).
2. **[Backend]** Supabase DB 데이터 적재/갱신.
3. **[Backend]** `revalidate_path('/path')` 함수를 호출하여 프론트엔드(`/api/revalidate`)에 신호 전송.
4. **[Frontend]** API 엔드포인트에서 `revalidatePath` 실행하여 해당 정적 페이지 캐시 무효화.
5. **[Frontend]** 다음 사용자 접속 시 갱신된 DB 데이터를 반영한 새로운 정적 페이지 생성.
