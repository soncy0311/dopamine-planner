# MAIN-PRD: `디자인 시스템 프로토타입`

# `디자인 시스템 프로토타입` (`design-prototype`) - MAIN PRD

## 프로젝트 정보

- **프로젝트명**: `디자인 시스템 프로토타입` `design-prototype`
- **카테고리**: 디자인 시스템 시각 검증 / 프론트엔드 프로토타이핑
- **상태**: Draft
- **시작일**: 2026-05-01
- **완료일**: 2026-05-01
- **최신 업데이트**: 2026-05-01

## 개발 목적

Dopamine Planner 서비스의 디자인 시스템(컬러 팔레트, 타이포그래피, 토큰, 컴포넌트, 아이콘)과 전체 페이지 레이아웃을 **독립 HTML 파일**로 구현하여, 실제 개발 전에 시각적으로 검증한다.

**왜 프로토타입이 필요한가:**

1. 디자인 토큰(Primitive → Semantic → Component)이 실제 UI에 적용됐을 때의 시각적 결과를 확인한다
2. Atomic Design 기반 컴포넌트(Atom → Molecule → Organism)의 조합이 의도대로 동작하는지 검증한다
3. 7개 전체 페이지의 레이아웃과 흐름을 구현 전에 확정한다
4. 컬러 팔레트(Purple, Periwinkle, Neutral)의 60-30-10 배분이 실제 화면에서 적절한지 확인한다

## 핵심 기능 요구사항

### 1. 디자인 토큰 시각화

| 섹션 | 표시 항목 | 상세 |
|------|----------|------|
| **컬러 팔레트** | Primitive Colors | Purple 5단계, Periwinkle 5단계, Neutral 5단계, Status 4색 |
| **시맨틱 컬러** | Semantic Tokens | Text(4종), Background(5종), Interactive(7종), Border(3종), Status(4종) |
| **컴포넌트 컬러** | Component Tokens | Button, TabBar, TodoItem, Badge, FAB, Section 토큰 |
| **타이포그래피** | Type Scale | xs(11px)~2xl(24px) 6단계, Weight 4단계, Pretendard + JetBrains Mono |
| **간격** | Spacing Scale | 4px 기반 7단계(spacing-1~8), Border Radius 4단계 |
| **모션** | Duration + Easing | fast(100ms), normal(200ms), slow(300ms) + 3종 easing 시각화 |

### 2. 아이콘 시스템 시각화

Lucide Icons 기반 10개 핵심 아이콘을 24px 기본 크기로 표시한다.

| 아이콘 | 용도 |
|--------|------|
| `Check` | 투두 완료 |
| `Plus` | 투두/항목 추가 (FAB) |
| `ChevronLeft` / `ChevronRight` | 날짜 네비게이션 |
| `Home` | Life 탭 |
| `Briefcase` | Work 탭 |
| `Settings` | 설정 탭 |
| `Trash2` | 삭제 |
| `Edit3` | 수정 |
| `AlertTriangle` | 우선순위 High |

### 3. 컴포넌트 라이브러리 시각화

Atomic Design 계층별로 모든 컴포넌트의 상태(state)와 변형(variant)을 표시한다.

#### 3.1 Atoms

| 컴포넌트 | 표시할 상태/변형 |
|---------|----------------|
| **Button** | primary, secondary, ghost, destructive × default/hover/active/disabled |
| **Checkbox** | unchecked, checked, disabled |
| **Icon** | 24px 기본, 크기 변형(16/20/24px) |
| **Badge** | category, priority(High/Medium/Low), carry-over |
| **Divider** | horizontal, 색상 변형 |
| **Avatar** | sm(32px), md(40px), 이미지/이니셜 |

#### 3.2 Molecules

| 컴포넌트 | 표시할 상태/변형 |
|---------|----------------|
| **TodoItem** | 미완료, 완료(strikethrough), 우선순위별, 이월 표시 |
| **SectionHeader** | "완료" 섹션, "진행 중" 섹션 (아이콘 + 제목 + 개수) |
| **DateNavigator** | 오늘 날짜 표시, 좌우 화살표 |
| **TabBarItem** | 활성, 비활성 상태 (아이콘 + 라벨) |
| **FormField** | 기본, 에러, 비활성 상태 (라벨 + 입력 + 도움말) |

#### 3.3 Organisms

| 컴포넌트 | 표시할 구성 |
|---------|------------|
| **TodoSection** | SectionHeader + TodoItem[] 조합 (완료/진행 중) |
| **BottomTabBar** | 3탭(Life/Work/Settings) 고정 하단, 56px + Safe Area |
| **TodoCreateSheet** | 바텀 시트 폼 (제목, 설명, 우선순위, 분류/Epic 선택) |
| **CategoryList** | 분류 목록 (컬러 + 이름 + 정렬) |
| **EpicCard** | 진행률 바 + 제목 + Sub Issue 개수 |

### 4. 페이지 프로토타입

7개 전체 화면의 레이아웃을 모바일 뷰포트(430px) 기준으로 구현한다.

#### 4.1 로그인 페이지

```
┌──────────────────────────────┐
│                              │
│         [Logo Area]          │
│       Dopamine Planner 서비스        │
│                              │
│    ┌──────────────────────┐  │
│    │  🔵 Google로 로그인    │  │
│    └──────────────────────┘  │
│    ┌──────────────────────┐  │
│    │  🟡 Kakao로 로그인     │  │
│    └──────────────────────┘  │
│                              │
└──────────────────────────────┘
```

- AuthLayout 템플릿 적용
- 소셜 로그인 버튼 2종 (Google, Kakao)
- 로고 + 서비스 명칭 중앙 배치

#### 4.2 메인 페이지 — 오늘의 투두

```
┌──────────────────────────────┐
│  ◀  2026년 5월 1일 (목)  ▶   │  ← DateNavigator
├──────────────────────────────┤
│                              │
│  ── ✅ 완료 (2) ───────────  │  ← SectionHeader (Done)
│  ☑ 아침 운동          건강   │  ← TodoItem (completed)
│  ☑ 코드 리뷰     프로젝트A   │
│                              │
│  ── 📋 진행 중 (3) ────────  │  ← SectionHeader (In Progress)
│  ☐ API 설계       프로젝트A  │  ← TodoItem (active)
│  ☐ 장보기             생활   │
│  ☐ 책 읽기  🔄2    자기개발  │  ← 이월 표시
│                              │
│                        [＋]  │  ← FAB
├──────────────────────────────┤
│  [Life]    [Work]    [설정]  │  ← BottomTabBar
└──────────────────────────────┘
```

- MainLayout 템플릿 적용
- Life / Work 워크스페이스 분리 표시
- 완료/진행 중 섹션 구분
- 우선순위 뱃지, 카테고리 뱃지, 이월 카운트 표시

#### 4.3 날짜 탐색 페이지

- DateNavigator의 좌우 화살표로 날짜 전환
- 과거/미래 날짜의 투두 목록 표시
- 메인 페이지와 동일한 레이아웃, 날짜만 변경

#### 4.4 투두 생성/수정 페이지

```
┌──────────────────────────────┐
│  ─── 새 투두 ────────── [✕]  │  ← TodoCreateSheet 헤더
├──────────────────────────────┤
│                              │
│  제목 *                      │
│  ┌──────────────────────────┐│
│  │                          ││  ← FormField
│  └──────────────────────────┘│
│                              │
│  설명                        │
│  ┌──────────────────────────┐│
│  │                          ││  ← FormField (textarea)
│  └──────────────────────────┘│
│                              │
│  우선순위                    │
│  [High] [Medium] [Low]       │  ← Badge 선택
│                              │
│  분류                        │
│  [건강 ▾]                    │  ← Select (Category)
│                              │
│  Epic                        │
│  [3월 운동 루틴 ▾]           │  ← Select (Epic)
│                              │
│  날짜                        │
│  [2026-05-01 ▾]              │  ← DatePicker
│                              │
│  ┌──────────────────────────┐│
│  │        저장하기            ││  ← Button (primary)
│  └──────────────────────────┘│
└──────────────────────────────┘
```

- TodoCreateSheet 바텀 시트 형태
- 필수/선택 필드 구분
- 우선순위 선택 UI

#### 4.5 분류 관리 페이지

```
┌──────────────────────────────┐
│  ◀ 분류 관리            [＋] │  ← ManageLayout 헤더
├──────────────────────────────┤
│                              │
│  🟣 건강                 [⋮] │  ← CategoryList Item
│  🔵 자기개발             [⋮] │
│  🟢 생활                 [⋮] │
│                              │
├──────────────────────────────┤
│  [Life]    [Work]    [설정]  │  ← BottomTabBar
└──────────────────────────────┘
```

- ManageLayout 템플릿 적용
- CategoryList 컴포넌트 활용
- 컬러 인디케이터 + 이름 + 액션 메뉴

#### 4.6 Epic 관리 페이지

```
┌──────────────────────────────┐
│  ◀ Epic 관리 (건강)     [＋] │  ← ManageLayout 헤더
├──────────────────────────────┤
│                              │
│  ┌──────────────────────────┐│
│  │ 3월 운동 루틴            ││  ← EpicCard
│  │ ████████░░  80% (4/5)    ││  ← 진행률 바
│  │ active                   ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ 독서 챌린지              ││
│  │ ███░░░░░░░  30% (3/10)   ││
│  │ active                   ││
│  └──────────────────────────┘│
│                              │
├──────────────────────────────┤
│  [Life]    [Work]    [설정]  │
└──────────────────────────────┘
```

- EpicCard 컴포넌트 활용
- 진행률 바 시각화
- Sub Issue 완료 비율 표시

#### 4.7 설정 페이지

```
┌──────────────────────────────┐
│  설정                        │
├──────────────────────────────┤
│                              │
│  ┌──────────────────────────┐│
│  │ 👤 홍길동                ││  ← Avatar + 이름
│  │    hong@email.com        ││
│  │    Google 연동           ││
│  └──────────────────────────┘│
│                              │
│  ─── 계정 ─────────────────  │
│  소셜 계정 연동          [▶] │
│  ─── 앱 ───────────────────  │
│  알림 설정               [▶] │
│  ─── 기타 ─────────────────  │
│  로그아웃                [▶] │
│                              │
├──────────────────────────────┤
│  [Life]    [Work]    [설정]  │
└──────────────────────────────┘
```

- 계정 정보 카드
- 설정 메뉴 리스트
- 로그아웃 버튼

## 사용자 플로우

프로토타입은 **단일 HTML 파일 내 섹션 네비게이션**으로 구성된다.

```
[프로토타입 진입]
    │
    ├── 1. 디자인 토큰
    │   ├── 1.1 컬러 팔레트 (Primitive)
    │   ├── 1.2 시맨틱 컬러
    │   ├── 1.3 컴포넌트 컬러
    │   ├── 1.4 타이포그래피
    │   ├── 1.5 간격 & 레이아웃
    │   └── 1.6 모션
    │
    ├── 2. 아이콘 시스템
    │
    ├── 3. 컴포넌트 라이브러리
    │   ├── 3.1 Atoms
    │   ├── 3.2 Molecules
    │   └── 3.3 Organisms
    │
    └── 4. 페이지 프로토타입
        ├── 4.1 로그인
        ├── 4.2 메인 (오늘의 투두)
        ├── 4.3 날짜 탐색
        ├── 4.4 투두 생성/수정
        ├── 4.5 분류 관리
        ├── 4.6 Epic 관리
        └── 4.7 설정
```

- 상단에 앵커 네비게이션(목차)을 배치하여 각 섹션으로 이동 가능
- 페이지 프로토타입 섹션은 430px 프레임 내에 실제 모바일 레이아웃을 렌더링
- 컴포넌트 섹션은 각 컴포넌트의 모든 상태/변형을 나열

## 기술 아키텍처

### 시스템 구성

```
docs/base/prototype/
└── index.html          ← 독립 실행 가능한 단일 HTML 파일
    ├── <style>         ← CSS Custom Properties (토큰) + 컴포넌트 스타일
    ├── <body>          ← 섹션별 마크업
    └── <script>        ← 탭 전환, 인터랙션 등 최소 JS
```

- **단일 HTML 파일**: 외부 의존성 없이 브라우저에서 바로 열 수 있다
- **CSS Custom Properties**: `docs/base/design-system/tokens/*.css`에 정의된 토큰을 그대로 사용
- **Lucide Icons**: CDN 또는 인라인 SVG로 포함
- **Pretendard 폰트**: CDN으로 로드

### 핵심 서비스 구현

프로토타입은 정적 HTML이므로 백엔드 서비스가 필요 없다. 모든 데이터는 하드코딩된 샘플 데이터를 사용한다.

| 요소 | 구현 방식 |
|------|----------|
| 토큰 시각화 | CSS Custom Properties를 컬러 스워치/타이포 샘플로 렌더링 |
| 컴포넌트 | 순수 HTML + CSS로 각 상태 표현 |
| 페이지 레이아웃 | 430px 고정 프레임 내 실제 레이아웃 구현 |
| 인터랙션 | 탭 전환, 체크박스 토글 등 최소한의 바닐라 JS |
| 반응형 | 프로토타입 자체는 데스크톱 뷰, 페이지 프레임은 모바일(430px) |

### 데이터베이스 스키마

프로토타입에는 DB가 필요 없다. 페이지 프로토타입에 표시되는 샘플 데이터는 다음 구조를 따른다:

```
User: 홍길동 (hong@email.com, Google)

Category (Life):
  - 건강 (Purple)
  - 자기개발 (Periwinkle)
  - 생활 (Indigo)

Category (Work):
  - 프로젝트A (Purple)
  - 운영 (Periwinkle)
  - 미팅 (Indigo)

Epic (건강):
  - 3월 운동 루틴 (4/5 완료)
  - 식단 관리 (2/8 완료)

SubIssue (오늘):
  - [Done] 아침 운동 (건강, Medium)
  - [Done] 코드 리뷰 (프로젝트A, High)
  - [In Progress] API 설계 (프로젝트A, High)
  - [Todo] 장보기 (생활, Low)
  - [Todo] 책 읽기 (자기개발, Medium, 이월 2회)
```

### API 엔드포인트

프로토타입은 정적 파일이므로 API 엔드포인트가 필요 없다. 실제 서비스의 API 설계는 `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md` 섹션 4를 참조한다.

### 기술적 고려사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 단일 파일 vs 분리 | 단일 HTML | 별도 서버 없이 더블 클릭으로 즉시 확인 가능 |
| 폰트 로딩 | CDN (Pretendard, JetBrains Mono) | 파일 크기 최소화, 네트워크 필요 |
| 아이콘 | 인라인 SVG | 외부 의존성 제거, 오프라인 동작 |
| CSS 방식 | Custom Properties 직접 사용 | Tailwind 빌드 과정 불필요, 토큰 검증 목적에 부합 |
| 접근성 | ARIA 속성 포함 | 프로토타입 단계부터 접근성 패턴 검증 |
| WCAG 대비 | 컬러 스워치에 대비율 표시 | 디자인 시점에서 대비율 확인 가능 |

## Sub-PRD 구조

| Sub-PRD | 범위 | 산출물 | 문서 |
|---------|------|--------|------|
| **Sub-01: 디자인 토큰 & 아이콘** | 컬러 팔레트, 시맨틱/컴포넌트 토큰, 타이포그래피, 간격, 모션, 아이콘 시각화 | HTML 섹션 1~2 | [sub-prd-01](./sub-prd-01-feat-tokens-icons.md) |
| **Sub-02: 컴포넌트 라이브러리** | Atoms, Molecules, Organisms 모든 상태/변형 | HTML 섹션 3 | [sub-prd-02](./sub-prd-02-feat-component-library.md) |
| **Sub-03: 페이지 프로토타입** | 7개 전체 페이지 레이아웃 (430px 모바일 프레임) | HTML 섹션 4 | [sub-prd-03](./sub-prd-03-feat-page-prototypes.md) |

## 리스크 및 완화 방안

| 리스크 | 영향도 | 완화 방안 |
|--------|-------|----------|
| 단일 HTML 파일 크기가 커질 수 있음 | 낮음 | 아이콘 SVG 최적화, 반복 구조 최소화 |
| CDN 폰트 로딩 실패 시 시각적 차이 | 낮음 | system-ui 폴백 폰트 지정 |
| 인라인 SVG로 인한 마크업 복잡도 증가 | 낮음 | SVG 심볼 재사용 (`<defs>` + `<use>`) |
| 하루 안에 완성해야 하는 일정 압박 | 중간 | Sub-PRD 단위로 우선순위 구현 (토큰 → 컴포넌트 → 페이지) |

## 향후 개선 계획 (Future Scope)

| 항목 | 설명 | 우선순위 |
|------|------|---------|
| 다크 모드 토글 | 다크 테마 토큰 추가 및 실시간 전환 | P3 |
| 인터랙티브 데모 | 투두 생성/완료/삭제 동작 시뮬레이션 | P3 |
| Storybook 마이그레이션 | 프로토타입 검증 후 Storybook으로 전환 | P2 |
| 반응형 프레임 전환 | 430px/768px/1024px 뷰포트 전환 버튼 | P3 |
| 컴포넌트 코드 스니펫 | 각 컴포넌트 옆에 사용 코드 표시 | P3 |

## 관련 문서

- 요구사항 문서: `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md`
- 디자인 시스템 개요: `docs/base/design-system/README.md`
- 디자인 시스템 상세: `docs/dev/20260501-01-design-system/detail-design-system.md`
- 컴포넌트 명세: `docs/base/design-system/components.md`
- 접근성 가이드: `docs/base/design-system/accessibility.md`
- 디자인 토큰: `docs/base/design-system/tokens/`
  - `colors.css` — Primitive Color Tokens
  - `semantic.css` — Semantic Color Tokens
  - `components.css` — Component Tokens
  - `typography.css` — Typography Tokens
  - `spacing.css` — Spacing & Layout Tokens
  - `motion.css` — Motion Tokens
- 컬러 팔레트 원본: `docs/dev/20260501-01-design-system/colors/`

---

*이 문서는 `디자인 시스템 프로토타입` 프로젝트의 메인 PRD입니다. 상세 구현 사항은 각 Sub-PRD를 참조하세요.*
