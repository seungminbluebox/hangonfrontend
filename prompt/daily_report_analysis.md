# 데일리 업데이트 및 속보 (Daily Report & News) 분석 보고서

## 1. 개요

- **상세 명칭**: 데일리 업데이트 (Daily Report), 뉴스 속보 (Live News)
- **주요 기능**: 주요 시황 소식 브리핑, 기업 실적 발표 일정 관리, 금융 뉴스 데이터 제공.

## 2. 데이터 흐름 (Data Flow)

- **Source**: NAVER News, Yahoo Finance, Investing.com (백엔드 스크래핑).
- **Backend Processor**: `backend/news/dailyNews.py`, `backend/earnings/earningsTracker.py`.
- **Database**: Supabase `news_data`, `earnings_data` 테이블.
- **Frontend Component**: `frontend/app/components/news/BreakingNews.tsx`, `frontend/app/components/earnings/EarningsList.tsx`.

## 3. 업데이트 상세

- **수집 주기**:
  - **뉴스 속보**: 실시간 수시 수합 (중앙 서버에서 5~10분 간격으로 수집).
  - **데일리 리포트**: 매일 오전 주요 시황 정리 업데이트.
  - **실적 발표**: 기업 공시 일정 기준 (매주/매월 정기 업데이트).
- **알림 기능**: `backend/news/push_notification.py`를 연동하여 중요 소식 발생 시 FCM/Web Push 알림 자동 발송.

## 4. 프론트엔드 연동 방식

- **Initial Load**: `/live`, `/news/daily-report`, `/earnings` 페이지 호출 시 Supabase로부터 최신 데이터 정렬하여 표시.
- **Dynamic Content**: 새로운 뉴스가 있을 경우 클라이언트에서 실시간 반영 (또는 Revalidation).
- **Sharing**: `BreakingNewsShareCard.tsx`를 사용하여 특정 뉴스나 실적 정보를 개별 이미지로 공유 가능.

## 5. 특이사항

- **Categorization**: 뉴스 카테고리(정치, 경제, 사회) 자동 분류 지원 (AI 또는 키워드 기반).
- **Filtering**: 중복 뉴스 필터링 및 유사 내용 그룹화 로직 포함.
- **Search**: 제목 및 본문 검색 기능 제공.
