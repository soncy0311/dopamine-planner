# Task 04-05: core hooks 실 구현 (useTodos / useCreate / useUpdate / useDeleteTodo)

## 작업 정보

- **Sub-PRD**: `sub-prd-04-feat-web-spa.md`
- **의존성**: Sub-02 stub 존재, 04-04 (services 구현 완료 — 일부 mutation 에서 사용 가능)
- **대상 파일**:
  - `packages/core/src/hooks/useTodos.ts` (실 구현)
  - `packages/core/src/hooks/useCreateTodo.ts` (실 구현)
  - `packages/core/src/hooks/useUpdateTodo.ts` (실 구현)
  - `packages/core/src/hooks/useDeleteTodo.ts` (실 구현)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-04-feat-web-spa.md`, `sub-prd-02-feat-core-package.md`, `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `packages/core/src/hooks/useTodos.ts` 실 구현 (TanStack Query useQuery — JOIN 패턴 + `due_date` + `epic.category.workspace` 필터)
- [x] `packages/core/src/hooks/useCreateTodo.ts`, `useUpdateTodo.ts`, `useDeleteTodo.ts` 실 구현 (useMutation + `['todos']` 광역 invalidate)

## 구현 세부사항

### 1. `useTodos.ts`

`workspace` + `date` 별 조회. queryKey 는 `['todos', { workspace, date }]` — Realtime invalidation 과 동일 prefix (`['todos']`) 공유.

> **중요**: `sub_issue` 테이블에는 `workspace` 칼럼이 없다. workspace 는 `category` 에만 존재하므로 `epic_issue` → `category` 로 JOIN 한 후 nested filter (`epic.category.workspace`) 를 사용해야 한다 (API_CONTRACT.md §3.3 정합).

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
  const { client, workspace, date } = args;
  return useQuery<TodoView[]>({
    queryKey: ['todos', { workspace, date }],
    queryFn: async () => {
      const { data, error } = await client
        .from('sub_issue')
        .select(
          `*,
           epic:epic_issue!inner (
             id, title,
             category:category!inner ( id, name, color, workspace )
           )`,
        )
        .eq('due_date', date)
        .eq('epic.category.workspace', workspace);
      if (error) throw error;
      return (data ?? []) as TodoView[];
    },
  });
}
```

> 실제 select 절 / 칼럼명은 `API_CONTRACT.md §4` 기준. mismatch 발견 시 contract 문서 우선.

### 2. `useCreateTodo.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';

type CreatePayload = {
  workspace: 'life' | 'work';
  title: string;
  due_date: string;
  // 나머지 필드는 API_CONTRACT.md §4 기준
};

export function useCreateTodo(client: AppSupabaseClient) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePayload) => {
      const { data, error } = await client.from('sub_issue').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

### 3. `useUpdateTodo.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';

type UpdatePayload = {
  id: string;
  patch: Partial<{ title: string; status: string; due_date: string }>;
};

export function useUpdateTodo(client: AppSupabaseClient) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: UpdatePayload) => {
      const { data, error } = await client
        .from('sub_issue')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

### 4. `useDeleteTodo.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';

export function useDeleteTodo(client: AppSupabaseClient) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client.from('sub_issue').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

## 주의사항

1. **`client` 첫 인자 — 싱글톤 import 금지** — `@todo-list/core` 는 플랫폼 독립. supabase 모듈을 직접 import 하지 않는다 (Sub-PRD §8)
2. **select 절 / payload 칼럼명** — `API_CONTRACT.md §4` 기준. mismatch 시 contract 우선 갱신
3. **queryKey 일관성** — `['todos', { workspace, date }]` 키 prefix 가 `['todos']` 로 시작 → mutation 의 invalidation 은 `['todos']` 로 광역 무효화 (date 별 캐시 모두 갱신)
4. **`useQueryClient()` 호출** — 각 mutation 훅 내부에서 호출. 호출 측에서 주입받지 않는다 (TanStack Query 표준 패턴)
5. **시그니처 불변** — Sub-05 mobile 도 동일 import. `(client: AppSupabaseClient, ...)` 첫 인자 패턴 유지

## 검증 체크리스트

- [x] `ls packages/core/src/hooks/useTodos.ts packages/core/src/hooks/useCreateTodo.ts packages/core/src/hooks/useUpdateTodo.ts packages/core/src/hooks/useDeleteTodo.ts` — 4개 모두 존재
- [x] `grep -l "useQuery" packages/core/src/hooks/useTodos.ts` 매치
- [x] `grep -l "useMutation" packages/core/src/hooks/useCreateTodo.ts packages/core/src/hooks/useUpdateTodo.ts packages/core/src/hooks/useDeleteTodo.ts` — 3개 모두 매치
- [x] `grep -RIn "from 'react-native'" packages/core/src/hooks/` 0건
- [x] `grep -RIn "from 'next/" packages/core/src/hooks/` 0건
- [x] `grep -RIn "invalidateQueries" packages/core/src/hooks/` 3건 이상 (mutation 훅 3개)
- [ ] **(사용자 환경)** `pnpm --filter @todo-list/core typecheck` exit code 0
