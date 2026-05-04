# Task 02-03: services / hooks / realtime stub

## 작업 정보

- **Sub-PRD**: `sub-prd-02-feat-core-package.md`
- **의존성**: 02-02 (Supabase 클라이언트 / 타입 alias / 도메인 alias 존재)
- **대상 파일**:
  - `packages/core/src/services/carryOver.ts`
  - `packages/core/src/services/epicProgress.ts`
  - `packages/core/src/hooks/useTodos.ts`
  - `packages/core/src/hooks/useCreateTodo.ts`
  - `packages/core/src/hooks/useUpdateTodo.ts`
  - `packages/core/src/hooks/useDeleteTodo.ts`
  - `packages/core/src/realtime/subscribeTodos.ts`
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-02-feat-core-package.md`, `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` (§4 RPC 함수 시그니처)

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `packages/core/src/services/carryOver.ts` 시그니처 + stub 본문
- [ ] `packages/core/src/services/epicProgress.ts` 시그니처 + stub 본문
- [ ] `packages/core/src/hooks/{useTodos,useCreateTodo,useUpdateTodo,useDeleteTodo}.ts` 시그니처 + stub 본문
- [ ] `packages/core/src/realtime/subscribeTodos.ts` 헬퍼 시그니처 + stub 본문

## 구현 세부사항

### 1. `services/carryOver.ts`

```ts
import type { AppSupabaseClient } from '../supabase/types';

export type CarryOverArgs = { target_date: string };
export type CarryOverResult = { /* Database['public']['Functions']['carry_over_todos']['Returns'] */ };

export async function carryOverTodos(
  client: AppSupabaseClient,
  args: CarryOverArgs,
): Promise<CarryOverResult> {
  throw new Error('not implemented in sub-02');
  // Sub-04: return client.rpc('carry_over_todos', args).then(...)
}
```

### 2. `services/epicProgress.ts`

```ts
import type { AppSupabaseClient } from '../supabase/types';

export type RecalcEpicProgressArgs = { epic_id: string };
export type RecalcEpicProgressResult = { /* Database['public']['Functions']['recalc_epic_progress']['Returns'] */ };

export async function recalcEpicProgress(
  client: AppSupabaseClient,
  args: RecalcEpicProgressArgs,
): Promise<RecalcEpicProgressResult> {
  throw new Error('not implemented in sub-02');
}
```

### 3. `hooks/*.ts` — TanStack Query wrapper stub

queryKey 컨벤션 (Sub-PRD §핵심 구현 로직):

- `['todos', { workspace, date }]`
- `['epics', { workspace }]`
- `['categories', { workspace }]`

각 훅 패턴 예시 (`useTodos.ts`):

```ts
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import type { TodoView } from '../domain/todo';

export type UseTodosArgs = {
  client: AppSupabaseClient;
  workspace: 'life' | 'work';
  date: string;
};

export function useTodos(args: UseTodosArgs): UseQueryResult<TodoView[]> {
  return useQuery<TodoView[]>({
    queryKey: ['todos', { workspace: args.workspace, date: args.date }],
    queryFn: async () => {
      throw new Error('not implemented in sub-02');
    },
  });
}
```

`useCreateTodo` / `useUpdateTodo` / `useDeleteTodo` 는 `useMutation` 패턴 동일:

```ts
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
// 시그니처: { client, input } → Promise<TodoView>
// mutationFn 본문은 throw new Error('not implemented in sub-02')
```

### 4. `realtime/subscribeTodos.ts` (Sub-PRD §핵심 구현 로직 코드 그대로)

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@todo-list/shared/database';

export function subscribeTodos(
  client: SupabaseClient<Database>,
  workspace: 'life' | 'work',
  onChange: (event: 'INSERT' | 'UPDATE' | 'DELETE') => void,
): () => void {
  const channel = client.channel(`todos:${workspace}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_issue' }, (payload) => {
      onChange(payload.eventType);
    })
    .subscribe();
  return () => { client.removeChannel(channel); };
}
```

## 주의사항

1. **stub 정책 엄수** — 함수 시그니처 + 인자 타입 + 반환 타입만 정의. 본문은 `throw new Error('not implemented in sub-02')` 또는 빈 구현 (Sub-PRD §주의사항 4)
2. **시그니처가 API_CONTRACT.md §4 RPC 함수 시그니처와 1:1 일치** — RPC 인자명·반환 형태 임의 변경 금지
3. **플랫폼 독립** — `window` / `AsyncStorage` / `react-native` / `next/*` import 금지
4. **`subscribeTodos` 코드는 Sub-PRD 코드 그대로** — channel 이름·이벤트 타입 변경 금지
5. **Sub-04 가 본문을 채움** — 본 task 는 컴파일 통과만 보장

## 검증 체크리스트

- [ ] `pnpm --filter @todo-list/core typecheck` 통과
- [ ] services / hooks / realtime 7개 파일 모두 존재
- [ ] 각 함수 시그니처가 API_CONTRACT.md §4 RPC 함수 시그니처와 1:1 일치
- [ ] hooks 의 queryKey 컨벤션이 Sub-PRD §핵심 구현 로직 (`['todos', { workspace, date }]` 등) 과 일치
- [ ] `grep -RIn "from 'react-native'\|from 'next/\|window\.\|AsyncStorage" packages/core/src/services packages/core/src/hooks packages/core/src/realtime` 결과 0건
- [ ] `subscribeTodos` 의 시그니처와 channel 구독 구조가 Sub-PRD 코드 블록과 일치
