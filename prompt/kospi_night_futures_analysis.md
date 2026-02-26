# 코스피 야간선물 (KOSPI Night Futures) 분석 보고서

## 1. 개요

- **상세 명칭**: KOSPI 200 야간 지수 선물 (CME 연계 등)
- **주요 기능**: 한국 정규장 마감 후 야간 시간대의 지수 선물 가격 중계.

## 2. 데이터 흐름 (Data Flow)

- **Source**: Eurex/CME 선물 연계 데이터 (백엔드 스크래핑).
- **Backend Processor**: `backend/correlations/marketCorrelationTracker.py` 및 관련 트래커.
- **Frontend Component**: `frontend/app/components/kospi-futures/KospiNightFutures.tsx`

## 3. 업데이트 상세

- **수집 주기**: 평일 18:00 ~ 익일 05:00 (야간 개장 시간 동안 실시간 업데이트).
- **프론트엔드 로직**:
  - `frontend/app/lib/market-night-futures.ts` 라이브러리를 통해 Supabase DB의 최신 지수 정보를 읽어옴.
  - 전일 정규 지수 대비 등락 및 현재가 비교 기능 포함.
- **경로**: `/kospi-night-futures`

## 4. 특이사항

- **Sharing**: `KospiNightFuturesShareCard.tsx`를 통해 즉각적인 야간 시황을 이미지로 공유 가능하도록 지원.
- **데이터 구조**: 현재가, 대비(Point), 등락률(%), 고가, 저가 등 포함.
- **차트**: 차트 라이브러리 연동 시 `recharts`를 사용하여 야간 흐름 시각화.
