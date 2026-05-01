# Todo List 디자인 시스템 요구사항

> 작성일: 2026-05-01
> 상태: Draft

---

## 1. 개요

Todo List 서비스의 웹(Next.js)과 모바일(WebView) 환경에서 **일관된 UI/UX**를 보장하기 위한 디자인 시스템 구축 요구사항.
디자인 토큰 → 컴포넌트 → 문서의 3단 체계로 구성하며, 모노레포(`packages/ui`)에서 관리한다.

---

## 2. 기술 스택

| 영역 | 선택 | 근거 |
|------|------|------|
| **스타일링** | Tailwind CSS v4 | Zero-runtime, 번들 최소(3-5KB gzipped), 모바일 WebView 성능 최적 |
| **UI 컴포넌트** | shadcn/ui + Radix Primitives | 코드 소유권 모델, WAI-ARIA 접근성 내장, 커스터마이징 자유도 |
| **디자인 토큰** | CSS Custom Properties (Tailwind config 연동) | 테마 전환 용이, 런타임 오버헤드 없음 |
| **컴포넌트 문서** | Storybook | 컴포넌트 카탈로그, 시각 회귀 테스트 |

---

## 3. 컬러 시스템

### 3.1 컬러 팔레트 원본

Adobe Color에서 추출한 컬러 팔레트. 이미지 원본은 `colors/` 디렉토리에 보관.

#### Main Color (Purple)

| 이름 | HEX | RGB | 용도 |
|------|-----|-----|------|
| Purple 100 | `#D7AEF2` | 215, 174, 242 | 배경 하이라이트, 비활성 상태 |
| Purple 200 | `#C599F2` | 197, 153, 242 | 호버 상태, 보조 강조 |
| Purple 300 | `#B87EF2` | 184, 126, 242 | 활성 상태, 선택 표시 |
| Purple 500 | `#9755D9` | 151, 85, 217 | **Primary. 주요 CTA, 브랜드 대표색** |
| Purple 700 | `#8A63BF` | 138, 99, 191 | 눌림 상태, 진한 강조 |

#### Sub Color 01 (Periwinkle)

| 이름 | HEX | RGB | 용도 |
|------|-----|-----|------|
| Periwinkle 100 | `#D2D3FF` | 210, 211, 255 | 연한 배경, 태그 배경 |
| Periwinkle 200 | `#BFCEFF` | 191, 206, 255 | 카드 배경, 섹션 구분 |
| Periwinkle 300 | `#BAC3FF` | 186, 195, 255 | 보조 요소 배경 |
| Periwinkle 400 | `#9DABE8` | 157, 171, 232 | 보조 아이콘, 보더 |
| Periwinkle 500 | `#9DA3E8` | 157, 163, 232 | **Secondary. 워크스페이스 구분, 카테고리 표시** |

#### Sub Color 02 (Neutral + Grounding)

| 이름 | HEX | RGB | 용도 |
|------|-----|-----|------|
| Indigo 600 | `#7578BF` | 117, 120, 191 | 비활성 아이콘, 보조 텍스트 강조 |
| Lavender Gray 300 | `#B8BAD9` | 184, 186, 217 | 보더, 디바이더, 비활성 요소 |
| Gray 50 | `#F2F2F2` | 242, 242, 242 | **Surface 배경. 앱 기본 배경색** |
| Black 900 | `#000000` | 0, 0, 0 | **Grounding. 본문 텍스트, 아이콘** |

### 3.2 디자인 토큰 — 3단계 계층

컬러 팔레트를 Primitive → Semantic → Component 토큰으로 구조화한다.

#### Primitive Tokens (원시 토큰)

팔레트의 모든 색을 값 기반으로 등록한다.

```css
/* Main - Purple */
--color-purple-100: #D7AEF2;
--color-purple-200: #C599F2;
--color-purple-300: #B87EF2;
--color-purple-500: #9755D9;
--color-purple-700: #8A63BF;

/* Sub 01 - Periwinkle */
--color-periwinkle-100: #D2D3FF;
--color-periwinkle-200: #BFCEFF;
--color-periwinkle-300: #BAC3FF;
--color-periwinkle-400: #9DABE8;
--color-periwinkle-500: #9DA3E8;

/* Sub 02 - Neutral */
--color-indigo-600: #7578BF;
--color-lavender-gray-300: #B8BAD9;
--color-gray-50: #F2F2F2;
--color-white: #FFFFFF;
--color-black-900: #000000;

/* Semantic Colors (확장 필요) */
--color-red-500: #EF4444;
--color-green-500: #22C55E;
--color-yellow-500: #F59E0B;
--color-blue-500: #3B82F6;
```

#### Semantic Tokens (시맨틱 토큰)

UI 역할과 의미를 이름에 반영한다. 다크 모드 전환 시 이 레이어만 재매핑한다.

```css
/* --- Light Theme --- */

/* Text */
--color-text-primary: var(--color-black-900);
--color-text-secondary: var(--color-indigo-600);
--color-text-tertiary: var(--color-lavender-gray-300);
--color-text-inverse: var(--color-white);
--color-text-brand: var(--color-purple-500);

/* Background */
--color-bg-base: var(--color-white);
--color-bg-surface: var(--color-gray-50);
--color-bg-elevated: var(--color-white);
--color-bg-brand-subtle: var(--color-purple-100);
--color-bg-secondary-subtle: var(--color-periwinkle-100);

/* Interactive (Primary) */
--color-interactive-primary: var(--color-purple-500);
--color-interactive-primary-hover: var(--color-purple-300);
--color-interactive-primary-active: var(--color-purple-700);
--color-interactive-primary-disabled: var(--color-purple-100);

/* Interactive (Secondary) */
--color-interactive-secondary: var(--color-periwinkle-500);
--color-interactive-secondary-hover: var(--color-periwinkle-300);
--color-interactive-secondary-active: var(--color-periwinkle-400);

/* Border */
--color-border-default: var(--color-lavender-gray-300);
--color-border-focus: var(--color-purple-500);
--color-border-subtle: var(--color-gray-50);

/* Status (Semantic) */
--color-status-success: var(--color-green-500);
--color-status-error: var(--color-red-500);
--color-status-warning: var(--color-yellow-500);
--color-status-info: var(--color-blue-500);
```

#### Component Tokens (컴포넌트 토큰)

특정 컴포넌트에 한정된 토큰. 컴포넌트별 고유 특성을 조정할 때 사용한다.

```css
/* Button */
--button-primary-bg: var(--color-interactive-primary);
--button-primary-text: var(--color-text-inverse);
--button-primary-bg-hover: var(--color-interactive-primary-hover);
--button-primary-bg-active: var(--color-interactive-primary-active);
--button-primary-bg-disabled: var(--color-interactive-primary-disabled);

/* Tab Bar */
--tab-bar-bg: var(--color-bg-elevated);
--tab-bar-active: var(--color-interactive-primary);
--tab-bar-inactive: var(--color-lavender-gray-300);

/* Todo Item */
--todo-item-bg: var(--color-bg-elevated);
--todo-item-border: var(--color-border-default);
--todo-item-completed-text: var(--color-text-tertiary);
--todo-item-checkbox-checked: var(--color-interactive-primary);
--todo-item-checkbox-unchecked: var(--color-border-default);

/* Category Badge */
--badge-bg: var(--color-bg-secondary-subtle);
--badge-text: var(--color-interactive-secondary);

/* FAB (Floating Action Button) */
--fab-bg: var(--color-interactive-primary);
--fab-text: var(--color-text-inverse);
--fab-shadow: rgba(151, 85, 217, 0.3);

/* Section Header */
--section-done-text: var(--color-text-secondary);
--section-progress-text: var(--color-text-primary);
```

### 3.3 60-30-10 적용 계획

| 비율 | 역할 | 적용 색 | 적용 영역 |
|------|------|---------|-----------|
| **60%** | Dominant (주조) | `#FFFFFF` / `#F2F2F2` | 앱 배경, 카드 배경, 여백 |
| **30%** | Subdominant (보조) | Periwinkle 계열 + Lavender Gray | 섹션 헤더, 카드 보더, 태그 배경, 비활성 요소 |
| **10%** | Accent (강조) | Purple 500 `#9755D9` | CTA 버튼, 체크박스 활성, FAB, 포커스 링 |
| — | Grounding | `#000000` | 본문 텍스트, 주요 아이콘 |

### 3.4 WCAG 대비 검증 (필수)

| 조합 | 대비비 | AA 기준 | 판정 |
|------|--------|---------|------|
| Black(`#000000`) on White(`#FFFFFF`) | 21:1 | 4.5:1 | PASS |
| Black(`#000000`) on Gray(`#F2F2F2`) | 18.1:1 | 4.5:1 | PASS |
| Purple 500(`#9755D9`) on White(`#FFFFFF`) | 4.6:1 | 4.5:1 | PASS (AA) |
| White(`#FFFFFF`) on Purple 500(`#9755D9`) | 4.6:1 | 3:1 (Large) | PASS |
| Indigo 600(`#7578BF`) on White(`#FFFFFF`) | 3.4:1 | 3:1 (UI) | PASS (UI Only) |
| Indigo 600(`#7578BF`) on Gray(`#F2F2F2`) | 3.1:1 | 3:1 (UI) | PASS (UI Only) |

> Indigo 600은 일반 본문 텍스트로 사용하지 않는다. 보조 텍스트/아이콘에만 한정한다.

---

## 4. 타이포그래피

### 4.1 폰트

| 용도 | 폰트 | 근거 |
|------|------|------|
| **한글/기본** | Pretendard | 가변 폰트, 한글 최적화, 무료 |
| **영문/숫자** | Pretendard (내장 Latin) | 별도 폰트 로딩 불필요 |
| **모노스페이스** | JetBrains Mono | 코드/숫자 표시용 (이월 횟수 등) |

### 4.2 타입 스케일

| 토큰 | 크기 | 행간 | 용도 |
|------|------|------|------|
| `--font-size-xs` | 11px | 16px | 캡션, 이월 횟수 |
| `--font-size-sm` | 13px | 18px | 보조 텍스트, 날짜 |
| `--font-size-md` | 15px | 22px | 본문 기본, 투두 제목 |
| `--font-size-lg` | 17px | 24px | 섹션 헤더 |
| `--font-size-xl` | 20px | 28px | 페이지 타이틀 |
| `--font-size-2xl` | 24px | 32px | 날짜 네비게이션 |

### 4.3 폰트 두께

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--font-weight-regular` | 400 | 본문 |
| `--font-weight-medium` | 500 | 강조 텍스트, 카테고리명 |
| `--font-weight-semibold` | 600 | 섹션 헤더, 탭 활성 |
| `--font-weight-bold` | 700 | 날짜, 페이지 타이틀 |

---

## 5. 간격 및 레이아웃

### 5.1 Spacing Scale (4px 기반)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--spacing-1` | 4px | 아이콘과 텍스트 사이 |
| `--spacing-2` | 8px | 요소 내부 여백 |
| `--spacing-3` | 12px | 리스트 아이템 간격 |
| `--spacing-4` | 16px | 카드 내부 패딩 |
| `--spacing-5` | 20px | 섹션 간 간격 |
| `--spacing-6` | 24px | 화면 좌우 패딩 |
| `--spacing-8` | 32px | 큰 섹션 간격 |

### 5.2 반응형 기준

모바일 WebView를 우선 설계하되, 웹에서도 사용 가능해야 한다.

| 구분 | 기준 | 레이아웃 |
|------|------|----------|
| **Mobile (기본)** | ~430px | 단일 컬럼, 하단 탭 바 |
| **Tablet** | 431px ~ 768px | 단일 컬럼, 여백 확대 |
| **Desktop** | 769px~ | 최대 너비 480px 중앙 정렬 (앱 스타일 유지) |

### 5.3 Border Radius

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--radius-sm` | 4px | 태그, 뱃지 |
| `--radius-md` | 8px | 카드, 입력 필드 |
| `--radius-lg` | 12px | 모달, 바텀 시트 |
| `--radius-full` | 9999px | FAB, 아바타 |

---

## 6. 컴포넌트 목록

### 6.1 Atoms (원자)

| 컴포넌트 | 변형 | 설명 |
|----------|------|------|
| **Button** | primary, secondary, ghost, destructive | CTA, 보조 액션 |
| **Checkbox** | unchecked, checked, disabled | 투두 완료 체크 |
| **Icon** | 24px 기본 | Lucide Icons 사용 |
| **Badge** | category, priority, carry-over | 분류 표시, 우선순위, 이월 횟수 |
| **Divider** | horizontal | 섹션 구분선 |
| **Avatar** | sm, md | 사용자 프로필 |

### 6.2 Molecules (분자)

| 컴포넌트 | 구성 | 설명 |
|----------|------|------|
| **TodoItem** | Checkbox + Text + Badge | 투두 리스트 한 행 |
| **SectionHeader** | Icon + Title + Count | "완료 (2)", "진행 중 (3)" |
| **DateNavigator** | Arrow + Date Text + Arrow | 날짜 좌우 탐색 |
| **TabBarItem** | Icon + Label | 하단 탭 바 항목 |
| **FormField** | Label + Input + HelperText | 폼 입력 필드 |

### 6.3 Organisms (유기체)

| 컴포넌트 | 구성 | 설명 |
|----------|------|------|
| **TodoSection** | SectionHeader + TodoItem[] | 완료/진행 중 섹션 |
| **BottomTabBar** | TabBarItem[] | Life / Work / 설정 탭 |
| **TodoCreateSheet** | FormField[] + Button | 투두 생성 바텀 시트 |
| **CategoryList** | CategoryItem[] | 분류 관리 목록 |
| **EpicCard** | Title + ProgressBar + SubIssueCount | Epic 진행률 카드 |

### 6.4 Templates (템플릿)

| 템플릿 | 구성 | 설명 |
|--------|------|------|
| **MainLayout** | DateNavigator + TodoSection[] + FAB + BottomTabBar | 메인 투두 화면 |
| **AuthLayout** | Logo + SocialButtons | 로그인 화면 |
| **ManageLayout** | Header + List + BottomTabBar | 분류/Epic 관리 화면 |

---

## 7. 아이콘

| 항목 | 선택 | 근거 |
|------|------|------|
| **라이브러리** | Lucide Icons | 경량, 트리셰이킹, React 공식 지원, 접근성 |
| **기본 크기** | 24px | 모바일 터치 영역 고려 |
| **색상** | Semantic 토큰 참조 | `--color-text-primary`, `--color-text-secondary` 등 |

### 주요 아이콘 매핑

| 용도 | 아이콘 |
|------|--------|
| Life 탭 | `Sun` |
| Work 탭 | `Briefcase` |
| 설정 탭 | `Settings` |
| 추가 (FAB) | `Plus` |
| 완료 섹션 | `CircleCheck` |
| 진행 중 섹션 | `ListTodo` |
| 날짜 이전 | `ChevronLeft` |
| 날짜 다음 | `ChevronRight` |
| 우선순위 High | `AlertTriangle` |
| 이월 표시 | `ArrowRightFromLine` |

---

## 8. 모션 및 인터랙션

### 8.1 Transition 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--duration-fast` | 100ms | 체크박스 토글, 호버 |
| `--duration-normal` | 200ms | 버튼 상태 전환, 페이드 |
| `--duration-slow` | 300ms | 바텀 시트 진입, 페이지 전환 |
| `--easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 범용 |
| `--easing-enter` | `cubic-bezier(0, 0, 0.2, 1)` | 요소 진입 |
| `--easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | 요소 퇴장 |

### 8.2 핵심 인터랙션

| 인터랙션 | 동작 | 모션 |
|----------|------|------|
| 투두 완료 | 체크박스 탭 → 상단 섹션으로 이동 | 체크 애니메이션 + 리스트 리오더 (200ms) |
| 투두 삭제 | 좌측 스와이프 | 슬라이드 아웃 (200ms) |
| 날짜 전환 | 좌우 스와이프 또는 화살표 탭 | 슬라이드 전환 (300ms) |
| FAB 탭 | 바텀 시트 올라옴 | 슬라이드 업 (300ms) |
| 탭 전환 | 하단 탭 탭 | 페이드 크로스 (200ms) |

---

## 9. 접근성 요구사항

| 항목 | 기준 | 비고 |
|------|------|------|
| 색 대비 | WCAG 2.1 AA 이상 | 본문 4.5:1, 대형 텍스트 3:1, UI 요소 3:1 |
| 터치 타겟 | 최소 44x44px | 모바일 WebView 필수 |
| 키보드 탐색 | 모든 인터랙티브 요소 Tab 접근 가능 | 웹 접근성 |
| 스크린 리더 | ARIA 레이블 필수 | Radix Primitives 내장 지원 |
| 색상 비의존 | 색 외 아이콘/텍스트/패턴 병행 | 우선순위, 상태 표시 등 |
| 폰트 스케일링 | 시스템 폰트 크기 설정 존중 | rem 단위 사용 |

---

## 10. 디렉토리 구조 (packages/ui)

```
packages/ui/
├── src/
│   ├── tokens/
│   │   ├── colors.css          # Primitive 컬러 토큰
│   │   ├── semantic.css        # Semantic 컬러 토큰
│   │   ├── typography.css      # 타이포그래피 토큰
│   │   ├── spacing.css         # 간격 토큰
│   │   └── motion.css          # 모션 토큰
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button/
│   │   │   ├── Checkbox/
│   │   │   ├── Badge/
│   │   │   └── ...
│   │   ├── molecules/
│   │   │   ├── TodoItem/
│   │   │   ├── SectionHeader/
│   │   │   ├── DateNavigator/
│   │   │   └── ...
│   │   └── organisms/
│   │       ├── TodoSection/
│   │       ├── BottomTabBar/
│   │       ├── TodoCreateSheet/
│   │       └── ...
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 11. 구현 우선순위

| 순서 | 항목 | 산출물 |
|------|------|--------|
| **P0** | 디자인 토큰 정의 | `tokens/*.css`, Tailwind config 확장 |
| **P0** | 타이포그래피 + Pretendard 설정 | 폰트 로딩, 글로벌 스타일 |
| **P1** | Atoms 컴포넌트 | Button, Checkbox, Badge, Icon, Divider |
| **P1** | Molecules 컴포넌트 | TodoItem, SectionHeader, DateNavigator, TabBarItem |
| **P2** | Organisms 컴포넌트 | TodoSection, BottomTabBar, TodoCreateSheet |
| **P2** | Storybook 설정 | 컴포넌트 카탈로그 + 문서화 |
| **P3** | 다크 모드 | Semantic 토큰 재매핑 |
| **P3** | 모션/애니메이션 | 트랜지션, 스와이프, 바텀 시트 |
