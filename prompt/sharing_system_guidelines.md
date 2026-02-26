# 공유 시스템 및 이미지 생성 표준

이 문서는 콘텐츠 공유 시 생성되는 리포트 이미지의 기본 형식과 시스템 구성 방식을 정의합니다.

## 1. 이미지 생성 기술 (Technology Stack)

- **Library**: `html-to-image` (또는 `dom-to-image`).
- **Format**: PNG, 3x High Resolution (Pixel Ratio 3) 권장.
- **Exporting Options**:
  - **이미지 다운로드**: `file-saver`를 통한 기기 저장.
  - **이미지 복사**: `navigator.clipboard.write` API 사용 (ClipboardItem 지원 확인).
  - **Web Share API**: 모바일 브라우저의 전용 공유 시트 호출 (`navigator.share`).

---

## 2. 공유 카드 디자인 형식 (Visual Guidelines)

### 기하학적 수치 (Geometry)

- **Base Width**: 330px
- **Base Height**: 500px (내용 길이에 따라 조정 가능하나 1:1.5 내외 권장).
- **Radius**: `rounded-[35px]`.

### 레이아웃 및 브랜딩 요소 (Branding)

- **상위 영역 (Header)**:
  - **왼쪽**: `hangon!` 서비스 로고 (텍스트 또는 로고 아이콘).
  - **오른쪽**: 현재 날짜 (예: `2024.12.01`).
- **중위 영역 (Main Content)**:
  - 주제 타이틀 (예: `환율 리포트`, `야간선물 속보`).
  - 주요 지표 (현재가, 변등률).
  - 시각화 자료 (미니 차트 `recharts` 또는 주요 키워드/이모지).
- **하위 영역 (Footer)**:
  - 서비스 도메인: `hangon.co.kr` (중앙 정렬 또는 우측 하단).

### 색상 및 테마 (Theming)

- **Dark Theme (Default)**: `#0f172a` (Slate-900).
- **Light Theme (Optional)**: `#F8F7F4` (Off-white).
- **글자 색상**: 주색상 배경에 대비되는 명확한 색상 (`text-white` or `text-slate-900`).

---

## 3. 구현 필수 체크리스트 (Implementation Checklist)

- [ ] **이미지 품질**: `pixelRatio: 3` 설정을 통해 고해상도 이미지 생성.
- [ ] **폰트 렌더링**: `CacheBust: true` 적용 및 폰트 깨짐 현상 방지.
- [ ] **배경 투명도**: `backgroundColor: "rgba(0,0,0,0)"` 또는 명시적 배경색 지정.
- [ ] **브랜딩 포함**: 서비스 로고(`hangon!`)와 도메인(`hangon.co.kr`)이 반드시 포함되었는가?
- [ ] **공유 성공 피드백**: 복사/다운로드 시 토스트 알림 또는 아이콘 변경 피드백 제공.
- [ ] **에러 핸들링**: Web Share 미지원 브라우저(데스크톱 등)의 경우 "복사"나 "다운로드" 버튼으로 대체 유도.

---

## 4. 파일 명명 규칙

- **공유 카드 컴포넌트**: `[ContentName]ShareCard.tsx` (예: `KospiNightFuturesShareCard.tsx`).
- **저장 파일명**: `hangon-[content]-[date].png`.
