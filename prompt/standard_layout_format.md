# 표준 레이아웃 및 디자인 가이드

이 문서는 HangOn 프로젝트의 모든 신규 컨텐츠 및 페이지 개발 시 일관성을 유지하기 위한 레이아웃 및 디자인 품질 표준을 정의합니다.

## 1. 기본 페이지 구조 (Page Structure)

모든 페이지는 `frontend/app/[content]/page.tsx` 형식으로 구성되며, 다음과 같은 레이아웃 요소를 포함해야 합니다.

### Header & Navigation

- **`Navigation`**: 상단 네비게이션바 (고정 또는 스크롤 제어).
- **`BackButton`**: 'Back to Dashboard' 버튼.
  - **위치**: 페이지 좌측 상단 (컨텐츠 영역의 시작점).
  - **기능**: 서비스 메인(`/`) 또는 이전 대시보드로 이동.
- **날짜 정보**: `Clock` 아이콘과 함께 업데이트 일시/주기 표시 (헤더 우측 상단).

### Main Content Area

- **Container**: `max-w-6xl mx-auto px-4 sm:px-8` (반응형 여백 준수).
- **Title**: 컨텐츠의 제목 (`text-3xl font-bold` 등).
- **Description**: 검색 엔진 최적화(SEO)를 위한 메타데이터 및 설명 텍스트.

### Information Badges

- **상태 배지**: '실시간', '업데이트 완료', '시장 대기' 등.
- **업데이트 문구**: `미국 정규시장 마감 이후 업데이트 (약 오전 7~8시)`와 같은 명확한 안내 필수.

---

## 2. 공통 UI 요소 (Common UI Elements)

### 글꼴 및 텍스트 스타일

- **Heading**: `font-bold tracking-tight`.
- **Body**: `leading-relaxed text-text-muted/80`.
- **Numbers**: `font-mono` 또는 `tabular-nums` (숫자 정렬을 위해 권장).
- **Accent Color**: 상승 시 `text-red-500`, 하락 시 `text-blue-500`.

### 카드 디자인 (Card Design)

- **Radius**: `rounded-2xl` 또는 `rounded-3xl` (둥근 모서리 일관성).
- **Border**: `border border-secondary/10`.
- **Shadow**: `shadow-sm` 또는 `hover:shadow-md transition-all`.

### 버튼 및 상호작용

- **공유 버튼 (`Share2`)**: 우측 상단 또는 하단 플로팅 위치.
- **정보 아이콘 (`Info`)**: 복잡한 지표의 경우 툴팁이나 설명 텍스트 제공.

---

## 3. SEO 및 메타데이터 준수

- **Metadata**: 모든 `page.tsx` 파일 최상단에 `export const metadata: Metadata` 정의.
- **JSON-LD**: Breadcrumb 및 Dataset 구조화 데이터 포함.
- **Og-Image**: 공유 시 컨텐츠별 요약 이미지가 나타나도록 설계.

---

## 4. 반응형 대응 (Responsive Design)

- **Mobile**: 모바일 기기에서의 터치 편의성 고려 (최소 버튼 크기 44px).
- **Desktop**: 대형 화면에서의 가독성을 위한 최대 너비(Max-width) 제한.
- **Typography**: 화면 크기에 따른 가변 폰트 사이즈(`text-sm md:text-base`) 적용.

---

## 5. 텍스트 형식 가이드

- **존댓말 준수**: 사용자 안내 텍스트는 `~해요`, `~입니다`와 같은 친근한 구어체 존댓말을 사용합니다.
- **이모지 활용**: 각 단락이나 중요 포인트 시작 시 관련 이모지(📈, 💹, 🔔 등) 한 개를 배치하여 가독성을 높입니다.
- **특수문자 제한**: 강조를 위해 `**`와 같은 마크다운 기호를 남발하지 않고 디자인 요소(배지, 색상)로 대체합니다.
