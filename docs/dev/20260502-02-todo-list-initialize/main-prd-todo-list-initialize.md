# MAIN-PRD: `투두 서비스 초기화`

# `투두 서비스 초기화` (`todo-list-initialize`) - MAIN PRD

## 프로젝트 정보

- **프로젝트명**: `투두 서비스 초기화` `todo-list-initialize`
- **카테고리**: 서비스 MVP 초기 구현 (v2 인프라 위에 실 기능 layer)
- **상태**: Draft
- **시작일**: 2026-05-05
- **완료일**: TBD
- **최신 업데이트**: 2026-05-05
- **기반 문서**: [`detail-todo-service-initialize.md`](./detail-todo-service-initialize.md), [`API_CONTRACT.md`](./API_CONTRACT.md)
- **선행 PRD**: [`../20260502-01-stack-pivot/main-prd-stack-pivot.md`](../20260502-01-stack-pivot/main-prd-stack-pivot.md) (머지 완료)

## 개발 목적

이미 머지된 v2 인프라(`stack-pivot`) 위에 Dopamine Planner 서비스의 **실 기능 layer** 를 web + mobile 양 갈래로 처음부터 구현한다. (detail §1·§2)

**왜 본 PRD 가 필요한가**

선행 sprint(`stack-pivot`) 가 "자체 서버 0 / Supabase 직접 호출 + RPC / RN 네이티브 / Nativewind 토큰 매핑 / Realtime publication" 까지 인프라 골격을 끝냈지만, 골격 위에 **실제 사용자가 사용할 화면·플로우·CRUD** 는 비어있다. 직전 sprint 에서 `detail-todo-service-initialize.md` 와 `API_CONTRACT.md` 를 v2 SoT 와 정합 완료했으므로, 본 PRD 는 두 문서를 입력으로 받아 **구현 범위·설계** 를 정의해 후속 `/generate-sub-prd` 진입점을 만든다.

**v2 인프라(stack-pivot) 종료 시점에 확보된 자산**

- `supabase/migrations/{001..005}.sql` 머지 완료 — 4 테이블 + RLS + RPC 2종(`carry_over_todos`, `recalc_epic_progress`) + Realtime publication
- `packages/shared/src/database.ts` — `supabase gen types` 산출 타입 (`Database` 타입 export, RPC 시그니처 포함)
- `packages/core` 골격 — Supabase 클라이언트 팩토리, 비즈니스 로직 자리 마련
- `apps/web/src/app/auth/callback/route.ts` — OAuth 콜백 Route Handler
- `apps/mobile/` — Expo + Nativewind 셋업, OAuth deep link 스킴(`dopamine-planner://`) 골격

**본 PRD 가 채울 빈자리**

1. **CRUD 서비스 + 훅 완성** — `packages/core/src/services/*`, `packages/core/src/hooks/*` 의 실 구현
2. **웹 화면** — 메인 일자 뷰, 분류·Epic 관리 화면, 설정
3. **모바일 화면** — 핵심 화면 5종 (로그인 / Life·Work 메인 / 투두 생성·수정 / 설정)
4. **자동 이월 트리거** — 서버 cron 없으므로 클라이언트 진입 시점 정책 확정
5. **Epic 진행률 갱신 트리거** — 체크 토글 시 RPC 호출 + 디바운스 정책
6. **Realtime + TanStack Query invalidation 패턴** — race 방지
7. **다중 디바이스 sync 검증** — web + iOS 시뮬레이터 동시 접속 시나리오

## 핵심 기능 요구사항

`detail-todo-service-initialize.md` §2 의 5종과 1:1 매핑한다.

### 1. 워크스페이스 분리 (Life / Work)

- 하단 탭 바(모바일) / 사이드 네비(데스크톱) 로 두 워크스페이스 전환
- 각 워크스페이스는 독립 분류 체계 (`category.workspace` 컬럼 기준 필터)
- 라우팅: 웹 `/life`, `/work` (stack-pivot 의 `(main)` 라우트 그룹), 모바일 expo-router `(tabs)/life`, `(tabs)/work`

### 2. 섹션 레이아웃 (완료 / 진행 중)

- 단일 일자 뷰 = 두 섹션 (상단 완료 / 하단 진행 중)
- `sub_issue.status` 기반 필터 (`done` / `todo`)
- 토글 시 즉시 섹션 이동 (optimistic update)

### 3. 일자별 관리 + 자동 이월

- 기본 뷰 = 오늘 (`due_date = today`)
- 좌우 스와이프(모바일) / 좌우 화살표(웹) 로 날짜 탐색
- **자동 이월** (트리거 위치 = 클라이언트 진입 시점):
  - 앱 진입 시점에 `supabase.rpc('carry_over_todos', { target_date: today })` 1회 호출
  - 호출 결과의 `moved_count` 가 0 이상이어도 사용자에게는 노출하지 않음 (조용한 이월)
  - WHERE 절(`due_date < target_date AND status <> 'done'`) 로 멱등성 보장 → 중복 호출 안전
  - 서버 cron 미사용 (자체 서버 0 원칙 유지)

### 4. 계층형 이슈 관리 (Category → Epic → Sub Issue)

- **Category**: 워크스페이스 내 그룹핑. CRUD 화면 1개
- **Epic Issue**: 분류 하위 큰 묶음. CRUD + 진행률 표시 (세그먼트 프로그레스바)
  - 메인 체크박스 토글 시 하위 Sub 일괄 체크/해제
  - **진행률 재계산 트리거** = Sub 의 `status` 가 변경된 직후 (debounce 200ms)
  - `supabase.rpc('recalc_epic_progress', { epic_id })` 호출 → `epic_issue.progress` 컬럼 갱신
- **Sub Issue (Todo)**: 실제 체크 단위. 일자별 뷰의 최소 단위
  - 우선순위(`high` / `medium` / `low`), 상태(`todo` / `done`), 등록일(`due_date`), 완료일, 이월 횟수

### 5. 인증 — Google OAuth (MVP) / Kakao 후속

- web: `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: <origin>/auth/callback } })` → `apps/web/src/app/auth/callback/route.ts` 가 code 교환 후 `/life` 로 redirect
- mobile: `expo-auth-session` + `dopamine-planner://auth/callback`
- 인증 가드: web 은 `(main)` 레이아웃에서 client-side 가드 (export 모드 제약 → RSC 가드 불가), mobile 은 expo-router 의 protected route
- 로그아웃: `supabase.auth.signOut()` → 로그인 화면으로 이동

## 사용자 플로우

```
[로그인 화면]
   │  Google OAuth 버튼 탭
   ▼
[OAuth 콜백 처리 (web: /auth/callback Route Handler / mobile: deep link)]
   │  code → session 교환
   ▼
[메인 일자 뷰 — 기본 워크스페이스 = Life, 기본 날짜 = 오늘]
   │  ① 진입 시 자동 이월 RPC 호출 (조용히)
   │  ② Realtime 구독 시작 (sub_issue / category / epic_issue / profile 4 테이블)
   │
   ├── [날짜 탐색] ◀ ▶ 좌우 화살표·스와이프
   │
   ├── [투두 체크 토글] → optimistic update + supabase.update + 200ms 후 recalc_epic_progress
   │
   ├── [투두 생성] FAB(모바일) / + 버튼(웹) → 모달 (제목·설명·우선순위·분류·Epic·due_date)
   │
   ├── [투두 수정/삭제] 항목 탭 → 상세 모달
   │
   ├── [워크스페이스 전환] 하단 탭 Life ↔ Work
   │
   ├── [분류 관리] 설정 → 분류 화면 → CRUD
   │
   ├── [Epic 관리] 설정 → Epic 화면 → CRUD + 진행률 표시
   │
   └── [로그아웃] 설정 → 로그아웃 → 로그인 화면 복귀
```

**메인 화면 와이어프레임** (detail §5.2 인용)

```
┌──────────────────────────────┐
│  ◀      2026년 5월      ▼ ▶  │
│  일  월  화  수  목  금  토   │
│  27  28  29  30  ①  2   3   │
├──────────────────────────────┤
│  ── 완료 (2) ──────────────  │
│  ☑ 아침 운동          건강   │
│  ☑ 장보기             생활   │
│                              │
│  ── 진행 중 (3) ───────────  │
│  ☐ 저녁 운동          건강   │
│    ██ ░░  50%                │
│  ☐ 책 읽기         자기개발  │
│  ☐ 비타민 챙기        생활   │
│                        [＋]  │
├──────────────────────────────┤
│  [Life]    [Work]    [설정]  │
└──────────────────────────────┘
```

## 기술 아키텍처

### 시스템 구성

선행 PRD([`../20260502-01-stack-pivot/main-prd-stack-pivot.md`](../20260502-01-stack-pivot/main-prd-stack-pivot.md) §시스템 구성) 의 다이어그램을 그대로 사용한다. 본 PRD 는 그 위에 **실 기능 layer (화면 / CRUD / 트리거)** 만 추가한다 — 인프라·패키지 경계는 변경 없음.

```
┌────────────────────────────────────────────────────────────┐
│  React SPA (apps/web) ─ MVP                                 │
│  └─ Next.js 15 (output: 'export') → 정적 SPA                │
│     └─ /auth/callback Route Handler (OAuth code 교환만)      │
└────────────────────────────────────────────────────────────┘
        │                                          ┌──────────────────┐
        │                                          │ Expo (RN 네이티브) ─ MVP
        │                                          │ apps/mobile/    │
        │                                          │ · 자체 RN 화면  │
        │                                          │ · expo-auth-session
        │                                          └────────┬─────────┘
        │                                                   │
        │           packages/core (TS 비즈니스 로직 공유)       │
        │           ─────────────────────────────────         │
        │           · Supabase 클라이언트 팩토리                │
        │           · 도메인 모델 + 매퍼                       │
        │           · 서비스 함수 (carry-over, progress 호출)   │
        │           · TanStack Query 훅                       │
        │           · Realtime 구독 헬퍼                      │
        │
        ▼                                                   ▼
        ┌────────────────────────────────────┐
        │  Supabase (Free)                    │
        │  ├─ Postgres + RLS                  │
        │  ├─ Auth (Google MVP / Kakao 후속) │
        │  ├─ Realtime (4 테이블 publication) │
        │  └─ RPC 함수 (carry_over_todos,     │
        │              recalc_epic_progress)  │
        └────────────────────────────────────┘
```

### 패키지 책임

선행 PRD 의 패키지 책임 표를 인용. 본 PRD 의 sub-prd 들은 이 경계를 깨지 않는다 — 변경 필요 시 stack-pivot main-prd 를 먼저 수정한다.

| 패키지 | 책임 (본 PRD 가 채울 영역) |
|---|---|
| `@todo-list/shared` | 도메인 타입·enum (이미 stack-pivot 종료 시점에 `Database` 타입 자동생성 완료). **본 PRD 는 변경 없음** |
| `@todo-list/core` | **본 PRD 의 핵심 작업 영역.** services·hooks·realtime 헬퍼·domain 매퍼 실 구현 |
| `@todo-list/ui` | 화면별 공유 컴포넌트 (TodoItem, EpicProgressBar, DateNavigator, FAB, BottomTab 등) |
| `@todo-list/config` | 변경 없음 (tailwind 토큰은 stack-pivot 에서 확정) |
| `apps/web` | `(main)` 라우트의 화면들 (Life/Work/Settings/모달) |
| `apps/mobile` | expo-router 화면들 (`apps/mobile/src/components/` 직배치 — `packages/ui-mobile` 미신설 정책 유지) |

### 핵심 서비스 구현 (`packages/core`)

본 PRD 의 sub-01 산출물.

| 영역 | 파일 | 핵심 |
|---|---|---|
| Supabase 클라이언트 | `src/supabase/createClient.ts` | env + storage adapter 주입 (이미 stack-pivot 에서 골격 완료, 본 PRD 에서 사용처 추가) |
| 도메인 매퍼 | `src/domain/{todo,epic,category}.ts` | DB Row(snake_case) → View(camelCase) |
| Category 서비스 | `src/services/category.ts` | listByWorkspace / create / update / delete |
| Epic 서비스 | `src/services/epic.ts` | listByCategory / create / update / delete + recalcProgress |
| Sub 서비스 | `src/services/todo.ts` | listByDate / create / update / toggle / delete |
| RPC 호출 | `src/services/{carryOver, epicProgress}.ts` | 단일 row 배열에서 첫 번째 추출 (`data?.[0]?.moved_count`) |
| Query 훅 | `src/hooks/{useTodos, useEpics, useCategories, useCreate*, useUpdate*, useDelete*, useToggleTodo}.ts` | TanStack Query invalidate 키는 단일 위치 (`src/queryKeys.ts`) |
| Realtime 헬퍼 | `src/realtime/subscribeTodos.ts` | 4 테이블 통합 구독, payload → invalidate 매핑 |

### 데이터베이스 스키마

이미 머지 완료. 본 PRD 가 변경하지 않음.

| 파일 | 내용 | 본 PRD 에서의 역할 |
|---|---|---|
| `001_initial_schema.sql` | profile / category / epic_issue / sub_issue + RLS 활성화 | 사용 (서비스에서 컬럼명·관계 의존) |
| `002_rls_policies.sql` | 테이블별 RLS (`auth.uid() = user_id`) | 사용 (서비스가 별도 user_id 필터링 안 해도 됨) |
| `003_carry_over_todos.sql` | RPC: 미완료 todo 일괄 이월 (`returns table(moved_count integer)`) | 사용 (자동 이월 트리거에서 호출) |
| `004_recalc_epic_progress.sql` | RPC: epic 진행률 재계산 (`returns table(progress numeric)`) | 사용 (체크 토글 디바운스 후 호출) |
| `005_realtime_publication.sql` | publication 4 테이블 등록 | 사용 (`subscribeTodos` 가 4 테이블 모두 구독) |

ERD 상세는 [`detail-todo-service-initialize.md`](./detail-todo-service-initialize.md) §3 참조.

### API 엔드포인트

자체 REST 엔드포인트 없음. 두 채널만 사용한다.

- **Supabase 직접 호출 (단순 CRUD)** — Category / Epic / Sub 의 select / insert / update / delete
- **Postgres RPC** — `carry_over_todos(target_date date)` / `recalc_epic_progress(epic_id uuid)`
- **Realtime publication** — 4 테이블(`profile`, `category`, `epic_issue`, `sub_issue`) 모두 구독 가능 (마이그레이션 005)

상세 시그니처는 [`API_CONTRACT.md`](./API_CONTRACT.md) 참조.

### 책임 경계 규칙 (v2)

선행 PRD 와 동일. 변경 없음.

| 영역 | 책임 PRD 유형 |
|---|---|
| `supabase/migrations/**` | DB PRD (선행 stack-pivot 에서 확정, 본 PRD 변경 없음) |
| `packages/shared/**` | DB PRD (변경 없음) |
| `packages/core/**` | **공통 클라이언트 PRD = 본 PRD 의 sub-01 핵심 영역** |
| `packages/ui/**` | UI PRD 또는 공통 클라이언트 PRD |
| `apps/web/**` | 웹 PRD = 본 PRD 의 sub-02 / sub-03 |
| `apps/mobile/**` | 모바일 PRD = 본 PRD 의 sub-04 |

### 기술적 고려사항

#### 자동 이월 트리거 위치 (서버 cron 없음)

- **Default 정책**: 클라이언트 진입 시점 1회 + 사용자가 "오늘로 이동" 버튼 누를 때 1회
- 멱등성 보장 (003 마이그레이션 WHERE 절 `due_date < target_date AND status <> 'done'`) → 중복 호출 안전
- 호출 위치는 `packages/core/src/hooks/useTodos.ts` 의 진입 effect 1군데로 집중 (web/mobile 공유)
- 사용자에게 별도 알림 없음 (조용한 이월)

#### Realtime + TanStack Query invalidation 패턴

- `subscribeTodos` 가 payload 의 테이블명 → `queryKeys.{todos|epics|categories|profile}` 매핑 후 `qc.invalidateQueries`
- optimistic update 와 invalidate 가 race 하면 invalidate 가 우선 (TanStack Query 의 기본 동작)
- 단일 디바이스에서 자기 변경의 echo 로 인한 불필요한 invalidate 가 발생할 수 있음 → MVP 에서는 허용 (추후 payload 의 commit_timestamp 비교로 필터링 검토)

#### Epic 진행률 갱신 트리거 (`recalc_epic_progress`)

- Sub 의 `status` 변경 직후 200ms 디바운스 후 호출
- 동일 epic 의 여러 Sub 가 짧게 토글되는 경우(예: 일괄 체크) 디바운스로 RPC 호출 1회로 합침
- 호출 위치는 `useToggleTodo` 훅 1군데 (web/mobile 공유)

#### `SUPABASE_SERVICE_ROLE_KEY` 노출 0 (선행 PRD 의 핵심 불변 조건)

- 본 PRD 의 어떤 sub-prd 도 SERVICE_ROLE_KEY 를 클라이언트 환경에 두지 않는다
- sub-01 시작 전 `grep -r "SUPABASE_SERVICE_ROLE_KEY" apps/ packages/` 로 잔존 여부 재확인 (legacy 정책)

#### Nativewind 디자인 토큰 검증

- 모바일 화면 작성 시 Tailwind className 그대로 사용 (`<View className="bg-purple-500 p-4">`)
- Sub-04 검증 시 디자인 시스템 토큰(`docs/base/design-system/`) 의 색·간격이 시뮬레이터 화면에 일치하는지 시각 비교

## Sub-PRD 구조 (10개 — Sub-01~05 = 1차 / Sub-06~08 = prototype 정합 후속 / Sub-09 = 모달·DB·설정 정합 / Sub-10 = priority Epic 이전 + 잔존 정책 정합)

본 PRD 승인 후 `/generate-sub-prd` 로 Sub-01 부터 순차 생성한다. 분할은 1차 제안이며, 후속 시점에 작업 흐름 보면서 재분할 가능하다.

Sub-06~08 은 Sub-02·03 머지 후 `docs/base/prototype/` 와의 시각·UX 격차를 해소하기 위해 추가된 후속 묶음이다.

| Sub-PRD | 범위 | 산출물 | 의존 |
|---|---|---|---|
| [**Sub-01: `feat/core-services`**](./sub-prd-01-feat-core-services.md) | `packages/core` 의 services·hooks·realtime·domain 매퍼 실 구현. queryKeys 단일화 | `packages/core/src/{services,hooks,realtime,domain,queryKeys}.ts` | (없음 — 가장 먼저) |
| [**Sub-02: `feat/web-main-view`**](./sub-prd-02-feat-web-main-view.md) | apps/web 메인 일자 뷰 + 섹션 레이아웃 + 날짜 탐색 + 자동 이월 진입 트리거 + Realtime 구독 + 워크스페이스 전환 | `apps/web/src/app/(main)/{life,work}/page.tsx` + 관련 컴포넌트 | Sub-01 |
| [**Sub-03: `feat/web-management`**](./sub-prd-03-feat-web-management.md) | apps/web 분류·Epic·Sub 생성/수정/삭제 모달·페이지 + 설정 화면 + 로그아웃 | `apps/web/src/app/(main)/...` 추가 라우트, 모달 컴포넌트 | Sub-01, Sub-02 |
| [**Sub-04: `feat/mobile-core`**](./sub-prd-04-feat-mobile-core.md) | apps/mobile RN 화면 (로그인, Life/Work 탭, 메인 일자 뷰, 투두 생성, 설정) + Nativewind className 매핑 검증 + OAuth deep link | `apps/mobile/src/components/*`, expo-router 라우트 | Sub-01 |
| [**Sub-05: `test/integration-multi-device`**](./sub-prd-05-test-integration-multi-device.md) | 다중 디바이스 sync (web + iOS 시뮬레이터 동시 접속) / 자동 이월 / Epic 진행률 갱신 / 회귀 시나리오 + EAS Build profile=preview 산출물 빌드 검증 | 검증 체크리스트 + 회귀 시나리오 문서 | Sub-02, Sub-03, Sub-04 |
| [**Sub-06: `feat/web-prototype-visual-alignment`**](./sub-prd-06-feat-web-prototype-visual-alignment.md) ✅ **Done (2026-05-06)** | 사이드바 (로고·아이콘·그룹 헤더·분리선) + 카테고리 chip 필터 + DateNavigator 월간 토글 + TodoItem priority badge / carry-over 뱃지 + 모달 priority radiogroup / 분류 combobox + FAB 데스크탑 노출 + Pretendard Variable | `apps/web/src/components/*`, `packages/ui/src/{TodoItem,DateNavigator}.tsx`, `apps/web/src/app/layout.tsx` | Sub-02, Sub-03 |
| [**Sub-07: `feat/epic-accordion-card`**](./sub-prd-07-feat-epic-accordion-card.md) ✅ **Done (2026-05-06)** | Epic 아코디언 카드 신설 (`EpicAccordionCard` web/mobile) + MainDailyView 일반·Epic 혼재 렌더 + cascade 메인 토글 + Realtime 진행률 갱신 + expand state 영속화 (localStorage / AsyncStorage) | `packages/ui/src/EpicAccordionCard.tsx`, `apps/web/src/components/MainDailyView.tsx`, `apps/mobile/src/components/{EpicAccordionCard,MainDailyViewMobile}.tsx`, `packages/core/src/services/todo.ts` (`cascadeToggleEpic`), `packages/core/src/utils/groupByEpic.ts` | Sub-01, Sub-06 |
| [**Sub-08: `feat/auth-and-empty-state`**](./sub-prd-08-feat-auth-and-empty-state.md) ✅ **Done (2026-05-06)** | Empty state·Spinner·Toast 디자인 SoT 등재 + 공유 컴포넌트 신설 (web + mobile) + 호출 측 리팩터 (MainDailyView / MainDailyViewMobile) + Toaster props 정합 | `packages/ui/src/{EmptyState,Spinner}.tsx`, `apps/mobile/src/components/{EmptyState,Spinner}.tsx`, `docs/base/design-system/components/*.md`, `apps/web/src/components/MainDailyView.tsx`, `apps/web/src/app/layout.tsx`, `apps/mobile/src/components/MainDailyViewMobile.tsx` | (디자인 결정 의존) |
| [**Sub-09: `feat/issue-flow-and-settings-revamp`**](./sub-prd-09-feat-issue-flow-and-settings-revamp.md) | sub_issue/Epic 모달 분리 + 분류 자유입력 Combobox + 설정·관리 페이지 정합 + DB rename/trigger | 마이그레이션 006/007/008, `CategoryComboboxCreate`, `EpicFormModal`/`SubIssueFormModal`, settings 재구현 | Sub-01, Sub-02, Sub-03, Sub-06, Sub-07, Sub-08 |
| [**Sub-10: `refactor/priority-on-epic-and-design-system-alignment`**](./sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) | `priority` 를 sub_issue → epic_issue 로 이전 + AddButton SVG 제거 + Sub 폼 readonly Epic input + Epic 폼 priority DB 연동 + EpicCard priority badge + Settings "앱" → "테마" + mobile 정합 | 마이그레이션 013, `domain/{todo,epic}.ts`, `EpicAccordionCard.priority`, `TodoItem` priority 제거, web/mobile 모달·Settings 갱신 | Sub-01, Sub-02, Sub-03, Sub-06, Sub-07, Sub-08, Sub-09 |

> **분할 원칙**: stack-pivot 의 Phase 4·5 (웹 SPA 골격 / 모바일 골격) 가 끝난 시점부터 시작한다고 가정. 본 PRD 의 sub 들은 골격을 늘여 실 화면들로 확장한다.
> **Sub-06~08 추가 사유**: Sub-02·03 머지 후 prototype 의도와 시각·UX 격차 9건이 누적. Sub-06 (시각·UX 일괄) / Sub-07 (Epic 카드 단일 큰 작업) / Sub-08 (디자인 결정 의존 — Empty/Loading/Toast SoT) 로 책임 분리.

## 리스크 및 완화 방안

| 리스크 | 영향도 | 완화 방안 |
|---|---|---|
| 자동 이월 트리거 누락 (서버 cron 없음) | 높음 | 클라이언트 진입 시점 1군데(`useTodos` effect) 로 집중. 003 마이그레이션의 WHERE 절로 멱등성 보장 |
| Realtime invalidate ↔ optimistic update race | 중간 | invalidate 키를 `packages/core/queryKeys.ts` 에 단일화. Sub-01 단계에서 invalidate 정책 확정 |
| Epic 체크 토글 시 RPC 호출 폭증 | 중간 | `useToggleTodo` 에서 200ms 디바운스. 일괄 체크 시 1회로 합침 |
| Nativewind className 매핑 누락으로 모바일 시각 회귀 | 중간 | Sub-04 검증 시 디자인 토큰(`docs/base/design-system/`) 시각 비교를 종료 게이트로 |
| v1 잔존 코드(`apps/web/src/app/api/**`) 가 SERVICE_ROLE_KEY 노출 위험 | 높음 | Sub-01 시작 전 grep 재확인 (선행 stack-pivot 에서 제거됐지만 재발 방지) |
| Sub-04(모바일) 검증 부담 (OAuth deep link + Nativewind + Realtime sync 동시) | 높음 | iOS 시뮬레이터 + 웹 동시 접속 단일 시나리오로 묶어 Sub-05 통합 검증으로 위임 |
| 본 PRD 의 분할이 실제 구현 흐름과 어긋날 가능성 | 낮음 | Sub-PRD 분할은 1차 제안. `/generate-sub-prd` 시점에 재분할 가능 |

## 검증 계획

각 Sub-PRD 종료 시점:

| Sub | 검증 |
|---|---|
| 01 | `pnpm --filter @todo-list/core build` 통과 + 단위 테스트 (`vitest run`) — services·매퍼·queryKeys |
| 02 | `pnpm --filter @todo-list/web build` 통과 + `make web-up` 으로 `/life` 진입, 카테고리·Epic·Sub 시드 후 일자 뷰 렌더 + 자동 이월 트리거 호출 + Realtime 구독 동작 (DB 직접 조작 시 UI 즉시 반영) |
| 03 | 분류·Epic CRUD UI 회귀 (생성→수정→삭제) + 설정 화면 로그아웃 → 로그인 화면 복귀 |
| 04 | `pnpm --filter @todo-list/mobile dev` (`expo start`) iOS 시뮬레이터 부팅 + Google OAuth 콜백 deep link 수신 + 메인 일자 뷰 렌더 + 디자인 토큰 매핑 일치 |
| 05 | 다중 디바이스 sync (web + iOS 시뮬레이터 동시 접속, 한쪽 todo 추가 시 양쪽 즉시 반영) + 자동 이월 시나리오 (어제 미완료 todo 가 오늘 진입 시 이월) + Epic 진행률 갱신 시나리오 (체크 토글 시 디바운스 후 progress 반영) + EAS Build profile=preview 산출물 빌드 성공 |

## 향후 개선 계획 (Future Scope)

| 항목 | 설명 | 우선순위 |
|---|---|---|
| Kakao OAuth | MVP 미포함. Supabase Kakao provider + 로그인 버튼 + KakaoIcon. sub-prd-08 에서 분리되어 후속 sub 로 진행 | P3 |
| 모바일 푸시 알림 | 이월·완료 리마인드 (expo-notifications) | P3 |
| Web Push (PWA) | 데스크톱·모바일 브라우저 알림 | P3 |
| 데스크탑(Electron) | stack-pivot Future Scope 와 통합 — `apps/desktop` 신설 후 동일 SPA wrapping | P3 |
| 통계·인사이트 화면 | 주간/월간 완료율, 카테고리별 분포 차트 | P3 |
| 카테고리·Epic 정렬 드래그앤드롭 | `sort_order` 컬럼 활용한 reorder UX | P3 |
| 투두 라벨/태그 | 우선순위 외 추가 분류 차원 | P3 |
| 검색·필터 | 제목·설명 검색, 우선순위·상태 필터 | P3 |

## 관련 문서

- 요구사항 (서비스 기획서): [`detail-todo-service-initialize.md`](./detail-todo-service-initialize.md)
- API 계약: [`API_CONTRACT.md`](./API_CONTRACT.md)
- 선행 PRD (v2 인프라): [`../20260502-01-stack-pivot/main-prd-stack-pivot.md`](../20260502-01-stack-pivot/main-prd-stack-pivot.md)
- 디자인 시스템 명세: [`../20260501-01-design-system/detail-design-system.md`](../20260501-01-design-system/detail-design-system.md)
- 디자인 프로토타입: [`../20260501-02-design-prototype/main-prd-design-prototype.md`](../20260501-02-design-prototype/main-prd-design-prototype.md)

---

*이 문서는 `투두 서비스 초기화` 프로젝트의 메인 PRD입니다. 상세 구현 사항은 본 PRD 승인 후 생성될 각 Sub-PRD를 참조하세요.*
