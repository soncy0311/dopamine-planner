# 컴포넌트 명세

> Atomic Design 방법론에 따라 Atoms → Molecules → Organisms → Templates 순으로 구성.

## 이 문서의 역할

본 문서는 컴포넌트의 **명세**이며 구현체가 아니다.

| 플랫폼 | 구현 위치 | 기반 |
|---|---|---|
| Web | `packages/ui/src/components/` | shadcn/ui + Radix Primitives + Tailwind |
| Mobile (RN) | `apps/mobile/src/components/` | RN 네이티브 + Nativewind v4 (재사용 누적 시 `packages/ui-mobile` 추출) |

각 컴포넌트의 토큰 참조는 [`tokens.md`](./tokens.md) 의 Component 섹션과 1:1 일치한다.

---

## 1. Atoms (원자)

가장 작은 단위의 UI 요소. 단독으로 의미를 가지며 재사용성이 높다.

### Button

| 속성 | 설명 |
|------|------|
| **변형** | `primary`, `secondary`, `ghost`, `destructive` |
| **크기** | `sm`, `md`, `lg` |
| **상태** | default, hover, active, disabled, loading |
| **토큰** | `--button-primary-bg`, `--button-primary-text`, `--button-primary-bg-hover`, `--button-primary-bg-active`, `--button-primary-bg-disabled` |
| **접근성** | 최소 터치 타겟 44x44px, `aria-disabled`, 로딩 시 `aria-busy` |

```tsx
<Button variant="primary" size="md">할 일 추가</Button>
<Button variant="ghost" size="sm">취소</Button>
<Button variant="destructive">삭제</Button>
```

### Checkbox

| 속성 | 설명 |
|------|------|
| **상태** | unchecked, checked, disabled |
| **토큰** | `--todo-item-checkbox-checked`, `--todo-item-checkbox-unchecked` |
| **모션** | 체크 애니메이션 `--duration-fast` (100ms) |
| **접근성** | `role="checkbox"`, `aria-checked`, 라벨 연결 필수 |

### Icon

| 속성 | 설명 |
|------|------|
| **라이브러리** | Lucide Icons |
| **기본 크기** | 24px |
| **색상** | Semantic 토큰 참조 (`--color-text-primary`, `--color-text-secondary`) |
| **접근성** | 장식용 아이콘 `aria-hidden="true"`, 의미 있는 아이콘 `aria-label` 필수 |

#### 아이콘 매핑

| 용도 | Lucide 아이콘명 |
|------|-----------------|
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

### Badge

| 속성 | 설명 |
|------|------|
| **변형** | `category`, `priority`, `carry-over` |
| **토큰** | `--badge-bg`, `--badge-text` |
| **타이포** | `--font-size-xs`, `--font-weight-medium` |
| **레이아웃** | `--radius-sm` (4px), 내부 패딩 `--spacing-1` × `--spacing-2` |

### Divider

| 속성 | 설명 |
|------|------|
| **방향** | horizontal |
| **색상** | `--color-border-subtle` |
| **접근성** | `role="separator"` |

### Avatar

| 속성 | 설명 |
|------|------|
| **크기** | `sm` (32px), `md` (40px) |
| **형태** | `--radius-full` (원형) |
| **접근성** | 이미지 없을 시 이니셜 폴백, `alt` 필수 |

---

## 2. Molecules (분자)

Atoms를 조합하여 하나의 기능 단위를 구성한다.

### TodoItem

| 구성 | Checkbox + Text + Badge |
|------|------------------------|
| **상태** | 미완료 (기본), 완료 (텍스트 `--todo-item-completed-text`, 취소선) |
| **토큰** | `--todo-item-bg`, `--todo-item-border` |
| **모션** | 완료 시 체크 애니메이션 + 리스트 리오더 (200ms), 좌측 스와이프로 삭제 |
| **레이아웃** | 높이 최소 48px, 내부 패딩 `--spacing-4` |
| **접근성** | 전체 행 클릭 가능, 키보드 Enter/Space로 토글 |

```
┌────────────────────────────────────────────┐
│  ☐  할 일 텍스트              [카테고리]   │
│      2026-05-01               [↗ 3]        │
└────────────────────────────────────────────┘
```

### SectionHeader

| 구성 | Icon + Title + Count |
|------|---------------------|
| **변형** | 진행 중 (`--section-progress-text`), 완료 (`--section-done-text`) |
| **타이포** | `--font-size-lg`, `--font-weight-semibold` |
| **레이아웃** | 상하 패딩 `--spacing-3` |

```
  ✓ 완료 (2)
  ☐ 진행 중 (3)
```

### DateNavigator

| 구성 | ChevronLeft + Date Text + ChevronRight |
|------|----------------------------------------|
| **타이포** | 날짜: `--font-size-2xl`, `--font-weight-bold` |
| **모션** | 좌우 스와이프 또는 화살표 탭 → 슬라이드 전환 `--duration-slow` (300ms) |
| **접근성** | 이전/다음 버튼 `aria-label="이전 날짜"` / `aria-label="다음 날짜"` |

```
  ‹   2026년 5월 1일 (목)   ›
```

### TabBarItem

| 구성 | Icon + Label |
|------|-------------|
| **상태** | 활성 (`--tab-bar-active`), 비활성 (`--tab-bar-inactive`) |
| **타이포** | `--font-size-xs`, 활성 시 `--font-weight-semibold` |
| **접근성** | `role="tab"`, `aria-selected` |

### FormField

| 구성 | Label + Input + HelperText |
|------|---------------------------|
| **상태** | default, focused (`--color-border-focus`), error (`--color-status-error`), disabled |
| **레이아웃** | 라벨-입력 간격 `--spacing-2`, 입력 필드 `--radius-md` |
| **접근성** | `<label>` 연결, 에러 시 `aria-invalid`, `aria-describedby` |

### EmptyState

| 구성 | (Icon) + Title + (Description) + (Action Button) |
|------|------|
| **설명** | 데이터 0건 화면의 표준 빈 상태 표현 — 잠정안 (디자인 결정자 합류 전) |
| **상세 명세** | [`./components/empty-state.md`](./components/empty-state.md) |
| **사용** | 빈 워크스페이스 / 빈 일자 / 검색 결과 0건 |
| **접근성** | `role="status"`, 아이콘 `aria-hidden`, CTA 버튼 단수 |

### Spinner

| 구성 | (Wrapper) + 회전 SVG / ActivityIndicator |
|------|------|
| **변형** | `inline` (섹션·리스트), `fullscreen` (라우트 전환·부트스트랩) |
| **사이즈** | `sm` 16 / `md` 24 / `lg` 40 |
| **상세 명세** | [`./components/spinner.md`](./components/spinner.md) |
| **접근성** | `role="status"`, `aria-label` 기본 "로딩 중", `prefers-reduced-motion` 폴백 |

### Toast

| 구성 | sonner `<Toaster />` 등록 + `toast.{success,error,info,warning}(msg)` 호출 |
|------|------|
| **설명** | 비동기 결과 알림. sonner 라이브러리 wrapping |
| **상세 명세** | [`./components/toast.md`](./components/toast.md) |
| **위치 / 시간 / 개수** | top-right / 4초 / 3개 (sonner 기본값 채택) |
| **접근성** | sonner 의 `aria-live` 자동 관리, `closeButton` 활성 |

---

## 3. Organisms (유기체)

Molecules를 조합하여 독립적인 섹션을 구성한다.

### TodoSection

| 구성 | SectionHeader + TodoItem[] |
|------|---------------------------|
| **설명** | 완료/진행 중 섹션별로 투두 아이템을 그룹화 |
| **모션** | 아이템 완료 시 섹션 간 이동 애니메이션 |
| **접근성** | `role="list"`, 각 TodoItem은 `role="listitem"` |

### BottomTabBar

| 구성 | TabBarItem[] |
|------|-------------|
| **탭 구성** | Life (`Sun`), Work (`Briefcase`), 설정 (`Settings`) |
| **토큰** | `--tab-bar-bg`, `--tab-bar-active`, `--tab-bar-inactive` |
| **레이아웃** | 고정 하단, Safe Area 대응, 높이 56px + Safe Area |
| **모션** | 탭 전환 시 페이드 크로스 `--duration-normal` (200ms) |
| **접근성** | `role="tablist"`, 좌우 방향키 탐색 |

### TodoCreateSheet

| 구성 | FormField[] + Button |
|------|---------------------|
| **설명** | FAB 탭 시 올라오는 바텀 시트. 투두 생성 폼 포함 |
| **모션** | 슬라이드 업 `--duration-slow` (300ms), `--easing-enter` |
| **레이아웃** | `--radius-lg` (상단 모서리), 내부 패딩 `--spacing-6` |
| **접근성** | 포커스 트랩, `Escape`로 닫기, `aria-modal="true"` |

### CategoryList

| 구성 | CategoryItem[] |
|------|---------------|
| **설명** | 분류(카테고리) 관리 목록 |
| **레이아웃** | 리스트 아이템 간격 `--spacing-3` |

### EpicCard

| 구성 | Title + ProgressBar + SubIssueCount |
|------|-------------------------------------|
| **설명** | Epic의 진행률을 시각적으로 표시하는 카드 |
| **토큰** | 프로그레스 바 활성 `--color-interactive-primary`, 비활성 `--color-border-subtle` |
| **레이아웃** | `--radius-md`, 내부 패딩 `--spacing-4` |

---

## 4. Templates (템플릿)

페이지 레벨의 레이아웃 구조를 정의한다.

### MainLayout

| 구성 | DateNavigator + TodoSection[] + FAB + BottomTabBar |
|------|---------------------------------------------------|
| **설명** | 메인 투두 화면. 날짜별 투두 목록을 표시 |
| **레이아웃** | 상단 DateNavigator 고정, 중앙 스크롤 영역, 하단 BottomTabBar 고정, FAB 우측 하단 |

```
┌──────────────────────────┐
│   ‹  2026-05-01 (목)  ›  │  ← DateNavigator
├──────────────────────────┤
│                          │
│  ☐ 진행 중 (3)           │  ← SectionHeader
│  ├─ ☐ 투두 항목 1        │  ← TodoItem
│  ├─ ☐ 투두 항목 2        │
│  └─ ☐ 투두 항목 3        │
│                          │
│  ✓ 완료 (2)              │  ← SectionHeader
│  ├─ ✓ 완료 항목 1        │
│  └─ ✓ 완료 항목 2        │
│                          │
│                    [＋]  │  ← FAB
├──────────────────────────┤
│  ☀️  Life  |  💼  Work  |  ⚙  │  ← BottomTabBar
└──────────────────────────┘
```

### AuthLayout

| 구성 | Logo + SocialButtons |
|------|---------------------|
| **설명** | 로그인 화면. 중앙 정렬, 소셜 로그인 버튼 제공 |
| **레이아웃** | 수직 중앙 정렬, 최대 너비 `--layout-max-width` |

### ManageLayout

| 구성 | Header + List + BottomTabBar |
|------|------------------------------|
| **설명** | 분류/Epic 관리 화면 |
| **레이아웃** | 상단 헤더 고정, 중앙 리스트 스크롤, 하단 탭 바 고정 |
