# 달러 인덱스 (Dollar Index) 분석 보고서

## 1. 개요

- **상세 명칭**: 글로벌 달러 인덱스 (DXY)
- **주요 기능**: 주요 6개 통화 대비 달러의 가치 변화율을 실시간으로 추적.

## 2. 데이터 흐름 (Data Flow)

- **Source**: Yahoo Finance (`DX-Y.NYB`)
- **Backend Processor**: 프론트엔드 직접 호출 위주 (최근 1일분 시계열 데이터).
- **Frontend Component**: `frontend/app/components/dollar-index/DollarIndex.tsx`

## 3. 업데이트 상세

- **수집 주기**: 실시간 (시장 운영 시간 내).
- **프론트엔드 로직**:
  - `frontend/app/lib/market.ts`의 `fetchFromYahoo` 함수를 사용하여 1분 간격으로 최신 시세 갱신.
  - Next.js의 `fetch` 라이브러리 `revalidate: 60` 옵션 활용.
- **경로**: `/dollar-index`

## 4. 특이사항

- **차트**: `recharts`를 사용하여 1분 단위의 캔들 또는 선 차트 구성.
- **상호작용**: 사용자가 보고 있는 시간대에 따라 즉각적인 가격 변동이 반영됨.
- **유의사항**: 백엔드에서의 DB 저장 주기가 짧지 않으므로 실시간성이 필요한 경우 프론트엔드에서의 직접 호출 방식을 유지할 것.
