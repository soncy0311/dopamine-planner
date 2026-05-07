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
| **변형** | `category`, `priority` (High / Medium / Low), `carry-over` |
| **토큰** | `--badge-bg`, `--badge-text` |
| **타이포** | `--font-size-xs`, `--font-weight-medium` |
| **레이아웃** | `--radius-sm` (4px), 내부 패딩 `--spacing-1` × `--spacing-2` |

#### 변형별 표기 규칙

| 변형 | 라벨 형식 | 비고 |
|---|---|---|
| `category` | 분류명만 (예: "건강") | 컬러 dot 동반 금지 — 텍스트만으로 식별 (TodoItem · FilterChips 모두 동일) |
| `priority` | "High" / "Medium" / "Low" | Epic 단위에서만 부여, Sub 는 상속 → Sub 항목 행에 별도 priority 배지 노출 금지 |
| `carry-over` | **`+N`** (예: `+1`, `+5`) | 이월 횟수를 prefix `+` 로 표기. 이모지·아이콘 동반 금지 |

### AddButton

| 속성 | 설명 |
|------|------|
| **설명** | 데스크톱 메인의 필터 행 우측에 배치되는 Epic / Sub 추가 진입점 |
| **구성** | 라벨 텍스트 `"+ 추가"` 단독. **별도 Plus 아이콘 SVG 동반 금지** (텍스트의 `+` 와 중복 회피) |
| **변형** | 단일 (primary). 모바일은 FAB 가 동일 역할 수행 |
| **토큰** | `--button-primary-bg`, `--button-primary-text` |
| **레이아웃** | 높이 32~36px, `--radius-sm`, 가로 패딩 `--spacing-3` |
| **접근성** | `aria-label="할 일 추가"`, 최소 터치 타겟 32×32px (데스크톱 한정) |

> 라벨이 `"+ 추가"` 인 이유: 모바일 FAB(아이콘만) 대비 데스크톱은 텍스트 라벨이 가능하며, "추가" 만으로는 클릭 affordance 가 약해 prefix `+` 를 텍스트에 포함한다. SVG plus 를 별도로 두면 `+ + 추가` 처럼 중복되어 보이므로 텍스트 prefix 만 사용한다.

### FAB (Floating Action Button)

| 속성 | 설명 |
|------|------|
| **설명** | 모바일 메인 화면 우측 하단의 추가 진입점. 누르면 Epic / Sub 추가 시트가 열린다 |
| **아이콘** | Lucide `Plus` (24px) |
| **크기** | 56×56px 원형 (`--radius-full`) |
| **위치** | `position: absolute`, 우측 하단. `BottomTabBar` 위 `--spacing-4` 띄움 |
| **토큰** | `--fab-bg`, `--fab-text`, `--fab-shadow` |
| **모션** | 탭 시 scale 0.96 → 1.0 (`--duration-fast`) |
| **접근성** | `aria-label="할 일 추가"`, 최소 터치 타겟 56×56px (자체 크기로 충족) |

### Divider

| 속성 | 설명 |
|------|------|
| **방향** | horizontal |
| **색상** | `--color-border-subtle` |
| **접근성** | `role="separator"` |

### ProgressBar

| 속성 | 설명 |
|------|------|
| **설명** | 단일 fill 형태의 선형 진행률 막대. Epic 진행률 표시의 atomic primitive. Sub 개수가 많거나(>10) 컨테이너가 좁을 때 fallback variant |
| **변형** | `linear` (단일 fill). 분절 형태는 `SegmentedProgressBar` (Molecule) 참조 |
| **상세 명세** | [`./components/progress-bar.md`](./components/progress-bar.md) |
| **사이즈** | `sm` 4 / `md` 8 / `lg` 12 px. 반경 `--radius-full` 고정 |
| **토큰** | `--progress-bar-track-bg`, `--progress-bar-fill`, `--progress-bar-text` |
| **모션** | `width` transition `--duration-normal` + `--easing-default`. `prefers-reduced-motion` 시 즉시 변경 |
| **접근성** | `role="progressbar"`, `aria-valuemin/max/now/valuetext`, `aria-label="<Epic 제목> 진행률"` |

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
| **분류 표기** | 카테고리 식별은 `Badge.category` 텍스트로만. **컬러 dot 인디케이터 동반 금지** (`prototype` 정합) |

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

### FilterChips

| 구성 | Chip[] (`전체` + 사용자 분류명) |
|------|---|
| **설명** | 메인 화면에서 분류별로 Epic 카드를 필터링하는 칩 그룹 |
| **상태** | 활성 (`--color-interactive-primary` 배경 + `--color-text-inverse`), 비활성 (`--color-bg-subtle` + `--color-text-secondary`) |
| **레이아웃** | 가로 스크롤 (`overflow-x: auto`), 칩 간격 `--spacing-2`, 칩 높이 32px, `--radius-full` |
| **분류 표기** | 칩 라벨은 분류명 텍스트만. **컬러 dot 동반 금지** (`TodoItem` 과 동일 정책) |
| **접근성** | 각 칩은 `<button>`, 활성 칩에 `aria-pressed="true"` |

### ManageHeader

| 구성 | (BackButton) + Title + (ActionButton) |
|------|---|
| **설명** | 분류 관리 / 설정 등 보조 페이지 상단 헤더. 액션 버튼 유무로 두 변형 |
| **변형** | (a) 액션 버튼 포함 (예: 분류 관리 — `+` 추가), (b) 액션 버튼 부재 (예: 설정 — 제목만) |
| **레이아웃** | 좌측 BackButton (`ChevronLeft`) → 중앙 Title (`<h3>`) → 우측 ActionButton (`Plus` 등). 양 끝 정렬 |
| **타이포** | Title `--font-size-lg`, `--font-weight-semibold` |
| **접근성** | BackButton `aria-label="뒤로 가기"`, ActionButton `aria-label` 명시 (예: "분류 추가") |

### ProfileCard

| 구성 | Avatar + (Name + Email + Provider) |
|------|---|
| **설명** | 설정 페이지 상단의 사용자 프로필 카드 — Supabase auth user 정보 표시 |
| **레이아웃** | 가로 정렬: Avatar (좌) + 텍스트 블록 (우, 세로 정렬) |
| **타이포** | Name `--font-size-md` + `--font-weight-semibold`, Email / Provider `--font-size-sm` + `--color-text-secondary` |
| **토큰** | 카드 배경 `--color-bg-elevated`, 패딩 `--spacing-4`, `--radius-md` |
| **접근성** | Avatar 이미지 `alt` 또는 이니셜 폴백, provider 라벨은 텍스트로 표기 |

### SettingsMenuItem

| 구성 | Label + (Value) + Chevron |
|------|---|
| **변형** | (a) 라벨만 (예: "버전 정보"), (b) 보조값 포함 (예: "화면 모드 — 시스템") |
| **레이아웃** | 높이 48px, 좌측 라벨 + 우측 (보조값 + Chevron). `--spacing-4` 가로 패딩 |
| **타이포** | Label `--font-size-md` + `--color-text-primary`, Value `--font-size-sm` + `--color-text-tertiary` |
| **접근성** | 행 전체 클릭 가능 (`role="button"` 또는 `<button>`), `--spacing-4` 좌우 padding 으로 터치 타겟 확보 |

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

### SegmentedProgressBar

| 구성 | Segment[] + ProgressPercent |
|------|------|
| **설명** | Epic 의 **하위 Sub 이슈 완료율** 을 분절된 segment 로 표현. 각 segment = Sub 1개 와 1:1 대응 (1개 완료 = 1칸 채워짐). EpicCard 헤더의 기본 진행률 표시 |
| **상세 명세** | [`./components/progress-bar.md`](./components/progress-bar.md) |
| **사용 기준** | `totalSubCount` ≤ 10 또는 컨테이너 폭 ≥ 120px. 그 외에는 `ProgressBar` (`linear`) 로 fallback |
| **레이아웃** | `display: flex`, segment 간 gap 2px, 각 segment `flex: 1` + 높이 `md` 8px + `--radius-full` |
| **토큰** | `--progress-bar-segment-bg`, `--progress-bar-segment-filled`, `--progress-bar-text` |
| **모션** | segment `background` transition `--duration-fast` + `--easing-default`. `prefers-reduced-motion` 폴백 |
| **접근성** | 컨테이너 `role="progressbar"` + `aria-valuemin/max/now/valuetext`. 개별 segment 는 `aria-hidden="true"` (장식). ProgressPercent 텍스트도 `aria-hidden="true"` — `aria-valuetext` 가 단일 SoT |

```
┌──┐ ┌──┐ ┌──┐ ┌──┐
│■■│ │■■│ │  │ │  │  50%
└──┘ └──┘ └──┘ └──┘
```

### CategoryComboboxCreate

| 구성 | Input + Listbox + "+ 분류 만들기" 옵션 |
|------|------|
| **설명** | 분류 자유 입력 + 검색 + 즉시 생성 진입점 — 잠정안 (디자인 결정자 합류 전) |
| **상세 명세** | [`./components/category-combobox-create.md`](./components/category-combobox-create.md) |
| **사용** | `EpicFormModal` 의 분류 입력 필드 (분류 생성의 유일 경로) |
| **접근성** | `role="combobox"`, `aria-expanded`, 옵션 `role="option"`, `↑/↓/Enter/Escape` 키보드 |

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

### EpicCreateSheet

| 구성 | FormField[] + Button |
|------|---|
| **설명** | 모바일 FAB / 데스크톱 AddButton 시 올라오는 Epic 추가 바텀 시트 |
| **필드** | 제목(필수) → 설명(선택) → **우선순위**(High/Medium/Low) → **분류**(Combobox) → 등록일 |
| **분리 원칙** | Sub 추가와 분리된 별개 컴포넌트. 우선순위·분류는 Epic 단위에서만 부여. 상세 정책: [`./components/issue-creation.md`](./components/issue-creation.md) |
| **모션** | 슬라이드 업 `--duration-slow` (300ms), `--easing-enter` |
| **레이아웃** | `--radius-lg` (상단 모서리), 내부 패딩 `--spacing-6` |
| **접근성** | 포커스 트랩, `Escape`로 닫기, `aria-modal="true"` |

### SubCreateSheet

| 구성 | (Readonly Epic) + FormField[] + Button |
|------|---|
| **설명** | Epic 카드의 "서브 이슈 추가" 진입점에서 열리는 Sub 추가 시트. 진입 시점에 상위 Epic 이 결정되어 폼에 readonly 로 노출 |
| **필드** | **상위 Epic**(readonly) → 제목(필수) → 설명(선택) → 등록일 |
| **분리 원칙** | 분류·우선순위는 상위 Epic 에서 상속하므로 Sub 폼에 입력란 없음. 상세 정책: [`./components/issue-creation.md`](./components/issue-creation.md) |
| **모션** | EpicCreateSheet 와 동일 |
| **접근성** | 동일. Epic readonly 입력은 `readonly` + `aria-readonly="true"` |

### DesktopSideNav

| 구성 | Logo + WorkspaceList(Life/Work) + Spacer + 설정 |
|------|---|
| **설명** | 데스크톱 메인 레이아웃의 좌측 네비게이션 — 모바일 BottomTabBar 의 데스크톱 대응 |
| **너비** | 240px 고정 |
| **레이아웃** | 세로 정렬: Logo(상단 고정) → 워크스페이스 섹션 → spacer → divider → 설정 |
| **상태** | 각 항목 활성/비활성 (`--color-interactive-primary` background 강조) |
| **토큰** | `--color-bg-elevated`, `--color-border-subtle` |
| **접근성** | 각 항목은 `<button>` 또는 `<a>`. 활성 항목 `aria-current="page"` |

### DesktopModal

| 구성 | Backdrop + Card(Header + FormField[] + Button) |
|------|---|
| **설명** | 데스크톱 환경에서 Epic / Sub 추가 / 편집 시 사용하는 중앙 정렬 모달. 모바일의 `*CreateSheet` 를 데스크톱에서 대체 |
| **변형** | Epic 모달, Sub 모달, Epic 편집 모달, Sub 편집 모달 — 폼 내용은 `EpicCreateSheet` / `SubCreateSheet` 와 동일 |
| **레이아웃** | 너비 480px, `--radius-lg`, 내부 패딩 `--spacing-6`. 백드롭은 `rgba(0,0,0,0.4)` |
| **모션** | fade-in `--duration-normal` (200ms) + scale 0.96 → 1.0 |
| **접근성** | `aria-modal="true"`, 포커스 트랩, `Escape` 로 닫기, 닫기 버튼 우측 상단 (`✕`, `aria-label="닫기"`) |

### SettingsSection

| 구성 | SectionTitle + Divider + SettingsMenuItem[] |
|------|---|
| **설명** | 설정 페이지의 그룹 단위. 테마 / 정보 등 도메인별로 묶음 |
| **레이아웃** | SectionTitle (`<h4>`) → Divider → MenuItem 리스트 |
| **타이포** | SectionTitle `--font-size-xs`, `--font-weight-semibold`, `--color-text-tertiary` |
| **상세 명세** | [`./components/settings-page.md`](./components/settings-page.md) §섹션 구조 |
| **접근성** | `<section aria-labelledby={섹션 제목 id}>` 권장 |

### CategoryList

| 구성 | CategoryItem[] |
|------|---------------|
| **설명** | 분류(카테고리) 관리 목록 |
| **레이아웃** | 리스트 아이템 간격 `--spacing-3` |

### EpicCard

| 구성 | Header (Checkbox + CategoryBadge + PriorityBadge + Title + ProgressPercent) + SegmentedProgressBar / ProgressBar + ExpandedBody (SubIssueRow[] + "서브 이슈 추가") |
|------|---|
| **설명** | Epic 의 진행률 + 하위 Sub 들을 아코디언 형태로 표현. 메인 화면의 기본 단위 카드 |
| **변형** | 펼침 (`data-expanded="true"`) / 접힘 (`data-expanded="false"`) |
| **헤더 표시 정책** | CategoryBadge 와 PriorityBadge 는 Epic 헤더에만 노출. SubIssueRow 에는 priority/category 배지 미노출 (분류·우선순위는 Epic 단위 정책 — [`./components/issue-creation.md`](./components/issue-creation.md)) |
| **상호작용** | Header Checkbox 클릭 → cascade 토글 (Sub 0개일 때도 Epic 자체를 manual 토글). Title 클릭 → Epic 편집 진입. "서브 이슈 추가" 버튼 → `SubCreateSheet` |
| **가시성** | Sub 가 0개여도 카드는 노출 (`groupByEpic` 정책). 신규 생성 Epic 즉시 가시 + 일자 필터로 Epic 자체가 사라지지 않게 함 |
| **진행률** | 기본 `SegmentedProgressBar` (Sub 개수 ≤ 10 또는 폭 ≥ 120px), 그 외 `ProgressBar` (`linear`) 로 fallback. 산출식 `completedSubCount / totalSubCount`. Sub 0개 시 표시 정책은 [`./components/progress-bar.md`](./components/progress-bar.md) §1 참조 |
| **토큰** | 프로그레스 바 토큰은 [`./components/progress-bar.md`](./components/progress-bar.md) 의 `--progress-bar-*` 사용 |
| **레이아웃** | `--radius-md`, 내부 패딩 `--spacing-4` |
| **접근성** | 카드 wrapper `role="region"`, 헤더 `aria-expanded`, Title 버튼 `aria-label="<title> 수정"`, 진행률은 `progressbar` role 로 별도 노출 |

---

## 4. Templates (템플릿)

페이지 레벨의 레이아웃 구조를 정의한다.

### MainLayout

| 구성 | DateNavigator + FilterChips + TodoSection[] + FAB + BottomTabBar |
|------|---|
| **설명** | 메인 투두 화면. 날짜별로 그룹화된 Epic 카드(아코디언) 와 그 하위 Sub 항목을 표시 |
| **레이아웃 (mobile)** | 상단 DateNavigator → FilterChips → 중앙 스크롤 (Epic 카드 리스트) → 하단 BottomTabBar 고정 → FAB 우측 하단 |
| **레이아웃 (desktop)** | 좌측 `DesktopSideNav` 고정 + 우측 콘텐츠 (DateNavigator + FilterChips + AddButton + Epic 카드 리스트). FAB 미사용 |
| **Epic 가시성** | `groupByEpic` 은 워크스페이스의 모든 Epic 을 항상 노출 (Sub 0개여도 카드 유지). 신규 생성 Epic 즉시 가시 + 일자 필터로 Epic 자체가 사라지지 않게 함 |
| **CTA 라벨** | mobile FAB: 아이콘만 / desktop AddButton: `"+ 추가"` (텍스트 prefix `+` 포함) |
| **EmptyState 카피** | title `"아직 할 일이 없어요"`, description `"할 일을 등록해보세요"`, CTA `"+ 추가"` ([`./components/empty-state.md`](./components/empty-state.md)) |

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

| 구성 | ManageHeader + List + BottomTabBar |
|------|---|
| **설명** | 분류 관리 등 보조 페이지. **Epic 관리 별도 페이지는 부재** (의도적) — Epic 의 생성/편집/삭제는 메인 화면 카드에서 직접 수행 (`EpicDetailModal` / `epic-form` 라우트) |
| **레이아웃** | 상단 ManageHeader 고정, 중앙 리스트 스크롤, 하단 BottomTabBar 고정 |
| **분류·Epic 진입점** | 분류 생성은 `EpicCreateSheet` 의 `CategoryComboboxCreate`, 분류 삭제는 DB trigger. Epic 편집은 메인 화면 Epic 카드 제목 클릭 → 모달/라우트. 별도 관리 페이지 부재는 [`./components/settings-page.md`](./components/settings-page.md) §부재 진입점 참조 |

### SettingsPage

| 구성 | 프로필 카드 + 계정 / 앱 / 정보 섹션 |
|------|------|
| **설명** | 설정 페이지 page-level 레이아웃 — 잠정안 (디자인 결정자 합류 전) |
| **상세 명세** | [`./components/settings-page.md`](./components/settings-page.md) |
| **사용** | `apps/web/src/app/(main)/settings/page.tsx`, `apps/mobile/src/app/(main)/settings/` |
| **레이아웃** | 단일 컬럼, 카드형 4블록. 분류·Epic 직접 관리 UI 부재 (의도적) |
| **접근성** | 섹션 제목 `<h2>`, 로그아웃 destructive variant |
