# SUB-PRD: sub_issue / Epic 모달 분리 + 분류 자유입력 + 설정·관리 페이지 정합

## 작업 정보

- **작업명**: `feat/issue-flow-and-settings-revamp`
- **작업 유형**: `feat` + `refactor` + `db` (스키마 rename + 도메인/UI 구조 재구성 + 페이지 재구현)
- **시작일**: 2026-05-06
- **최신 업데이트**: 2026-05-06
- **상태**: 완료
- **Main PRD**: [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md)
- **선행 Sub-PRD**: Sub-01 (core service) / Sub-02 (web 메인 뷰) / Sub-03 (web 관리) / Sub-06 (prototype 시각 정합) / Sub-07 (Epic 아코디언) / Sub-08 (Empty / Loading / Toast)

## 배경 및 목적

선행 Sub-PRD (02 / 03 / 06 / 07 / 08) 머지 이후 누적된 **3가지 격차** 를 한 sub 로 정합한다.

### (a) 데이터 모델 격차

`sub_issue.due_date` 가 핵심 필터 (홈 일자 뷰 / carry-over RPC) 로 사용되지만, 본래 의도는 **단일 축 = "등록일 (registered_date)"**. 일자별 표시는 "그 날짜에 등록 / 이월된 sub" 의미. due_date 라는 컬럼명이 **마감일 의미 혼선** 을 유발 (실제로 모달 / 도메인 / UI 어디에도 마감일 의미를 담는 흐름이 없음).

### (b) UX 격차 — 투두 생성 진입점

| 위치 | 현재 (Sub-02 / 06 머지 후) | 의도 |
|---|---|---|
| 홈 FAB | `CreateTodoModal` — sub_issue 생성 (epic 선택 가능) | epic_issue 만 생성 |
| Epic 카드 | sub 추가 진입점 부재 | "서브 이슈 추가" 진입점에서만 sub 생성 |

홈 FAB 가 sub 를 epic 컨텍스트 없이도 만들 수 있는 현 흐름은 "Epic 단위 묶음 → sub 분해" 라는 도메인 개념을 흐린다.

### (c) prototype 격차

| 영역 | 현재 | prototype |
|---|---|---|
| Epic 생성 모달 | 분류 = native `<select>` | 자유 입력 + 검색 + 즉시 생성 가능한 Combobox |
| 설정 페이지 | 분류 / Epic 관리 링크 4개 + "기타 (준비 중)" | 프로필 카드 + 계정 / 앱 / 정보 섹션 |
| 분류 / Epic 관리 페이지 | 실존 (`apps/web/src/app/(main)/{life,work}/{categories,epics}/`) | 부재 (분류 직접 관리 UI 없음) |

본 sub 는 위 3축을 한 번에 정합하여 **모달 흐름 + DB 스키마 + 설정 / 관리 페이지** 를 prototype·도메인 의도와 일치시킨다.

## 사용자 결정 (확정)

| 항목 | 결정 | 비고 |
|---|---|---|
| Carry-over 정책 | **이월은 유지하되 의미 변경** | `carry_over_count` 컬럼 유지. RPC 는 `registered_date` 가 오늘 이전이고 미완료인 sub 의 `registered_date = 오늘` 갱신 (사실상 due_date rename + 의미를 "등록일" 로) |
| 분류 / Epic 관리 페이지 | **완전 삭제** | 분류 직접 관리 UI 폐기. 분류 자동 삭제 trigger 도입 |
| 모달 분리 | `CreateTodoModal` 폐기 + `EpicFormModal` (생성용 통합) + `SubIssueFormModal` 신설 | 자유 입력 Combobox (`CategoryComboboxCreate`) 별도 컴포넌트로 패키지화 |
| mobile 정합 | 본 sub 동시 진행 | sub-prd-07 / 08 패턴 |

## 기술 스택

| 영역 | 기술 |
|---|---|
| DB | Supabase Postgres — 마이그레이션 신설 (`006_*`, `007_*`, `008_*`) |
| 도메인 / 서비스 | `packages/core/src/{domain,services,hooks}` |
| 신설 / 갱신 컴포넌트 | `packages/ui/src/CategoryComboboxCreate.tsx`, `EpicAccordionCard.tsx` (props 보강) |
| web 모달 / 페이지 | `apps/web/src/components/modals/{EpicFormModal,SubIssueFormModal}.tsx`, `apps/web/src/app/(main)/settings/page.tsx` |
| mobile | `apps/mobile/src/app/{epic-form,sub-issue-form}.tsx`, `apps/mobile/src/app/(main)/settings/` |
| 디자인 SoT | `docs/base/design-system/components/{category-combobox-create,settings-page}.md` |

## 핵심 요구 사항

### 1. DB 스키마 정합 (마이그레이션 신설)

**`006_rename_sub_issue_due_to_registered.sql`** (rename 단독)

- `sub_issue.due_date` → `sub_issue.registered_date` (`ALTER TABLE ... RENAME COLUMN`)
- 기존 인덱스 `idx_sub_issue_user_due_status` → `idx_sub_issue_user_registered_status` rename
- 기존 데이터 값 손실 0 (의미 변경이지만 값은 그대로 옮겨짐)

**`007_carry_over_semantic_change.sql`** (RPC 재정의)

- `carry_over_todos(target_date)` 본문 갱신:
  - 변경 전: `due_date < target_date AND status <> 'done'` → `due_date = target_date`
  - 변경 후: `registered_date < target_date AND status <> 'done'` → `registered_date = target_date`
  - `carry_over_count++` 동작 유지
- `SECURITY DEFINER` / RLS 검증 포함

**`008_purge_orphan_categories.sql`** (분류 자동 삭제 trigger — **옵션 A 채택**)

- AFTER DELETE on `epic_issue`, `sub_issue` → trigger function `purge_orphan_categories(category_id)` 호출
- 함수 본문: `category_id` 가 epic_issue / sub_issue 어디에도 참조되지 않을 때 해당 row 삭제
- `user_id` 스코프 보장 (RLS 와 충돌 방지)
- 트랜잭션 안전성 — bulk 삭제 시에도 일관된 결과
- 옵션 B (호출 측 RPC 후처리) 미채택 사유: 호출 측 단순성 + cascade 케이스 누락 위험

**머지 후속 작업**

- `make sb-gen-types` 로 `packages/shared/src/database.ts` 재생성
- `supabase/seed.sql` 의 sub_issue 시드가 due_date 사용 시 갱신

### 2. 도메인 / service / hooks 갱신 (`packages/core`)

| 파일 | 변경 |
|---|---|
| `domain/todo.ts` | `SubIssue.dueDate` → `SubIssue.registeredDate`. `mapSubIssueRow`: `row.due_date` → `row.registered_date` |
| `services/todo.ts` | `listByDate` 의 `.eq('due_date', date)` → `.eq('registered_date', date)` |
| `hooks/useTodos*.ts` | queryKeys 동일 (date 인자 의미 동일) — 호출 측 영향 0 |
| `__tests__/domain.test.ts` | 매퍼 / 서비스 단위 테스트 갱신 |

### 3. 모달 흐름 분리 (`apps/web` + `apps/mobile`)

#### 3.1 web

**폐기**

- `apps/web/src/components/modals/CreateTodoModal.tsx`

**신설 / 갱신**

- `EpicFormModal` — 생성용 모드 통합. 입력 필드:
  - 제목 (필수)
  - 설명
  - 분류 — `CategoryComboboxCreate` 사용
  - priority (`high` / `medium` / `low`)
  - 등록일은 진입 시 호출자(=현재 일자)에서 주입 (사용자 입력 X)
- `SubIssueFormModal` — Epic 카드 "서브 이슈 추가" 진입점 전용. 입력 필드:
  - 제목 (필수)
  - priority
  - 등록일 (기본 = 호스트 일자, 사용자 변경 가능)
  - epic 은 호출 컨텍스트에서 주입 (사용자 선택 불가)

**진입점 정합**

- 홈 FAB (`MainDailyView` 의 `handleCreate`) → `EpicFormModal` open
- sub-prd-08 `EmptyState` CTA → `EpicFormModal` open (동일 진입점)
- `EpicAccordionCard` "서브 이슈 추가" 버튼 → `SubIssueFormModal` open

#### 3.2 EpicAccordionCard 의 sub 추가 진입점

- `packages/ui/src/EpicAccordionCard.tsx` props 보강:
  ```ts
  type EpicAccordionCardProps = {
    // ... 기존
    onAddSubIssue?: () => void;
  };
  ```
- expanded 상태의 sub 목록 하단에 버튼 노출 (`+ 서브 이슈 추가`)
- web / mobile 동일 패턴 (sub-prd-07 의 패키지 공유 전략 재사용)

### 4. 분류 자유 입력 Combobox 신설

기존 `apps/web/src/components/ui/Combobox.tsx` 는 generic / WAI-ARIA 1.2 정합이지만 **자유 입력 불가** (선택지 onChange 만). prototype L578-590 의 분류 Combobox 패턴 (자유 입력 + 검색 + "+ '<입력>' 분류 만들기" 옵션) 을 별도 컴포넌트로 신설.

**`packages/ui/src/CategoryComboboxCreate.tsx`** 신설

```ts
type CategoryComboboxCreateProps = {
  workspace: 'life' | 'work';
  value: { id: string; name: string; color?: string } | null;
  onChange: (category: { id: string; name: string; color?: string }) => void;
  placeholder?: string;
};
```

**동작**

1. 입력 텍스트로 옵션 검색 → 매칭 시 선택
2. 매칭 0건 시 "+ '<입력>' 분류 만들기" 옵션 노출
3. 신규 옵션 선택 시 분류 즉시 생성 RPC 호출 (`categoryService.create`) → 응답으로 `onChange` 트리거
4. 자체적으로 `useCategories(workspace)` 호출 — host 가 매번 옵션 주입할 필요 없음

**디자인 SoT**: `docs/base/design-system/components/category-combobox-create.md` (sub-prd-08 패턴)

### 5. 설정 페이지 prototype 정합

`apps/web/src/app/(main)/settings/page.tsx` 전면 재구현. prototype L822-880 인용.

#### 섹션 구조

| 블록 | 내용 |
|---|---|
| 프로필 카드 | 이름·이메일·provider (Supabase auth user 정보) |
| 계정 | 소셜 계정 연동 (잠정안 — placeholder), 알림 설정 (잠정안) |
| 앱 | 테마 등 (잠정안 placeholder) |
| 정보 | 버전 정보, 로그아웃 |

#### 제거

- 분류 관리 / Epic 관리 진입점 4개

#### 디자인 SoT

`docs/base/design-system/components/settings-page.md` 신설 (Template 분류 — page-level 명세)

### 6. 분류 / Epic 관리 페이지 삭제

**삭제 대상**

- `apps/web/src/app/(main)/life/categories/page.tsx`
- `apps/web/src/app/(main)/life/epics/page.tsx`
- `apps/web/src/app/(main)/work/categories/page.tsx`
- `apps/web/src/app/(main)/work/epics/page.tsx`
- 관련 view 컴포넌트 (`CategoriesView`, `EpicsView`, 그 의존 hooks 중 분류·Epic 관리 전용 것)
- `SideNav` / `MainLayout` 의 관리 페이지 링크

**삭제 후 정책**

- 분류 직접 생성 / 수정 / 삭제 UI 부재
- 분류 생성 = `EpicFormModal` 의 `CategoryComboboxCreate` 를 통해서만
- 분류 삭제 = DB trigger (마이그레이션 006) 가 마지막 참조 issue 삭제 시 자동 실행
- 분류 색 / 이름 inline 편집 = **본 sub 미해결 (잠정 — 미제공)** — 후속 sub 검토

### 7. mobile 정합

| 항목 | 변경 |
|---|---|
| `apps/mobile/src/app/create-todo.tsx` | 폐기 |
| `apps/mobile/src/app/epic-form.tsx` | 신설 (EpicFormModal RN 버전) |
| `apps/mobile/src/app/sub-issue-form.tsx` | 신설 (SubIssueFormModal RN 버전) |
| mobile EpicAccordionCard | sub 추가 버튼 노출 |
| `apps/mobile/src/app/(main)/settings/` | prototype 정합 재구현 |
| mobile 분류 / Epic 관리 라우트 | 삭제 |
| 기존 deep link `create-todo` | redirect alias 단기 유지 (회귀 방지) |

### 8. 디자인 시스템 SoT 보강

- `docs/base/design-system/components/category-combobox-create.md` 신설 — Molecules
- `docs/base/design-system/components/settings-page.md` 신설 — Templates
- `docs/base/design-system/components.md` 의 Molecules / Templates 분류표 갱신

### 9. main-prd Sub-PRD 표 갱신

`docs/dev/20260502-02-todo-list-initialize/main-prd-todo-list-initialize.md` 의 Sub-PRD 표에 **Sub-09 행 추가**. 실제 갱신은 sub-prd-09 머지 시 첫 task (TASK-09-01) 에서 수행 — 본 plan 단계에서는 0건.

## 구현 시 주의사항

1. **DB 마이그레이션 머지 순서 강제**: 004 (rename) → 005 (RPC 재정의) → 006 (trigger). 분리 머지로 실패 시 롤백 단순. 003 의 RPC 가 변경되므로 005 머지 전 003 호출 측 (client-side carry-over 호출) 일시 중단 검토.
2. **carry_over_count 의미 일관성**: 의미 = "등록일이 다른 일자에서 오늘로 이월된 횟수". UI 의 `+N` 뱃지 (sub-prd-06 산출물) 그대로 재사용.
3. **분류 자동 삭제 trigger 의 이벤트 시점**: epic 삭제와 sub 삭제 모두에서 호출되어야 함. 또한 RLS 와 충돌 검토 필요 — trigger 가 다른 user 의 row 에 영향 없도록 `user_id` 스코프.
4. **`CategoryComboboxCreate` 의 신규 생성 RPC 권한**: `category_create` RPC 가 이미 존재하면 재사용. 없으면 신설 (`SECURITY DEFINER`). API_CONTRACT 갱신 필요.
5. **호환성 / 데이터 마이그레이션**: rename 시 기존 `due_date` 값이 `registered_date` 로 그대로 옮겨짐 — 의미 변경이지만 값 손실 0.
6. **분류 관리 UI 삭제 → 사용자 회복 경로**: 분류 이름 변경 / 색 변경 UI 가 사라짐. EpicFormModal 안에서 inline 편집을 제공할지는 본 sub **미해결** (잠정 — 미제공, 후속 sub 검토).
7. **build 깨짐 방지를 위한 task 순서 강제**: DB → core → ui → web → mobile. 각 task 종료 시 typecheck pass 필수.
8. **race condition (분류 동시 생성)**: 같은 이름 동시 입력 → DB unique constraint (`workspace + name`) 로 보호. 충돌 시 toast.error.
9. **mobile deep link 회귀**: `create-todo` 라우트 삭제 시 redirect alias 단기 유지 (mobile sub task 안에 명시).
10. **task 분해 시 영역 격리**: DB / core / ui / web / mobile / docs SoT 6 영역으로 분해 — 한 task 가 두 영역 동시에 건드리지 않도록.

## 작업

### DB 마이그레이션 (3)

- [x] `supabase/migrations/006_rename_sub_issue_due_to_registered.sql` — 컬럼·인덱스 rename
- [x] `supabase/migrations/007_carry_over_semantic_change.sql` — RPC `carry_over_todos` 재정의
- [x] `supabase/migrations/008_purge_orphan_categories.sql` — 분류 자동 삭제 trigger + function

### 도메인 / 서비스 (3)

- [x] `packages/core/src/domain/todo.ts` — `SubIssue.dueDate` → `registeredDate`, mapper 갱신
- [x] `packages/core/src/services/todo.ts` — `listByDate` 필터 컬럼 갱신
- [x] `packages/core/src/__tests__/domain.test.ts` 외 단위 테스트 갱신 + `make sb-gen-types`

### 공유 UI (3)

- [x] `packages/ui/src/CategoryComboboxCreate.tsx` 신설 + `index.ts` re-export + 단위 테스트
- [x] `packages/ui/src/EpicAccordionCard.tsx` — `onAddSubIssue` prop + 버튼 노출
- [x] 설정 페이지 재사용 컴포넌트 (필요 시 `SettingsSection`, `SettingsRow` 등 추출 검토)

### web (5)

- [x] `apps/web/src/components/modals/EpicFormModal.tsx` — 생성용 통합 + `CategoryComboboxCreate` 적용
- [x] `apps/web/src/components/modals/SubIssueFormModal.tsx` 신설
- [x] `apps/web/src/components/modals/CreateTodoModal.tsx` 폐기 + 호출 측 (`MainDailyView` / `EmptyState` CTA) 진입점 교체
- [x] `apps/web/src/app/(main)/settings/page.tsx` prototype 정합 재구현
- [x] 분류 / Epic 관리 페이지 4개 + view 컴포넌트 + SideNav 링크 삭제

### mobile (4)

- [x] `apps/mobile/src/app/create-todo.tsx` 폐기 + redirect alias
- [x] `apps/mobile/src/app/{epic-form,sub-issue-form}.tsx` 신설
- [x] mobile EpicAccordionCard sub 추가 버튼 노출
- [x] mobile 설정 페이지 재구현 + 관리 라우트 삭제

### 디자인 SoT (2)

- [x] `docs/base/design-system/components/category-combobox-create.md` 신설
- [x] `docs/base/design-system/components/settings-page.md` 신설 + `components.md` 분류표 갱신

### main-prd / API_CONTRACT (1)

- [x] `main-prd-todo-list-initialize.md` Sub-PRD 표에 Sub-09 행 추가 + `API_CONTRACT.md` sub_issue 시그니처 갱신 (`due_date` → `registered_date`) + `category_create` RPC 시그니처 명시

### 검증 (2)

- [x] 자동 — lint / typecheck / test / build (web · ui · core · mobile · supabase db diff)
- [x] 수동 — 아래 검증 기준의 시나리오 전체 통과

## 검증 기준

### 자동

- [x] `pnpm --filter @todo-list/{core,ui,web} run lint` 통과
- [x] `pnpm --filter @todo-list/{core,ui} run test` 통과 (rename 반영)
- [x] `pnpm --filter @todo-list/web run build` / `typecheck` 통과
- [x] `pnpm --filter @todo-list/mobile run typecheck` 통과
- [x] `supabase db diff` — 마이그레이션 004/005/006 적용 후 schema drift 0
- [x] `make sb-gen-types` 후 `packages/shared/src/database.ts` 갱신 반영

### 수동

- 홈 FAB → `EpicFormModal` 진입 (sub_issue 생성 진입점 부재 확인)
- `EpicFormModal` 안 분류 입력 → 자유 입력 → 신규 분류 즉시 생성 → 저장 후 list 갱신
- Epic 카드 펼침 → "서브 이슈 추가" 버튼 → `SubIssueFormModal` → 저장 → 해당 epic 안에 sub 추가 확인
- 등록일이 이전인 미완료 sub 가 다음 일자 진입 시 자동 이월 (`registered_date` 갱신 + `carry_over_count++` + sub-prd-06 의 `+N` 뱃지 노출)
- 마지막 분류 참조 sub / epic 삭제 시 분류도 자동 삭제 (DB trigger 동작)
- 다른 user 의 sub / epic 삭제가 본인 분류에 영향 0 (RLS scoping)
- 설정 페이지 — 프로필 카드 + 계정 / 앱 / 정보 섹션 prototype 정합 (분류·Epic 관리 진입점 부재)
- 분류 / Epic 관리 페이지 직접 URL 진입 시 404 또는 redirect (잔존 라우트 0 확인)
- mobile — 동일 시나리오 RN 환경 통과 + `create-todo` deep link 가 `epic-form` 으로 redirect

### 회귀 0건

- sub-prd-06 chip / DateNavigator
- sub-prd-07 Epic 카드 expand / cascade toggle
- sub-prd-08 EmptyState / Spinner / Toast

## 미해결 / 사용자 결정 필요

1. **분류 색 / 이름 inline 편집 UI**: 본 sub 미제공. EpicFormModal 안 / Epic 카드 메뉴 / SubIssueFormModal 어디에 진입점을 둘지는 후속 sub 검토.
2. **자동 이월 시간대 (스케줄링)**: RPC 호출 트리거가 client-side / Supabase scheduled function 어느 쪽인지. 현재 client-side 추정 (앱 진입 시 호출). server-side cron 필요 여부 후속 결정.
3. **설정 페이지의 알림 / 테마 항목**: 디자인 결정자 합류 전 잠정 placeholder. 합류 시 본 sub 의 settings-page.md 갱신.
4. **`CategoryComboboxCreate` 의 generic 추상화 여부**: workspace + name 패턴이 다른 도메인 (예: tag) 에 재사용될지에 따라 generic vs domain-specific 결정. 잠정 — domain-specific (분류 전용).
5. **mobile `create-todo` redirect alias 유지 기간**: 단기 (1 release cycle) 후 제거 vs 영구 유지. 잠정 — 1 cycle 후 제거.

## 위험 / 완화

| 위험 | 완화 |
|---|---|
| `due_date` rename → 광범위 type / build 깨짐 | task 순서 강제 (DB → core → web → mobile). 각 task 종료 시 typecheck pass 필수 |
| 분류 자동 삭제 trigger 가 RLS 와 충돌 | 마이그레이션 006 작업 시 supabase local 환경에서 cascade 케이스 (epic 삭제 / sub 삭제 / bulk 삭제) 회귀 시나리오 명시 |
| 관리 페이지 삭제 후 분류 / Epic 가시성 부족 | 미해결 §1 (inline 편집) 후속 검토. 잠정 — Epic 카드 메뉴 / SubIssueFormModal 안 편집 진입 |
| `CategoryComboboxCreate` 신규 생성 race condition | DB unique constraint (`workspace + name`) 로 보호. 충돌 시 `toast.error` |
| mobile `create-todo` 삭제 시 deep link 회귀 | redirect alias 단기 유지 (mobile sub task 안에 명시) |
| 003 의 carry-over RPC 변경 도중 client 호출 | 005 머지 전 client-side 호출 일시 중단 또는 호환 분기 |

## 참고 문서

- `docs/base/prototype/pages/page-prototypes.html` — L578-590 (분류 Combobox 패턴), L822-880 (설정 페이지)
- [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md) — Sub-PRD 표 추가 위치
- [`detail-todo-service-initialize.md`](./detail-todo-service-initialize.md) — §2.4.3 등록일 vs 배치 날짜 정의 (본 sub 가 통합)
- [`API_CONTRACT.md`](./API_CONTRACT.md) — sub_issue / `carry_over_todos` / `category_create` 시그니처 갱신 항목
- [`sub-prd-06-feat-web-prototype-visual-alignment.md`](./sub-prd-06-feat-web-prototype-visual-alignment.md) — `+N` 뱃지 패턴 재사용
- [`sub-prd-07-feat-epic-accordion-card.md`](./sub-prd-07-feat-epic-accordion-card.md) — Epic 카드 props 보강 패턴 / mobile 동시 진행 전략
- [`sub-prd-08-feat-auth-and-empty-state.md`](./sub-prd-08-feat-auth-and-empty-state.md) — 디자인 SoT 우선 머지 / EmptyState CTA 진입점 패턴
- `supabase/migrations/001_initial_schema.sql` — sub_issue 스키마 / 인덱스 정의
- `supabase/migrations/003_carry_over_todos.sql` — RPC 재정의 대상
- `packages/shared/src/database.ts` — 자동 생성 (마이그레이션 머지 후 갱신)
- `packages/core/src/{domain/todo.ts,services/todo.ts}` — mapper / 필터
- `apps/web/src/components/modals/{CreateTodoModal,EpicFormModal,TodoDetailModal}.tsx` — 모달 분리 대상
- `apps/web/src/components/ui/Combobox.tsx` — 자유입력 미지원 (별도 신설 근거)
- `apps/web/src/app/(main)/settings/page.tsx` — 재구현 대상
- `apps/web/src/app/(main)/{life,work}/{categories,epics}/` — 삭제 대상
- `packages/ui/src/EpicAccordionCard.tsx` — `onAddSubIssue` 추가 대상
- `apps/mobile/src/app/create-todo.tsx` + `apps/mobile/src/app/(main)/settings/` — mobile 정합 대상
