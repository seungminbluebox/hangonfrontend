# 환율 브리핑 (Currency Desk) 분석 보고서

## 1. 개요

- **상세 명칭**: 원/달러 환율 리포트 (Currency Desk)
- **주요 기능**: 실시간 환율 정보 제공, AI 기반 시장 흐름 분석 및 투자 전략 제안.

## 2. 데이터 흐름 (Data Flow)

- **Source**: Yahoo Finance (`USDKRW=X`)
- **Backend Processor**: `backend/currency/currencyDesk.py`
- **Database**: Supabase (`currency_data` 등 관련 테이블)
- **Frontend Component**: `frontend/app/components/currency/CurrencyDesk.tsx`

## 3. 업데이트 상세

- **수집 주기**: 매일 오전 07:00 ~ 08:00 (미국 뉴욕 증시 마감 직후).
- **AI 분석**: Google Gemini 모델을 사용하여 최근 14일간의 트렌드와 전일 대비 변동폭을 분석, 인간적인 어조로 시황 중계 생성.
- **브로드캐스트**: 데이터 갱신 후 `revalidatePath('/currency-desk')`를 통해 정적 페이지 즉시 업데이트.

## 4. 프론트엔드 연동 방식

- **Initial Load**: 서버 사이드에서 `getMarketData(['원/달러 환율'], true)` 호출하여 기본 데이터 및 AI 리포트 로드.
- **Real-time**: 클라이언트 사이드에서 야후 API를 1분 간격으로 호출하여 실시간 시세 반영.
- **Sharing**: `html-to-image` 기반의 고해상도 리포트 카드 생성 지원.
