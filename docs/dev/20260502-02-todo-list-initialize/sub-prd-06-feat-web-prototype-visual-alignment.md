# SUB-PRD: `웹 prototype 시각·UX 정합`

## 작업 정보

- **작업명**: `웹 prototype 시각·UX 정합` `web-prototype-visual-alignment`
- **작업 유형**: `feat` (UI 시각·UX 정합)
- **시작일**: 2026-05-05
- **종료일**: 2026-05-06
- **최신 업데이트**: 2026-05-06
- **상태**: 완료
- **Main PRD**: [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md)
- **선행 Sub-PRD**: [`sub-prd-02-feat-web-main-view.md`](./sub-prd-02-feat-web-main-view.md), [`sub-prd-03-feat-web-management.md`](./sub-prd-03-feat-web-management.md) (머지 완료)

## 배경 및 목적

선행 Sub-02·03 가 web 메인 뷰 + 관리 화면을 기능적으로 동작하는 수준까지 머지했지만, `docs/base/prototype/` 의 디자인 의도와 비교하면 다수 시각·인터랙션 격차가 누적된 상태다. 본 sub 는 격차 중 **개별 변경 범위가 작은 시각·UX 정합 항목 7건** 을 한 sprint 로 묶어 처리한다 (Epic 아코디언 / Kakao OAuth / Empty state 는 Sub-07 / Sub-08 로 분리).

식별된 격차 (출처: `docs/base/prototype/`):

1. **사이드바** — 로고 아이콘 + "워크스페이스" 그룹 헤더 + 메뉴별 아이콘 + 그룹 분리선
2. **카테고리 chip 필터** — 메인 뷰 상단 수평 스크롤 chip
3. **달력 월간 토글** — DateNavigator 헤더 토글 + 월간 그리드
4. **카드 메타** — TodoItem 의 priority badge + carry-over "+N" 뱃지
5. **모달 UX** — 우선순위 native select → 3색 badge 인라인 / 분류 select → combobox(자동완성)
6. **FAB 데스크탑 노출** — `md:hidden` 제거
7. **Pretendard Variable 폰트** — `next/font/local` 적용 + Tailwind `fontFamily.sans` 정합

위 7건은 모두 (a) 데이터 흐름 변경 0 (b) 도메인 데이터(`priority`, `carry_over_count`)는 이미 select 됨 (c) 컴포넌트 props 추가 / 시각 토큰 추가 / 클라이언트 측 필터 정도의 변경으로 sprint 단위 적합.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 15 (App Router) — `apps/web/` |
| UI | React 19 + Tailwind v3 (`packages/config/tailwind.config.js`) |
| 아이콘 | `lucide-react` (`Home`, `Briefcase`, `Settings`, `CircleCheck`, `ChevronDown`, `ChevronRight`) |
| 폰트 | Pretendard Variable (`next/font/local`) |
| Combobox | `cmdk` (shadcn 호환) 또는 자체 구현 (결정 항목) |
| 공유 컴포넌트 | `packages/ui` (TodoItem / DateNavigator / FAB) |

## 핵심 요구 사항

### 1. 사이드바 정합 — `apps/web/src/components/SideNav.tsx`

prototype 인용: `docs/base/prototype/pages/page-prototypes-desktop.html:29-53`

- 로고: `CircleCheck` 아이콘 + "Dopamine Planner" 텍스트
- "워크스페이스" 그룹 헤더 → `Life` (`Home`) / `Work` (`Briefcase`)
- spacer flex-1 + 분리선 (`border-t`)
- 하단 그룹: "설정" (`Settings`)
- active 상태: 배경/텍스트 토큰 정합

### 2. 카테고리 chip 필터 — `apps/web/src/components/CategoryFilterChips.tsx` (신설)

prototype 인용: `docs/base/prototype/pages/page-prototypes-desktop.html:85-91`, `docs/base/prototype/css/molecules.css:569-605`

- "전체" + 동적 카테고리 list (현 워크스페이스 한정)
- 가로 스크롤 + scrollbar 숨김 (`[&::-webkit-scrollbar]:hidden`)
- 활성 chip: `aria-pressed`
- 데이터 소스: 기존 `useCategories(workspace)` (Sub-01 머지 자산) — 미존재 시 `useTodos` 결과에서 distinct 추출
- 선택된 카테고리는 MainDailyView 의 todos 클라이언트 측 필터

### 3. DateNavigator 월간 토글 — `packages/ui/src/DateNavigator.tsx`

prototype 인용: `docs/base/prototype/pages/page-prototypes-desktop.html:56-84`, `docs/base/prototype/css/molecules.css:251-260`, `docs/base/prototype/js/pages.js:272-275`

- 헤더의 "YYYY년 M월" 을 토글 버튼으로 변경 (chevron-down 아이콘 포함)
- `aria-expanded` / `aria-controls` 속성
- 펼침 시 6주 × 7열 월간 그리드 노출 (이전·다음 달 셀 dimmed)
- chevron 회전 (180deg) — `data-expanded="true"` 셀렉터
- prev/next 의미 단위: 주간 모드 = 주 단위, 월간 모드 = 월 단위
- Esc 키 → 닫힘
- 기존 ArrowLeft/Right 일자 이동 유지 (input 안에서는 발동 안 함)

### 4. TodoItem 카드 메타 — `packages/ui/src/TodoItem.tsx`

prototype 인용: `docs/base/prototype/pages/page-prototypes-desktop.html:157, 432-437`, `docs/base/prototype/css/atoms.css:258`, `docs/base/prototype/css/molecules.css:58-59`

- props 확장: `priority?: 'high' | 'medium' | 'low' | null`, `carryOverCount?: number`
- priority 가 있으면 3색 badge 인라인 (high=red, medium=amber, low=blue 계열, 디자인 시스템 토큰)
- `carryOverCount > 0` 이면 제목 우측에 `+{N}` 뱃지
- DoneSection 헤더 50% opacity, TodoSection 헤더는 검정 (활성)

### 5. CreateTodoModal / TodoDetailModal — `apps/web/src/components/modals/`

prototype 인용: `docs/base/prototype/pages/page-prototypes-desktop.html:432-448`

- 우선순위: native `<select>` → 3 badge `radiogroup` (Sub-04 의 카드 priority 토큰 재사용)
- 분류: native `<select>` → Combobox (`cmdk` 또는 자체 구현)
- Combobox: input 필터 + ArrowUp/Down + Enter/Esc + 외부 클릭 닫기 + WAI-ARIA 1.2 패턴
- 라벨 정합 결정: prototype "등록일" vs 도메인 `due_date` ("기한") — 본 sub 에서 결정 후 적용 (§주의사항 미해결 항목)

### 6. FAB 데스크탑 노출 — `apps/web/src/components/MainDailyView.tsx`

prototype 인용: `docs/base/prototype/css/pages.css:41-55`

- 호출 측 `md:hidden` wrap 제거 → 데스크탑·모바일 공통 노출
- 위치: 우측 하단 fixed (`bottom-6 right-6`)

### 7. Pretendard Variable 폰트

prototype 인용: `docs/base/prototype/css/tokens.css:109-110`

- `next/font/local` 로 woff2 번들 (`apps/web/src/app/fonts/PretendardVariable.woff2`)
- `apps/web/src/app/layout.tsx` `<html className={pretendard.variable}>`
- `packages/config/tailwind.config.js` 의 `fontFamily.sans` 에 `var(--font-pretendard)` 추가 + prototype 토큰의 fallback chain 정합
- SIL Open Font License 텍스트 동봉 (`apps/web/public/fonts/LICENSE`)

## 핵심 구현 로직

### SideNav 재구성

```tsx
// apps/web/src/components/SideNav.tsx
import { Home, Briefcase, Settings, CircleCheck } from 'lucide-react';

const WORKSPACE_ITEMS = [
  { label: 'Life', href: '/life', icon: Home, match: (p: string) => p.startsWith('/life') },
  { label: 'Work', href: '/work', icon: Briefcase, match: (p: string) => p.startsWith('/work') },
];
const SETTINGS_ITEMS = [
  { label: '설정', href: '/settings', icon: Settings, match: (p: string) => p.startsWith('/settings') },
];

// 구조: 로고 → 워크스페이스 그룹(헤더 + 2 items) → spacer flex-1 → 분리선 → 설정 그룹
```

### DateNavigator 헤더 토글

```tsx
const [expanded, setExpanded] = useState(false);
const calId = useId();

<button
  type="button"
  aria-expanded={expanded}
  aria-controls={calId}
  onClick={() => setExpanded((v) => !v)}
  className="flex items-center gap-1"
>
  <h2 className="text-lg font-semibold">{year}년 {month}월</h2>
  <ChevronDown
    className={expanded ? 'rotate-180 transition' : 'transition'}
    aria-hidden
  />
</button>

{expanded ? (
  <div id={calId} role="grid" aria-label={`${year}년 ${month}월 달력`}>
    {/* 6주 × 7열 month grid */}
  </div>
) : null}
```

### Priority badge radio-group (모달)

```tsx
<fieldset>
  <legend className="text-sm font-medium">우선순위</legend>
  <div role="radiogroup" className="flex gap-2" onKeyDown={handleArrowKeys}>
    {(['high', 'medium', 'low'] as const).map((p) => (
      <button
        key={p}
        type="button"
        role="radio"
        aria-checked={value === p}
        onClick={() => onChange(p)}
        className={priorityBadgeClass(p, value === p)}
      >
        {p === 'high' ? 'High' : p === 'medium' ? 'Medium' : 'Low'}
      </button>
    ))}
  </div>
</fieldset>
```

### Combobox 컴포넌트

```tsx
type ComboboxProps<T> = {
  options: T[];
  value: T | null;
  onChange: (v: T | null) => void;
  getId: (t: T) => string;
  getLabel: (t: T) => string;
  placeholder?: string;
};
// 구현: input 값 / open / activeIndex state, ArrowUp/Down/Enter/Esc 키보드, 외부 클릭 닫기
```

### TodoItem props 확장

```tsx
{priority ? (
  <span className={priorityBadgeClass(priority, true)}>
    {priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low'}
  </span>
) : null}
{carryOverCount && carryOverCount > 0 ? (
  <span className="text-xs text-periwinkle-400" aria-label={`이월 ${carryOverCount}회`}>
    +{carryOverCount}
  </span>
) : null}
```

### Pretendard 폰트

```tsx
// apps/web/src/app/layout.tsx
import localFont from 'next/font/local';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

// <html className={pretendard.variable}>
```

```js
// packages/config/tailwind.config.js
fontFamily: {
  sans: ['var(--font-pretendard)', 'Pretendard Variable', 'Pretendard', /* fallback chain */],
},
```

## 구현 시 주의사항

1. **TodoItem 은 `packages/ui` 공유 컴포넌트** — 본 sub 에서 props 확장만 허용. mobile 의 RN TodoItem 정합은 본 sub 외부 (후속 mobile sub).
2. **MainDailyView 동시 수정**: Sub-07 (Epic 아코디언) 가 같은 파일을 건드림. **본 sub 가 먼저 머지된 뒤 Sub-07 진입** (충돌 회피).
3. **CategoryFilterChips 의 데이터 소스**: `packages/core` 의 `useCategories(workspace)` 가 Sub-01 단계에 머지됐는지 사전 확인. 미존재 시 본 sub 에서 신설하거나 `useTodos` 결과에서 distinct 추출.
4. **DateNavigator prev/next 의미 단위 변경 (일 → 주/월)**: 호출 측 의존 검증 후 변경. mobile 의 동일 인터랙션 정합은 본 sub 외부.
5. **Priority 색 토큰**: `docs/base/design-system/tokens/` 에 정의되어 있는지 확인. 없으면 본 sub 에서 임시 토큰 추가 + 디자인 시스템 docs 갱신.
6. **Combobox 의존성 결정**: `cmdk` 도입 vs 자체 구현 — Bundle size 영향 검토 후 결정 (사용자 결정 항목).
7. **라벨 정합 결정 (`등록일` vs `기한`)**: prototype 은 "등록일" 텍스트, 도메인은 `due_date` ("이 투두를 보여줄 날짜"). 본 sub 는 도메인 정합 유지 + 시각 레이아웃만 정합 — 사용자 검토 필요.
8. **mobile 정합 분리**: 본 sub 는 web 전용. `apps/mobile/` 의 RN 컴포넌트는 후속 mobile sub 에서 처리.
9. **Pretendard 라이선스**: SIL Open Font License — `apps/web/public/fonts/LICENSE` 동봉 의무.

## 작업

### 사이드바 + chip 필터 + FAB

- [x] `apps/web/src/components/SideNav.tsx` — 로고 아이콘 + 그룹 헤더 + 메뉴별 아이콘 + 분리선 정합
- [x] `apps/web/src/components/CategoryFilterChips.tsx` 신설
- [x] `apps/web/src/components/MainDailyView.tsx` — chip 필터 통합 + FAB `md:hidden` wrap 제거
- [x] (선택) `packages/core/src/hooks/useCategories.ts` 검증 / 신설

### DateNavigator 월간 토글

- [x] `packages/ui/src/DateNavigator.tsx` — 헤더 토글 버튼 + 월간 그리드 + chevron 회전 + Esc 핸들러
- [x] `buildMonthGrid(date)` 함수 (6주 × 7열, 이전/다음 달 padding)
- [x] prev/next 의미 단위 (주/월) 변경

### 카드 메타

- [x] `packages/ui/src/TodoItem.tsx` — `priority` / `carryOverCount` props 확장 + badge 렌더
- [x] `apps/web/src/components/{TodoSection,DoneSection}.tsx` — 섹션 헤더 시각 (완료 50% opacity)
- [x] `apps/web/src/components/MainDailyView.tsx` — TodoItem 호출 측 props 전달
- [x] priority 색 토큰 (`packages/config/tailwind.config.js` 또는 `globals.css`)

### 모달 revamp

- [x] `apps/web/src/components/ui/Combobox.tsx` 신설 (또는 `cmdk` 도입)
- [x] `apps/web/src/components/modals/CreateTodoModal.tsx` — priority radio group + 분류 combobox
- [x] `apps/web/src/components/modals/TodoDetailModal.tsx` — 동일 정합

### 폰트

- [x] Pretendard Variable woff2 번들 (`apps/web/src/app/fonts/`)
- [x] `apps/web/src/app/layout.tsx` — `next/font/local`
- [x] `packages/config/tailwind.config.js` — `fontFamily.sans` 토큰 정합
- [x] `apps/web/public/fonts/LICENSE` — SIL OFL 동봉

### 테스트

- [x] DateNavigator 단위 테스트 — 토글 + 월간 셀 클릭 + Esc
- [x] TodoItem 단위 테스트 — priority badge / carry-over 분기
- [x] Combobox 단위 테스트 — 자동완성 + 키보드
- [x] Priority radio group 단위 테스트 — 키보드 ArrowLeft/Right

## 검증 기준

### 자동 (linter / type-check / 단위)

- `make lint` / `make build` 통과
- 단위 테스트 신규/갱신 모두 통과

### 수동 (시각·인터랙션)

- 데스크탑(`md:` 이상):
  - 사이드바 로고/아이콘/그룹 헤더/분리선이 prototype 정합
  - 메인 뷰 상단 chip 필터 노출 ("전체" 활성 시작), 클릭 시 todos 클라이언트 필터링
  - DateNavigator 헤더 클릭 → 월간 그리드 펼침, chevron 회전, Esc 닫힘
  - 일반 카드에 priority badge / carry-over `+N` 뱃지 prototype 정합
  - 완료 섹션 헤더 50% opacity, 진행 중 섹션 활성
  - CreateTodoModal: priority 3 badge + 분류 combobox 자동완성 동작
  - FAB 우측 하단 노출
- 모바일(`<md:`): 기존 `MobileTabBar` 동작 유지 (regression 0), chip 필터 가로 스크롤
- 브라우저 DevTools 의 Computed `font-family` 첫 항목이 `Pretendard Variable`
- 키보드 only 로 모든 인터랙션 가능 (chip / 토글 / 모달 필드)
- Lighthouse Accessibility ≥ 95 유지

## 미해결 / 사용자 결정 필요

- 라벨 정합 ("등록일" vs "기한") — 본 sub 진입 시 결정 후 적용
- Combobox 의존성 (`cmdk` vs 자체 구현)
- DateNavigator prev/next 의미 단위 변경의 mobile 영향 (mobile 동시 진행 / 후속 분리)
