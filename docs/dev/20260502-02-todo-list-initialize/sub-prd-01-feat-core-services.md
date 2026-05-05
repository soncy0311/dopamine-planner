# SUB-PRD: `코어 서비스·훅 구현`

## 작업 정보

- **작업명**: `코어 서비스·훅 구현`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-05
- **종료일**: 2026-05-05
- **최신 업데이트**: 2026-05-05
- **상태**: 완료
- **Main PRD**: [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md)
- **선행 Sub-PRD**: 없음 (본 sprint 내 가장 먼저)
- **선행 Sprint**: [`../20260502-01-stack-pivot/sub-prd-02-feat-core-package.md`](../20260502-01-stack-pivot/sub-prd-02-feat-core-package.md) (stub 골격 머지 완료)

## 배경 및 목적

선행 sprint(`stack-pivot`) Sub-02 가 `packages/core/src/` 의 디렉토리 골격과 stub 시그니처만 깐 상태로 머지됐다. 본 sub 는 그 stub 을 **실 구현으로 교체**해 web/mobile 양 갈래가 동일 비즈니스 로직을 import 할 수 있게 만든다. main-prd §핵심 서비스 구현 (`packages/core`) 표 7행과 1:1 매핑된다.

stack-pivot 종료 시점에 확보된 자산:

- 마이그레이션 머지 완료 — 4 테이블 + RLS + RPC 2종(`carry_over_todos`, `recalc_epic_progress`) + Realtime publication
- `packages/shared/src/database.ts` (`supabase gen types` 산출, `Database` 타입 export, RPC 시그니처 포함)
- `packages/core/src/supabase/createClient.ts` (env + storage adapter 주입 팩토리)

본 sub 가 채울 빈자리: 도메인 매퍼 / Category·Epic·Sub 서비스 / RPC 호출 thin wrapper / TanStack Query 훅 / Realtime 구독 헬퍼 / queryKeys 단일화 / 자동 이월 진입 트리거 effect.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 언어 | TypeScript (strict) |
| Supabase SDK | `@supabase/supabase-js` (peerDependency) |
| Query | `@tanstack/react-query` v5 (peerDependency) |
| 디바운스 | 자체 setTimeout 기반 (외부 의존성 추가 없음) |
| 모듈 | ESM (TS) |
| 의존 관리 | pnpm workspaces (`workspace:*`) |

## 핵심 요구 사항

### 1. queryKeys 단일화 (`src/queryKeys.ts`)

- 모든 훅·realtime 헬퍼·invalidate 는 `queryKeys.*` 헬퍼만 통과한다 (문자열 리터럴 직접 작성 금지)
- 정의:
  - `queryKeys.todos(workspace, date)` → `['todos', { workspace, date }]`
  - `queryKeys.epics(workspace)` → `['epics', { workspace }]`
  - `queryKeys.epicsByCategory(categoryId)` → `['epics', { categoryId }]`
  - `queryKeys.categories(workspace)` → `['categories', { workspace }]`
  - `queryKeys.profile()` → `['profile']`
- `invalidateByTable(qc, table)` 헬퍼: Realtime payload 의 테이블명 → 해당 queryKey prefix invalidate

### 2. 도메인 매퍼 (`src/domain/{todo,epic,category}.ts`)

- DB Row(snake_case) → View(camelCase) 변환 함수
- API_CONTRACT §7 의 TS 타입과 1:1 매핑
- 함수: `mapCategoryRow`, `mapEpicRow`, `mapSubIssueRow` + 역변환은 만들지 않음 (insert payload 는 호출 측에서 snake_case 직접 작성)
- 일자별 조회용 합성 매퍼: `mapTodoDailyView(rows, date)` — `done` / `todo` 분리

### 3. Category 서비스 (`src/services/category.ts`)

- `listByWorkspace(client, workspace)` — `from('category').select('*').eq('workspace', ws).order('sort_order')`
- `create(client, payload)` — insert + `.select().single()`
- `update(client, id, patch)` — update by id
- `remove(client, id)` — delete by id (FK 위반 에러는 호출 측에서 처리)
- 모든 함수는 `Category[]` 또는 `Category` 반환 (매퍼 통과 후)

### 4. Epic 서비스 (`src/services/epic.ts`)

- `listByCategory(client, categoryId)` — `from('epic_issue').select('*').eq('category_id', id)`
- `listByWorkspace(client, workspace)` — JOIN 으로 category 워크스페이스 필터
- `create / update / remove` — Category 와 동일 패턴
- `recalcProgress(client, epicId)` — `services/epicProgress.ts` 위임

### 5. Sub 서비스 (`src/services/todo.ts`)

- `listByDate(client, workspace, date)` — API_CONTRACT §3.3 의 nested select (epic + category JOIN)
- `create(client, payload)` / `update(client, id, patch)` / `remove(client, id)`
- `toggle(client, id, nextStatus)` — status + completed_date 동시 업데이트

### 6. RPC 호출 wrapper (`src/services/{carryOver,epicProgress}.ts`)

- `carryOverTodos(client, targetDate)` → `data?.[0]?.moved_count ?? 0` 추출
- `recalcEpicProgress(client, epicId)` → `data?.[0]?.progress ?? 0` 추출
- 단일 row 배열 첫 번째 추출 패턴 일관 적용 (003·004 마이그레이션 정합)

### 7. TanStack Query 훅 (`src/hooks/`)

- 조회: `useCategories(workspace)`, `useEpics(workspaceOrCategoryId)`, `useTodos(workspace, date)`
- 변경: `useCreateTodo()`, `useUpdateTodo()`, `useDeleteTodo()`, `useToggleTodo()` + Category·Epic 의 동일 셋
- 모든 훅의 `mutationFn` 은 services 함수만 호출. queryClient invalidate 는 `queryKeys.*` 통과
- `useToggleTodo` 는 optimistic update + 200ms debounce 후 `recalcEpicProgress` 호출

### 8. Realtime 헬퍼 (`src/realtime/subscribeTodos.ts`)

- 4 테이블 (`profile`, `category`, `epic_issue`, `sub_issue`) 통합 구독 단일 채널
- 시그니처: `subscribeTodos(client, qc): () => void`
- payload.table → `invalidateByTable(qc, table)` 매핑
- unsubscribe 함수 반환

### 9. 자동 이월 진입 트리거 (`src/hooks/useTodos.ts` effect)

- `useTodos(workspace, today)` 가 마운트되면 1회 `carryOverTodos(client, today)` 호출
- 멱등성은 003 마이그레이션 WHERE 절이 보장 → 중복 호출 안전
- 호출 결과의 `moved_count` 를 `qc.invalidateQueries(queryKeys.todos(workspace, today))` 로 즉시 반영
- 사용자 알림 없음 (조용한 이월)

## 핵심 구현 로직

### `useToggleTodo` — optimistic + 200ms debounce

```ts
export function useToggleTodo(client: SupabaseClient<Database>) {
  const qc = useQueryClient();
  const debouncedRecalc = useMemo(() => debounceByEpic(200, (epicId) =>
    recalcEpicProgress(client, epicId)), [client]);

  return useMutation({
    mutationFn: async (input: { id: string; epicId: string; nextStatus: TodoStatus }) =>
      todoService.toggle(client, input.id, input.nextStatus),
    onMutate: async (input) => {
      // optimistic: snapshot + update cache
      // (queryKeys.todos prefix 의 모든 캐시 항목에서 해당 id 의 status 갱신)
    },
    onError: (_err, _input, ctx) => {
      // rollback to snapshot
    },
    onSuccess: (_data, input) => {
      debouncedRecalc(input.epicId);
    },
    onSettled: (_data, _err, input) => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['epics'] });
    },
  });
}
```

### `subscribeTodos` — 4 테이블 통합 구독

```ts
export function subscribeTodos(
  client: SupabaseClient<Database>,
  qc: QueryClient,
): () => void {
  const channel = client.channel('todos:all')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_issue' },
      (p) => invalidateByTable(qc, 'sub_issue'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'epic_issue' },
      (p) => invalidateByTable(qc, 'epic_issue'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'category' },
      (p) => invalidateByTable(qc, 'category'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profile' },
      (p) => invalidateByTable(qc, 'profile'))
    .subscribe();
  return () => { client.removeChannel(channel); };
}
```

### `carryOverTodos` — 단일 row 배열 추출

```ts
export async function carryOverTodos(
  client: SupabaseClient<Database>,
  targetDate: string,
): Promise<number> {
  const { data, error } = await client.rpc('carry_over_todos', { target_date: targetDate });
  if (error) throw error;
  return data?.[0]?.moved_count ?? 0;
}
```

## 구현 시 주의사항

1. **플랫폼 의존 import 0건** — `packages/core/src/` 안에서 `window`, `AsyncStorage`, `react-native`, `next/*`, DOM API import 금지 (storage adapter 는 인자 주입)
2. **RPC 반환 배열 첫 번째 추출** — 003·004 마이그레이션이 `returns table(...)` 이므로 supabase-js 는 단일 row 배열로 받는다. `data?.[0]?.<col>` 일관 적용
3. **queryKeys 헬퍼 통과 의무** — 문자열 리터럴 (`['todos', ...]`) 직접 작성 금지. 모든 위치에서 `queryKeys.*` import
4. **RLS 이중 필터 금지** — Supabase 직접 호출에서 `.eq('user_id', auth.uid())` 추가 작성 금지 (RLS 가 처리). 002 마이그레이션 정합
5. **자동 이월 트리거 위치 단일화** — `useTodos` 의 진입 effect 1군데. web/mobile 별도 호출 금지 (선행 PRD §기술적 고려사항)
6. **debounce 는 epic 단위** — `useToggleTodo` 의 디바운스 키는 `epicId`. 서로 다른 epic 의 토글은 독립적으로 처리
7. **react-query peerDependency** — `packages/core/package.json` 에 dependencies 추가 금지. web/mobile 각자 React 19 / RN React 결정
8. **삭제 시 FK 에러는 throw** — 카테고리 삭제 시 23503 발생 가능. 호출 측 (sub-03 모달) 에서 친화 토스트 처리

## 작업

- [x] `packages/core/src/queryKeys.ts` 신설 (헬퍼 함수 + `invalidateByTable` 추가)
- [x] `packages/core/src/domain/category.ts` 매퍼 실 구현 (`mapCategoryRow`)
- [x] `packages/core/src/domain/epic.ts` 매퍼 실 구현 (`mapEpicRow`)
- [x] `packages/core/src/domain/todo.ts` 매퍼 실 구현 (`mapSubIssueRow`, `mapTodoDailyView`)
- [x] `packages/core/src/services/category.ts` CRUD 4종 본문 작성
- [x] `packages/core/src/services/epic.ts` CRUD 4종 + `listByWorkspace` 본문 작성
- [x] `packages/core/src/services/todo.ts` CRUD + `toggle` + `listByDate` 본문 작성
- [x] `packages/core/src/services/carryOver.ts` 본문 작성 (배열 추출)
- [x] `packages/core/src/services/epicProgress.ts` 본문 작성 (배열 추출)
- [x] `packages/core/src/hooks/useTodos.ts` 본문 작성 + 자동 이월 effect
- [x] `packages/core/src/hooks/useCreateTodo.ts` / `useUpdateTodo.ts` / `useDeleteTodo.ts` 본문 작성
- [x] `packages/core/src/hooks/useToggleTodo.ts` 본문 작성 (optimistic + 200ms debounce)
- [x] `packages/core/src/hooks/useEpics.ts` / `useCreateEpic.ts` / `useUpdateEpic.ts` / `useDeleteEpic.ts` 본문 작성
- [x] `packages/core/src/hooks/useCategories.ts` / `useCreateCategory.ts` / `useUpdateCategory.ts` / `useDeleteCategory.ts` 본문 작성
- [x] `packages/core/src/realtime/subscribeTodos.ts` 4 테이블 통합 구독 본문 작성
- [x] `packages/core/src/index.ts` 에 신규 export 추가
- [x] `packages/core/src/__tests__/` 단위 테스트 작성 (매퍼 round-trip, queryKeys 헬퍼, RPC 배열 추출)
- [x] `pnpm --filter @todo-list/core build` 통과
- [x] `pnpm --filter @todo-list/core typecheck` 통과
- [x] `pnpm --filter @todo-list/core test` 통과

## 검증 기준

- [x] `pnpm --filter @todo-list/core build` 통과
- [x] `pnpm --filter @todo-list/core typecheck` 통과
- [x] `pnpm --filter @todo-list/core test` 통과 (단위 테스트 — 매퍼 / queryKeys / RPC 배열 추출 / debounce, 24 tests)
- [x] `grep -RIn "from 'react-native'\|from 'next/\|window\.\|AsyncStorage" packages/core/src/` 결과 0건
- [x] `grep -RIn "queryKeys\." packages/core/src/` 결과 13건 (≥ 7)
- [x] `grep -RIn "carry_over_todos\|recalc_epic_progress" packages/core/src/` 결과 2건 (≥ 2)
- [x] `grep -RIn "data?.\[0\]" packages/core/src/services/` 결과 2건 (≥ 2)
- [x] `grep -RIn "\.eq('user_id'" packages/core/src/` 결과 0건 (RLS 이중 필터 금지)
- [x] `useToggleTodo` 디바운스 검증 — 동일 epic 의 sub 5개를 200ms 내 토글했을 때 `recalc_epic_progress` 호출이 1회로 합쳐지는지 단위 테스트로 확인

---

*이 문서는 `투두 서비스 초기화` 프로젝트의 Sub-PRD 입니다. 전체 범위는 [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md) 를 참조하세요.*
