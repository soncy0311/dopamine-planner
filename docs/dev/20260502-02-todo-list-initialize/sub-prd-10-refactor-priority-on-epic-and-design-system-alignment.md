# SUB-PRD: priority Epic 이전 + design-system 정합 (잔존 정책 격차 해소)

## 작업 정보

- **작업명**: `refactor/priority-on-epic-and-design-system-alignment`
- **작업 유형**: `refactor` + `db` (DB 컬럼 이전 + 도메인/서비스/UI 정합)
- **시작일**: 2026-05-07
- **최신 업데이트**: 2026-05-07
- **상태**: 구현 완료 — Phase 1~5 30개 task 실행 완료 (typecheck/build/test 통과)
- **Main PRD**: [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md)
- **선행 Sub-PRD**: Sub-01 (core service) / Sub-02 (web 메인 뷰) / Sub-03 (web 관리) / Sub-06 (prototype 시각 정합) / Sub-07 (Epic 아코디언) / Sub-08 (Empty / Loading / Toast) / Sub-09 (모달·DB·설정 정합)

## 배경 및 목적

`docs/base/design-system/` 와 `docs/base/prototype/` 가 새 정책으로 정합된 반면, 소스 코드(`apps/web`, `apps/mobile`, `packages/core`, `packages/ui`, `supabase/migrations`) 는 이전 모델·UI 잔존 상태. 디자인 SoT 가 명세 문서이므로 **코드를 정책 측에 정합** 시키는 게 본 sub 의 목표.

### 식별된 격차

| # | 정책 (design-system / prototype) | 현재 코드 | 영향 |
|---|---|---|---|
| 1 | `priority` 는 `epic_issue` 단위. Sub 는 상속 ([`issue-creation.md`](../../base/design-system/components/issue-creation.md) §1) | `sub_issue.priority` 컬럼 (`001_initial_schema.sql:106`). `epic_issue.priority` 부재 | DB · types · core · ui · web · mobile |
| 2 | Sub 폼: 상위 Epic readonly + 제목 + 설명 + 등록일 | web `SubIssueFormModal` priority 라디오 / mobile `sub-issue-form.tsx` priority 필드 + description 부재 | web · mobile |
| 3 | Epic 폼: 제목 + 설명 + 우선순위 + 분류 + 등록일 | web `EpicFormModal` priority 라디오 있으나 DB 저장 미연동 / mobile `EpicForm` priority 부재 | web · mobile |
| 4 | AddButton: 텍스트 `+ 추가` 단독, SVG 동반 금지 | web `MainDailyView` 의 추가 버튼이 SVG plus + "추가" | web 1곳 |
| 5 | TodoItem (`packages/ui`) priority badge 미노출 ([`issue-creation.md`](../../base/design-system/components/issue-creation.md) §1.1) | `TodoItem.tsx` 의 `priority` prop + 배지 렌더 | ui · web · mobile 호출 측 |
| 6 | Settings: 프로필 / 테마 / 정보 3 블록. "앱" 부재 | web `(main)/settings/page.tsx` "앱" 섹션 — "테마 — 곧 제공 예정" disabled / mobile settings 미확인 | web · mobile |
| 7 | EpicCard 헤더 priority badge 노출 | `EpicAccordionCard` priority prop 부재 | ui · web · mobile |
| 8 | (이미 정합 완료 — 검증) Carry-over `+N` / 카테고리 dot 제거 / Empty state 카피 / Epic 관리 페이지 부재 | 모두 일치 (`51931cf`) | 검증 1회 |
| 9 | prototype 메인 화면의 카드 컴포넌트 명명: `IssueCard` (Sub 0개) / `IssueCardAccordion` (Sub n개) — `proto-issue-card{,-accordion}` (prototype `page-prototypes.html`, organisms.css §IssueCard/IssueCardAccordion). prototype `proto-epic-card` 는 `organisms.html` 데모 전용으로 메인 화면 미사용 | 코드 / `components.md` 모두 `EpicAccordionCard` / `EpicCard` 명명 | docs (components.md `EpicCard` → `IssueCard*`) · ui (`EpicAccordionCard` rename) · web · mobile (호출 측 동반 rename) |
| 10 | prototype TodoItem 마크업: grid 2-row — `proto-todo-item-tags` (priority + category 배지) = `grid-row: 1`, `proto-todo-item-title` = `grid-row: 2`. 즉 **태그가 제목 위** (`molecules.css:27-47`) | 현재 `packages/ui/src/TodoItem.tsx` 가 단일 row 인라인 — title 옆 inline badge | ui (TodoItem 재구조) |
| 11 | prototype FilterChips: `border: 1px solid var(--color-border-default)` + `border-radius: var(--radius-full)` + `padding: var(--spacing-1) var(--spacing-3)` + `background: var(--color-bg-elevated)` + `color: var(--color-text-secondary)`. Active = `background: var(--badge-bg)` + `color: var(--badge-text)` + `border-color: var(--badge-bg)` (`molecules.css:582-605`) | 현재 `apps/web/src/components/CategoryFilterChips.tsx` — border 부재 + `bg-periwinkle-100` 비활성 + `bg-purple-500 text-white` 활성. token 격차 (border, bg, active 색) | web (CategoryFilterChips) · mobile (동등 컴포넌트 검증/추가) |
| 12 | prototype DateNavigator: header (`btn-prev` + `toggle[title + chevron-down]` + `btn-next`) + week strip (`day-label` 위 + `day-num` 32px `radius-full`) + expanded calendar (36px cells). 활성 = `bg-interactive-primary + text-inverse + filled circle`, today = `border 1.5px interactive-primary + interactive-primary text + ring` (`molecules.css:139-310`) | 현재 `packages/ui/src/DateNavigator.tsx` — ←/→ 텍스트 화살표 (lucide ChevronLeft/Right 미사용), week strip day cell 구조 (label + num 분리 vs 통합), today 시각 (`ring` 부재), selected 시각 (네모 vs circle), 헤더 toggle (`ChevronDown` 회전 동작은 일치) 격차 | ui (DateNavigator) |
| 13 | prototype SegmentedProgressBar: `gap: 2px` + segment height `8px` + `border-radius: var(--radius-full)` + (track) `var(--color-bg-surface)` / (filled) `var(--color-interactive-primary)`. percent text 는 progress bar 옆 가로 정렬 (`organisms.css:368-385`, `progress-bar.md`) | 현재 `packages/ui/src/EpicProgressBar.tsx` — `gap-1` (4px) + `rounded-sm` (4px) + `bg-periwinkle-200 / bg-purple-500`. percent text 는 컴포넌트 외부 (호출자가 별도 렌더). 토큰·반경·gap 격차 | ui (EpicProgressBar / 명명 SegmentedProgressBar 정합 검토) |

priority 위치 이전(§1) 이 가장 큰 변경. 본 sub 는 상기 7개 (정합 완료 1건의 회귀 검증 포함) + prototype 시각 정합 5건을 한 호흡으로 처리한다.

> **본 sub 범위 vs Sub-11 분리 결정**: 격차 #9~#13 은 시각·명명 광범위 변경. 본 sub 안에서 처리하면 atomic 머지가 어려워질 수 있어 별도 Sub-11 (`refactor/prototype-visual-alignment`) 로 분리 가능. 잠정 — 본 sub 에 모두 포함하되, §사용자 결정 §C 에서 명명 격차 결정에 따라 분리 여부 재검토.

## 사용자 결정 (확정)

| 결정 | 선택 | 비고 |
|---|---|---|
| 기존 sub priority 데이터 처리 | **모두 `medium` default 로 초기화** (값 보존 X) | 컬럼 자체를 drop. 별도 백업 컬럼 미신설 — Epic 단위 의미가 없으므로 보존 가치 0. |
| 테마 섹션 동작 범위 | **라벨만 placeholder** (`"시스템"` 고정, 클릭 disabled) | 실 토글 동작은 후속 sub 검토 (시스템/라이트/다크 + 영속화 + Tailwind dark variant + RN appearance) |
| Sub 폼 상위 Epic 표시 | **readonly input** ([`issue-creation.md`](../../base/design-system/components/issue-creation.md) §3.2 정합) | `readonly` + `aria-readonly="true"` + `bg-subtle` |
| 모바일 Sub 폼 description | **본 sub 에서 추가** | 정책 정합 (web 폼은 이미 description 있음) |

## 사용자 결정 필요 (격차 #9~#13 — 잠정안 제시)

격차 #9~#13 는 정책 SoT 자체의 모호성을 동반한다. 잠정안을 따라 구현하되, 사용자 검토 후 본 sub 범위 / 분리 여부 / 정책 우선순위 재확정.

| 항목 | 잠정안 | 대안 | 영향 |
|---|---|---|---|
| **A. 격차 #9 — EpicCard 명명** | (a) **prototype 정합** — `components.md §EpicCard` → `§IssueCardAccordion` rename + 코드 `EpicAccordionCard` → `IssueCardAccordion` rename | (b) prototype 을 design-system 에 정합 — `proto-issue-card-accordion` → `proto-epic-card-accordion` rename (prototype 갱신) | (a) 코드 광범위 rename / (b) prototype CSS·HTML 갱신만 |
| **B. 격차 #10 — TodoItem 표시 정책** | priority/category 배지를 prototype 의 grid 2-row 마크업으로 옮기되, **본 sub §1 정책 (priority Sub 행 미노출)** 는 유지. 즉 row 1 에는 **category 배지만** 노출. (`components.md §EpicCard.헤더 표시 정책` 의 "Sub 행 priority/category 배지 미노출" 은 **EpicAccordion 안의 sub 행에 한정** 으로 해석. stand-alone TodoItem 은 prototype 마크업 정합) | (a) Sub 행은 EpicAccordion 안이든 stand-alone 이든 priority/category 모두 미노출 (components.md §EpicCard 정합 — Sub 단위 시각 정보 0) / (b) 모두 prototype 정합 (priority 도 Sub 행에 노출) | 현재 잠정안: stand-alone 만 grid 2-row + category. EpicAccordion 안 sub 행은 title + checkbox 만. priority 는 Epic 헤더 배지 단일 SoT |
| **C. 격차 #9~#13 본 sub 포함 여부** | **본 sub 에 모두 포함** — atomic 정합. typecheck pass 가능하면 1 PR 로 머지 | (b) 격차 #9~#13 만 분리해 Sub-11 신설 — 명명 변경이 코드 광범위 영향이라 별도 PR 로 머지 안전성 확보 | (b) 선택 시 본 sub 는 priority Epic 이전 + 잔존 정책 격차 7건 으로 축소, sub-prd-10 의 §8 ~ 검증 항목 §8 부분은 sub-11 로 이동 |
| **D. FilterChips active 토큰** | `--badge-bg` / `--badge-text` (prototype 정합) | `--color-interactive-primary` / `--color-text-inverse` (현 코드 / `components.md §FilterChips.상태` 정합 — components.md 와 prototype 사이 자체 격차) | components.md §FilterChips.상태 도 동시 갱신해 SoT 통일 필요 (정책 명세 자체가 prototype 과 어긋남) |
| **E. Mobile 시각 정합 범위** | mobile RN 컴포넌트는 **본 sub 에서 시각 토큰만 정합** (className 매핑). 마크업 구조 (grid 2-row 등) 가 RN 에서 동일하지 않아 RN 적합 형태로 변환 (예: `flex-col` 로 tags row + title row) | mobile 은 Sub-11 후속에서 일괄 — RN 시각 검증을 일괄 처리 | 현재 잠정안: 본 sub 에서 web priority + 시각 정합 + mobile priority + 마크업 구조 정합. mobile 시각 토큰 미세 조정은 RN 시뮬레이터 검증과 함께 본 sub 안에서 처리 |

## 기술 스택

| 영역 | 기술 |
|---|---|
| DB | Supabase Postgres — 마이그레이션 신설 (`013_*`) |
| 도메인 / 서비스 | `packages/core/src/{domain,services,__tests__}` |
| 공유 UI | `packages/ui/src/{TodoItem,EpicAccordionCard}.tsx` |
| web | `apps/web/src/components/{modals/*,MainDailyView}.tsx`, `apps/web/src/app/(main)/settings/page.tsx`, `apps/web/src/lib/forms/schemas.ts` |
| mobile | `apps/mobile/src/app/{epic-form,sub-issue-form}.tsx`, `apps/mobile/src/components/forms/EpicForm.tsx`, `apps/mobile/src/components/{MainDailyViewMobile,EpicAccordionCard,TodoItem}.tsx`, `apps/mobile/src/app/(main)/settings/`, `apps/mobile/src/lib/forms/schemas.ts` |
| 디자인 SoT | (이미 정합 완료 — 본 sub 에서 추가 갱신 없음) |

## 핵심 요구 사항

### 1. DB 마이그레이션 신설

**`013_move_priority_to_epic_issue.sql`** (신설)

- `ALTER TABLE epic_issue ADD COLUMN priority priority NOT NULL DEFAULT 'medium';`
- `ALTER TABLE sub_issue DROP COLUMN priority;`
- 인덱스: `sub_issue` priority 관련 인덱스 없음(검증). `epic_issue` priority 검색용 인덱스는 미신설(현재 정렬·필터 요구사항 부재 — 후속 sub 에서 정렬 도입 시 검토)
- 데이터 손실: 기존 sub_issue priority 값은 drop 와 함께 폐기. Epic 모두 `medium` default 로 초기화.

**머지 후속 작업**

- `make sb-gen-types` → `packages/shared/src/database.ts` 재생성 (`epic_issue.priority` 추가, `sub_issue.priority` 제거 반영)
- `supabase/seed.sql` 의 sub_issue / epic_issue 시드가 priority 사용 시 갱신

### 2. 도메인 / service / hooks 갱신 (`packages/core`)

| 파일 | 변경 |
|---|---|
| `domain/todo.ts` | `SubIssue.priority` 제거, `mapSubIssueRow` 에서 `row.priority` 매핑 삭제 |
| `domain/epic.ts` | `EpicIssue.priority: Priority` 추가, `mapEpicRow` 에서 `row.priority` 매핑 추가, `Priority` 타입 export |
| `services/todo.ts` | `create` / `update` 의 payload 형 변경에 따른 인자 갱신 (`TodoInsert` / `TodoUpdate` 가 자동으로 priority 미포함). `cascadeToggleEpic` 영향 없음 (priority 미사용 — 검증) |
| `services/epic.ts` | `create` / `update` 가 `EpicInsert` / `EpicUpdate` 통해 priority 자동 수용 (별도 수정 불요 — 타입이 알아서 따라옴) |
| `__tests__/cascadeToggleEpic.test.ts` | `subs[].priority` payload 제거 (mock row 형 변경 반영) |
| `__tests__/groupByEpic.test.ts` | Epic priority prop 영향 검증 — Epic mock 에 priority 추가 필요 시 보강 |

### 3. 공유 UI 컴포넌트 갱신 (`packages/ui`)

#### 3.1 `TodoItem.tsx`

- `priority?: TodoItemPriority | null` prop 제거
- `PRIORITY_LABEL` / `priorityBadgeClass` / 배지 렌더 블록 (현 라인 112~119) 모두 제거
- `TodoItemPriority` 타입은 `EpicAccordionCard` 가 import 하지 않으면 전체 제거 (의존성 검증 후 결정)

#### 3.2 `EpicAccordionCard.tsx`

- `EpicAccordionCardProps` 에 `priority?: 'high' | 'medium' | 'low'` 추가
- 헤더 영역에 priority badge 렌더 ([`components.md`](../../base/design-system/components.md) §EpicCard / [`issue-creation.md`](../../base/design-system/components/issue-creation.md) §1 정합)
  - 위치: 카테고리 dot 옆 또는 progress 좌측 (디자인 결정자 합류 후 시각 미세 조정)
  - 토큰: `bg-priority-{p}-bg text-priority-{p}` (`TodoItem` 에서 옮긴 `priorityBadgeClass` 패턴 재사용)
- `EpicAccordionSubIssue` 타입의 `priority?: TodoItemPriority | null` 제거 + `subIssues.map` 의 `<TodoItem priority={s.priority} />` 제거

#### 3.3 회귀

- `__tests__/EmptyState.test.tsx` 외 회귀 영향 없음 (검증)

### 4. web 모달 / 폼 / Settings 정합 (`apps/web`)

#### 4.1 `MainDailyView.tsx`

- 추가 버튼 SVG 제거 (현 라인 260~274). 텍스트 `+ 추가` 단독 ([`issue-creation.md`](../../base/design-system/components/issue-creation.md) §2 AddButton 정합)
- `EpicAccordionCard` 호출에 `priority={epic.priority}` 추가
- `subIssues.map` 에서 `priority` prop 제거 (TodoItem 인터페이스 변경 동반)
- `standaloneTodo` / `standaloneDone` 의 `<TodoItem priority={item.priority} />` 제거

#### 4.2 `modals/EpicFormModal.tsx`

- 기존 priority radiogroup 유지 (정책 정합)
- `useCreateEpic` 호출 payload 에 `priority` 추가 (현 누락 — 라인 65~70 갱신)
- 기본값 `medium`

#### 4.3 `modals/EpicDetailModal.tsx`

- priority 필드 (`PriorityRadioGroup`) 추가 — Epic 편집 시 변경 가능
- `useUpdateEpic` 의 `patch` 에 `priority` 포함
- `EpicEditSchema` 에 `priority: z.enum(['high','medium','low'])` 추가
- `fetchEpicDetail` select 절에 `priority` 추가, `EpicDetailFetch` 타입 갱신

#### 4.4 `modals/SubIssueFormModal.tsx`

- priority 라디오 그룹 제거 (현 라인 142~146)
- `Dialog.Description` 의 Epic 표기를 readonly input 으로 변환 (`readonly` + `aria-readonly="true"` + `bg-periwinkle-100` 또는 토큰 `bg-subtle` 매핑)
- `SubIssueFormSchema` 에서 `priority` 필드 제거 (현 라인 17, 42, 73)
- `create.mutateAsync` payload 의 `priority: values.priority` 제거

#### 4.5 `modals/TodoDetailModal.tsx`

- priority 필드 / `PriorityRadioGroup` 제거
- `SubIssueEditSchema` 에서 `priority` 제거
- `fetchTodoDetail` select 절에서 `priority` 제거, `TodoDetailFetch` 타입 갱신
- `update.mutateAsync` 의 `patch.priority` 제거

#### 4.6 `lib/forms/schemas.ts`

- `TodoFormSchema.priority` 제거
- `EpicFormSchema.priority: z.enum(['high','medium','low'])` 추가

#### 4.7 `app/(main)/settings/page.tsx`

- `<SettingsSection title="앱">` → `<SettingsSection title="테마">` rename
- 행 변경: `<SettingsRow label="테마" value="곧 제공 예정" disabled />` → `<SettingsRow label="화면 모드" value="시스템" disabled />`

### 5. mobile 모달 / 폼 / Settings 정합 (`apps/mobile`)

#### 5.1 `lib/forms/schemas.ts`

- `TodoFormSchema.priority` 제거
- `EpicFormSchema.priority: z.enum(['high','medium','low'])` 추가

#### 5.2 `app/sub-issue-form.tsx`

- `SubIssueFormSchema.priority` 제거 (현 라인 13, 40, 64) + payload 의 `priority` 제거 (라인 64)
- priority radiogroup `<Controller name="priority" />` 블록 제거 (현 라인 98~121)
- description textarea 추가 (정책 정합 — title 아래에 `<TextInput multiline />` 형태)
- 상위 Epic 표기를 readonly input 으로: 현재 `<Text>Epic: {epicTitle}</Text>` (라인 77~79) → `readonly TextInput` (`editable={false}` + `accessibilityState={{ disabled: true }}`)
- `SubIssueFormSchema` 에 `description: z.string().max(2000).optional()` 추가
- `defaultValues` / `mutateAsync` payload 에 description 반영

#### 5.3 `app/epic-form.tsx` + `components/forms/EpicForm.tsx`

- priority radiogroup 추가 — 3 옵션 라벨 (High / Medium / Low). default `medium`
- `EpicFormSchema.priority` zod enum 정합
- `useCreateEpic` / `useUpdateEpic` payload 에 priority 추가
- 편집 모드 진입 시 server priority 값으로 default 채움

#### 5.4 `components/MainDailyViewMobile.tsx`

- `EpicAccordionCard` 호출에 `priority={epic.priority}` 전달
- Sub 행 (`TodoItem`) priority prop 제거

#### 5.5 `components/EpicAccordionCard.tsx` (mobile)

- `priority?: 'high'|'medium'|'low'` prop 받아 헤더에 표시 (RN 토큰 매핑 — Nativewind className 사용)

#### 5.6 `components/TodoItem.tsx` (mobile)

- priority badge 렌더 / prop 제거 (잔존 시 정리)

#### 5.7 mobile Settings

- `apps/mobile/src/app/(main)/settings/` (또는 동등 라우트) — "앱" → "테마" rename + value placeholder `"시스템"` + disabled

### 6. 호출 측 검증 (회귀 0건 확인)

- web Sub 행 priority 미노출 — 일자 뷰 / 카드 펼침 시 시각 비교
- web AddButton SVG 제거 후 데스크탑 우상단 버튼이 텍스트 단독
- mobile 동일 검증 (시뮬레이터)
- carry-over `+N` 뱃지 / 카테고리 dot 제거 / Empty state 카피 / Epic 관리 페이지 부재 — 모두 회귀 0 (`51931cf` 정합 유지 확인)

### 7. main-prd 표 갱신

- `docs/dev/20260502-02-todo-list-initialize/main-prd-todo-list-initialize.md`
  - L272 의 sub-PRD 섹션 헤더 카운트 갱신: `(9개 — Sub-01~05 = 1차 / Sub-06~08 = prototype 정합 후속 / Sub-09 = 모달·DB·설정 정합)` → `(10개 — ... / Sub-10 = priority Epic 이전 + 잔존 정책 정합)`
  - L289 (Sub-09 행 뒤) 에 Sub-10 행 삽입 — 산출물 / 의존 명시

### 8. prototype 시각 정합 (격차 #9~#13)

#### 8.1 명명 정합 (격차 #9 — 사용자 결정 §A 의 잠정안 채택 시)

- `docs/base/design-system/components.md` §3 Organisms `EpicCard` → `IssueCardAccordion` rename + 설명 갱신 (Sub 0개 / Sub n개 변형 명시 — prototype 과 정합). Sub 0개 변형은 별도 `IssueCard` (Atom 또는 Molecule — prototype 분류 검증 후 결정).
- `packages/ui/src/EpicAccordionCard.tsx` → `packages/ui/src/IssueCardAccordion.tsx` rename + export 명 변경. `index.ts` re-export 갱신.
- `apps/web/src/components/MainDailyView.tsx` / `apps/mobile/src/components/MainDailyViewMobile.tsx` / `apps/mobile/src/components/EpicAccordionCard.tsx` import/사용처 동반 rename.
- 호출 측 prop 시그니처 (`epicId` 등) 는 의미 그대로 유지. 명명만 컴포넌트 단위에서 정합.
- Sub-11 분리 시 본 항은 sub-11 로 이동.

#### 8.2 TodoItem 마크업 재구조 (격차 #10)

- `packages/ui/src/TodoItem.tsx` 를 prototype `proto-todo-item` 마크업에 정합:
  - 컨테이너: `display: grid; grid-template-columns: auto 1fr auto; row-gap: 2px; column-gap: --spacing-3; align-items: center; min-height: 48px;`
  - 체크박스: `grid-row: 2; grid-column: 1`
  - tags 영역: `grid-row: 1; grid-column: 2; display: flex; gap: --spacing-1` — **category 배지만** 렌더 (priority 는 본 sub §1 정책상 미노출)
  - title: `grid-row: 2; grid-column: 2`
  - carry-over `+N` 배지 / chevron: `grid-row: 2; grid-column: 3`
- 사용자 결정 §B 잠정안: stand-alone TodoItem 만 grid 2-row + category 배지 노출. EpicAccordion 안 sub 행은 title 만 표시 (현 `EpicAccordionCard` 의 sub 렌더와 정합). 따라서 `TodoItem` 자체는 grid 2-row 단일 형태로 갱신하되, 호출 측 (`EpicAccordionCard` sub 렌더) 은 category prop 미주입으로 row 1 자동 비표시.
- `TodoItem.category` prop 시그니처 유지 (이미 존재). `priority` prop 은 본 sub §3.1 에서 제거 — 격차 #10 와 §1 정합.

#### 8.3 FilterChips 토큰 정합 (격차 #11)

- `apps/web/src/components/CategoryFilterChips.tsx`:
  - 비활성 칩: `border border-periwinkle-200 bg-white text-periwinkle-500 rounded-full h-8 px-3 text-xs hover:bg-periwinkle-100`
  - 활성 칩: `border` 색을 `--badge-bg` 매핑 색 (web Tailwind 토큰 — 디자인 결정자 합류 후 확정. 잠정 — `bg-purple-100 text-purple-700 border-purple-100`. components.md §Badge.토큰 의 `--badge-bg / --badge-text` 와 정합)
  - "전체" 칩 동등 처리
- mobile 동등 컴포넌트 (있을 시) 동일 갱신.
- 사용자 결정 §D — `--badge-bg/--badge-text` 채택 시 components.md §FilterChips.상태 도 동시 갱신 ("`--color-interactive-primary` 배경 + `--color-text-inverse`" → "`--badge-bg` + `--badge-text`")

#### 8.4 DateNavigator 시각 정합 (격차 #12)

- `packages/ui/src/DateNavigator.tsx`:
  - 좌/우 화살표: 텍스트 `←/→` → `lucide-react` 의 `ChevronLeft` / `ChevronRight` (현 import 패턴은 `ChevronDown` 만 — 추가 import)
  - week strip day cell: 현 `flex-col [10px label + 14px num]` → `gap 2px + day-label (font-xs, text-secondary, weight-medium) + day-num 32px circle (radius-full + font-sm)` — `proto-date-nav-day` 정합
  - selected 상태: `bg-purple-500 text-white` + `radius-full` 32px circle (`day-num` 단위에 적용)
  - today 상태: `border 1.5px purple-500 + text-purple-500 + weight-semibold` (`proto-date-nav-day-today` 정합 — 현재 today 시각 부재)
  - 확장 시 calendar grid: 36px cell + `radius-full` (`day-num` 과 동일 시각 토큰 — 현재 `rounded-md` 격차)
- `today` 판정 로직 추가 (`new Date().toISOString().slice(0,10)` 비교)

#### 8.5 SegmentedProgressBar 정합 (격차 #13)

- `packages/ui/src/EpicProgressBar.tsx`:
  - segment gap `gap-1 (4px)` → `gap-[2px]` (prototype 정합)
  - segment radius `rounded-sm (4px)` → `rounded-full`
  - segment 색: `bg-periwinkle-200` (track) → `bg-periwinkle-100` 또는 `--color-bg-surface` 토큰 매핑 / `bg-purple-500` (filled) 유지
  - height `h-2 (8px)` 유지 (prototype 8px 정합)
- 컴포넌트 명명: `EpicProgressBar` → `SegmentedProgressBar` rename 검토 (`components.md §SegmentedProgressBar` 와 정합). 단, fallback `linear` variant 도 같은 컴포넌트가 흡수 (components.md §EpicCard.진행률) — `variant: 'segmented' | 'linear'` 단일 컴포넌트 유지가 깔끔. 잠정 — 명명 rename + variant prop 추가 (`SegmentedProgressBar` 가 기본, `linear` 는 fallback)
- percent text: 현재 컴포넌트 외부 (호출자) 가 별도 렌더 → `SegmentedProgressBar` 가 percent text 까지 흡수 검토 (components.md §SegmentedProgressBar.구성 정합). 또는 호출 측에서 가로 정렬 (`flex items-center gap-2`) 유지하고 컴포넌트는 bar 만 — 호출자 일관성 우선해 잠정 후자 채택.

## 구현 시 주의사항

1. **마이그레이션 머지 순서 강제**: 013 → core types regen → core domain → ui → web → mobile. 각 단계 종료 시 `make typecheck` pass 필수. 순서 깨지면 build/typecheck 광범위 깨짐 발생.
2. **build 깨짐 방지**: `mapSubIssueRow` 에서 `row.priority` 참조가 남으면 sb-gen-types 후 type 에 priority 가 사라져 컴파일 실패. 마이그레이션 적용 전에 `domain/todo.ts` 를 먼저 정리하면 row type 이 still 옛 형태라 또 깨짐 — 따라서 **mig 적용 + types regen + domain 정리 + service 정리** 를 한 번의 atomic 변경으로 묶는다.
3. **mobile description 폼 fields 일관성**: web Sub 폼은 description 있음. mobile sub-issue-form 만 부재 — 정책 정합 동시에 web 폼 필드 라벨 / 글자수 제한 / placeholder 톤도 일치시킨다 (200/2000자).
4. **Epic priority 기본값 = `medium`**: Epic 생성 모달은 이미 라디오 default `medium`. EpicDetailModal 도 동일 default. 마이그레이션의 `DEFAULT 'medium'` 와 정합.
5. **EpicCard priority badge 디자인**: 위치 / 색은 잠정. 디자인 결정자 합류 시 시각 미세 조정 가능 (component.md §EpicCard 후속 갱신).
6. **mobile RN priority 토큰**: web 의 `bg-priority-{p}-bg` 등 Tailwind class 가 nativewind 로 동일하게 적용되는지 검증. 누락 시 직접 hex 매핑 (단기) + 디자인 토큰 SoT 갱신 (후속) 으로 처리.
7. **테마 섹션 disabled 라벨**: "시스템" 고정 + 클릭 비활성. 사용자가 누르려 시도 시 시각적 피드백 0 (별도 toast 불요).
8. **정책 미정 항목**: Sub 단위 priority 가 다시 필요해질 경우의 마이그레이션 전략은 본 sub 범위 밖 (후속 결정).
9. **회귀 시나리오 강제 실행**: Realtime sync (다른 디바이스에서 Epic priority 변경 즉시 반영), carry-over RPC priority 의존 0 확인 (`007_carry_over_semantic_change.sql` 본문 검증).
10. **task 분해 시 영역 격리**: DB / core / ui / web / mobile / docs 6 영역 — 한 atomic 커밋이 두 영역을 동시에 건드리지 않도록 분리 권장 (build 깨짐 회피 1번 사항 예외 — 그 한 변경은 atomic 묶음).

## 작업

### DB 마이그레이션 (1)

- [x] `supabase/migrations/013_move_priority_to_epic_issue.sql` — priority 컬럼 epic 이전 + sub drop
- [x] `make sb-reset` + `make sb-gen-types` → `packages/shared/src/database.ts` 갱신

### 도메인 / 서비스 (2)

- [x] `packages/core/src/domain/todo.ts` — `SubIssue.priority` 제거, mapper 갱신
- [x] `packages/core/src/domain/epic.ts` — `EpicIssue.priority` 추가, mapper 갱신, `Priority` 타입 export
- [x] `packages/core/src/__tests__/cascadeToggleEpic.test.ts` + `groupByEpic.test.ts` — payload 형 변경 반영

### 공유 UI (2)

- [x] `packages/ui/src/TodoItem.tsx` — priority prop / 배지 렌더 제거
- [x] `packages/ui/src/EpicAccordionCard.tsx` — priority prop 추가 + 헤더 badge 렌더 + sub 의 priority prop 제거

### web (5)

- [x] `apps/web/src/components/MainDailyView.tsx` — AddButton SVG 제거, EpicCard priority 전달, Sub priority 제거
- [x] `apps/web/src/components/modals/EpicFormModal.tsx` — `useCreateEpic` 에 priority 전달
- [x] `apps/web/src/components/modals/EpicDetailModal.tsx` — priority 필드 + `useUpdateEpic` 연동 + schema 갱신
- [x] `apps/web/src/components/modals/SubIssueFormModal.tsx` — priority 라디오 제거 + Epic readonly input 변환 + schema priority 제거
- [x] `apps/web/src/components/modals/TodoDetailModal.tsx` — priority 필드 제거 + schema 갱신
- [x] `apps/web/src/lib/forms/schemas.ts` — TodoForm priority 제거 / EpicForm priority 추가
- [x] `apps/web/src/app/(main)/settings/page.tsx` — "앱" → "테마" rename + value placeholder

### mobile (4)

- [x] `apps/mobile/src/lib/forms/schemas.ts` — TodoForm priority 제거 / EpicForm priority 추가
- [x] `apps/mobile/src/app/sub-issue-form.tsx` — priority 제거 + description 추가 + 상위 Epic readonly input
- [x] `apps/mobile/src/app/epic-form.tsx` + `apps/mobile/src/components/forms/EpicForm.tsx` — priority radiogroup + payload 연동
- [x] `apps/mobile/src/components/MainDailyViewMobile.tsx` — EpicCard priority 전달, Sub priority 제거
- [x] `apps/mobile/src/components/EpicAccordionCard.tsx` — priority prop 받아 헤더 표시
- [x] `apps/mobile/src/components/TodoItem.tsx` — priority 잔존 정리
- [x] `apps/mobile/src/app/(main)/settings/` — "앱" → "테마" rename

### docs (1)

- [x] `docs/dev/20260502-02-todo-list-initialize/main-prd-todo-list-initialize.md` — Sub-PRD 표에 Sub-10 행 추가 + 카운트 9 → 10 갱신
- [x] `docs/base/design-system/components.md` — 사용자 결정 §A / §D 채택 시 §EpicCard → §IssueCardAccordion rename + §FilterChips.상태 토큰 갱신

### prototype 시각 정합 (격차 #9~#13)

- [x] §8.1 명명 rename — `EpicAccordionCard` → `IssueCardAccordion` (사용자 결정 §A 잠정안 시) + components.md / 호출 측 동반 rename
- [x] §8.2 `packages/ui/src/TodoItem.tsx` — grid 2-row 마크업 (tags row 1, title row 2)
- [x] §8.3 `apps/web/src/components/CategoryFilterChips.tsx` — border + 토큰 정합
- [x] §8.4 `packages/ui/src/DateNavigator.tsx` — Chevron 아이콘 + week strip day-num circle + today 시각 + calendar cell radius-full
- [x] §8.5 `packages/ui/src/EpicProgressBar.tsx` — gap 2px + radius-full + 명명 검토 (`SegmentedProgressBar`)
- [x] mobile 동등 컴포넌트 시각 정합 (`apps/mobile/src/components/TodoItem.tsx` / `EpicAccordionCard.tsx` / DateNavigator 동등 / FilterChips 동등) — 사용자 결정 §E 잠정안 시 본 sub 안에서 처리

### 검증 (2)

- [x] 자동 — typecheck / unit test / build (web · mobile · core · ui)
- [x] 수동 — 아래 검증 기준 시나리오 전체 통과

## 검증 기준

### 자동

- [x] `make typecheck` (또는 `pnpm --filter @todo-list/{core,ui,web,mobile,shared} run typecheck`) — types 재생성 후 모든 패키지 통과
- [x] `pnpm --filter @todo-list/core test` — `cascadeToggleEpic` / `groupByEpic` 회귀
- [x] `make build` — web 정적 export + mobile metro 번들 통과
- [x] `supabase db diff` — 마이그레이션 013 적용 후 schema drift 0

### 수동 (시각)

- [x] web 메인: `+ 추가` 버튼이 텍스트 단독으로 보임 (SVG 미존재)
- [x] web 메인: Epic 카드 헤더에 priority badge, Sub 행에는 priority 미노출
- [x] web Sub 추가 모달: 상위 Epic 이 readonly input (회색 배경)
- [x] web Sub 추가 모달: priority 입력 부재. 저장 후 sub 정상 생성
- [x] web Epic 추가 모달: priority 라디오 정상 동작 + DB 에 priority 저장
- [x] web Epic 편집 모달: priority 필드 노출 + 변경 후 저장 시 DB 반영
- [x] web Settings: "테마" 섹션, 라벨 "화면 모드 — 시스템", disabled
- [x] mobile 동일 항목 검증 (시뮬레이터)

### 수동 (prototype 시각 정합 — 격차 #9~#13)

- [x] 메인 화면 stand-alone TodoItem: tags 영역 (category 배지) 가 title 위 (grid row 1) 표기. priority 배지 미노출 (§1 정책 정합)
- [x] EpicAccordion 안 sub 행: title 만 표시 (priority/category 모두 미노출)
- [x] FilterChips: 비활성 = border + bg-elevated + text-secondary, 활성 = badge-bg/badge-text + 동일 border 색
- [x] DateNavigator: 좌/우 화살표가 ChevronLeft/Right 아이콘. week strip day cell 의 num 이 32px circle. today = ring (border) 만, selected = filled circle
- [x] DateNavigator 확장 시 calendar cell radius-full (원형) 36px
- [x] SegmentedProgressBar: segment gap 2px + radius-full + height 8px. percent text 와 가로 정렬 일관
- [x] (사용자 결정 §A 잠정안 시) `IssueCardAccordion` 명명으로 코드 / docs 정합 — typecheck pass

### 회귀

- [x] Realtime: 다른 디바이스에서 Epic priority 변경 시 즉시 반영
- [x] carry-over RPC: priority 컬럼 의존 없는지 (`registered_date` 만 사용) — `007_carry_over_semantic_change.sql` 본문 확인
- [x] 기존 sub_issue 데이터의 priority drop 시 데이터 손실 0 (모든 Epic 기본 medium 부여 — 정책 결정 §1)
- [x] sub-prd-09 산출물 회귀 0 (모달 분리 / 분류 Combobox / Settings 프로필 카드)
- [x] sub-prd-08 산출물 회귀 0 (EmptyState / Spinner / Toast)
- [x] sub-prd-07 산출물 회귀 0 (Epic 카드 expand / cascade toggle)

## 미해결 / 후속

1. **테마 토글 실 동작**: 시스템 / 라이트 / 다크 토글 + 영속화 + Tailwind dark variant + RN appearance — 본 sub 범위 밖. Sub-11 후보 (또는 사용자 결정 §C 시 prototype 시각 정합과 통합 sub-11).
2. **Epic 카드 헤더 priority badge 의 시각 디자인**: 위치 / 색 / 토큰. 디자인 결정자 합류 후 미세 조정.
3. **Sub 단위 priority 가 다시 필요해질 경우의 마이그레이션 전략**: 현재 부재. 도메인 요구사항 변경 시 별도 sub.
4. **Epic priority 기반 정렬 / 필터**: 현재 요구사항 부재 — 정렬 도입 시 `epic_issue.priority` 인덱스 신설 필요 여부 검토.
5. **격차 #9 명명 정책 결정 (사용자 결정 §A)**: prototype `IssueCard*` ↔ design-system / 코드 `EpicAccordionCard` 어느 쪽을 SoT 로 둘지. 결정 후 본 sub §8.1 / components.md / ui 패키지 rename 범위 확정.
6. **격차 #10 Sub 행 표시 정책 (사용자 결정 §B)**: stand-alone TodoItem 의 category 배지 노출 여부 / EpicAccordion 안 sub 행의 표시 정보. 본 sub 잠정안: stand-alone 만 prototype 마크업 정합 + category 배지. EpicAccordion sub 는 title 만.
7. **격차 #11 FilterChips 활성 토큰 (사용자 결정 §D)**: components.md §FilterChips.상태 가 `--color-interactive-primary + --color-text-inverse` 로 명시되었지만 prototype 은 `--badge-bg/--badge-text`. SoT 충돌 — 어느 쪽을 채택해 정책 통일할지 결정 필요.
8. **prototype 시각 정합 분리 여부 (사용자 결정 §C)**: 격차 #9~#13 을 본 sub 에 흡수 vs Sub-11 신설. 본 sub 잠정안: 흡수. 분리 시 sub-prd-10 의 §8 / §작업.prototype / §검증.수동(prototype) / §미해결.5~7 부분이 sub-prd-11 로 이동.
9. **mobile 동등 컴포넌트 (FilterChips / DateNavigator)**: 현재 mobile 에 동등 컴포넌트가 있는지 / 없다면 본 sub 에서 추가할지 검증 필요 (`apps/mobile/src/components/` 미확인 항목).

## 위험 / 완화

| 위험 | 완화 |
|---|---|
| `priority` 컬럼 이전 → 광범위 type / build 깨짐 | DB → types regen → core → ui → web → mobile 순서 강제. mig 적용 + types regen + domain/service 정리는 atomic 묶음 (구현 시 주의사항 §2) |
| 기존 sub priority 값 손실 | 사용자 결정 §1 — 의도된 폐기. 별도 백업 컬럼 미신설 |
| Epic priority badge 디자인 미정 | 잠정 토큰 (`bg-priority-{p}-bg text-priority-{p}`) 으로 구현. 디자인 결정자 합류 후 조정 |
| mobile Nativewind priority 토큰 미작동 | 단기 hex 매핑 폴백 + 후속 디자인 토큰 SoT 갱신 |
| Realtime 구독에서 epic priority 변경 미반영 | `subscribeTodos` 가 `epic_issue` 변경도 invalidate 하는지 검증 (Sub-01 산출물). 누락 시 본 sub 범위 안에서 보강 |

## 참고 문서

- [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md) — Sub-PRD 표 갱신 위치
- [`sub-prd-09-feat-issue-flow-and-settings-revamp.md`](./sub-prd-09-feat-issue-flow-and-settings-revamp.md) — 모달 분리 / Settings 정합 패턴 (본 sub 가 priority 격차로 확장)
- [`sub-prd-07-feat-epic-accordion-card.md`](./sub-prd-07-feat-epic-accordion-card.md) — EpicAccordionCard props 보강 패턴
- [`sub-prd-06-feat-web-prototype-visual-alignment.md`](./sub-prd-06-feat-web-prototype-visual-alignment.md) — `+N` 뱃지 / TodoItem 패턴
- [`docs/base/design-system/components/issue-creation.md`](../../base/design-system/components/issue-creation.md) — Epic / Sub 폼 정책 SoT (§1 priority 위치, §3 폼 동작)
- [`docs/base/design-system/components.md`](../../base/design-system/components.md) — Atoms.Badge.priority / Templates.SettingsPage / Organisms.EpicCard / Molecules.{TodoItem,FilterChips,DateNavigator,SegmentedProgressBar}
- [`docs/base/design-system/components/progress-bar.md`](../../base/design-system/components/progress-bar.md) — SegmentedProgressBar 토큰 / variant 정책
- [`docs/base/design-system/tokens.md`](../../base/design-system/tokens.md) — priority 색 토큰
- `docs/base/prototype/pages/page-prototypes.html` — 메인 화면 마크업 (`proto-issue-card{,-accordion}`, `proto-todo-item`, `proto-filter-chip`, `proto-date-navigator`, `proto-epic-progress-segmented`)
- `docs/base/prototype/css/molecules.css` — TodoItem grid 2-row (L6-95), DateNavigator (L139-310), FilterChips (L569-605)
- `docs/base/prototype/css/organisms.css` — IssueCard / IssueCardAccordion (L301-366), SegmentedProgressBar (L368-385)
- `supabase/migrations/001_initial_schema.sql` — sub_issue / epic_issue 스키마 (priority 컬럼 위치)
- `supabase/migrations/007_carry_over_semantic_change.sql` — RPC priority 의존 검증 대상
- `packages/shared/src/database.ts` — 자동 생성 (mig 머지 후 갱신)
- `packages/core/src/{domain/{todo,epic}.ts,services/{todo,epic}.ts}` — domain mapper / service payload
- `packages/ui/src/{TodoItem,EpicAccordionCard,EpicProgressBar,DateNavigator}.tsx` — priority 이전 + prototype 시각 정합 대상
- `apps/web/src/components/{modals/*,MainDailyView,CategoryFilterChips}.tsx`, `apps/web/src/app/(main)/settings/page.tsx`, `apps/web/src/lib/forms/schemas.ts` — web 정합 대상
- `apps/mobile/src/{app/{epic-form,sub-issue-form}.tsx,components/forms/EpicForm.tsx,components/{MainDailyViewMobile,EpicAccordionCard,TodoItem}.tsx,app/(main)/settings/,lib/forms/schemas.ts}` — mobile 정합 대상

---

*이 문서는 todo-list-initialize 프로젝트의 priority 위치 이전 + design-system 잔존 격차 해소 상세 구현 가이드입니다. 전체 프로젝트 내용은 [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md) 를 참조하세요.*
