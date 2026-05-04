# Task 04-04: core services 실 구현 (carryOver / epicProgress)

## 작업 정보

- **Sub-PRD**: `sub-prd-04-feat-web-spa.md`
- **의존성**: Sub-02 stub 존재 (`packages/core/src/services/{carryOver,epicProgress}.ts` 시그니처), Sub-03 task 03-03 완료 (`carry_over_todos`, `recalc_epic_progress` RPC 적용)
- **대상 파일**:
  - `packages/core/src/services/carryOver.ts` (Sub-02 stub 본문 채움)
  - `packages/core/src/services/epicProgress.ts` (Sub-02 stub 본문 채움)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-04-feat-web-spa.md`, `sub-prd-02-feat-core-package.md`, `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `packages/core/src/services/carryOver.ts` 실 구현 (`supabase.rpc('carry_over_todos', ...)`)
- [ ] `packages/core/src/services/epicProgress.ts` 실 구현 (`supabase.rpc('recalc_epic_progress', ...)`)

## 구현 세부사항

### 1. `carryOver.ts`

Sub-02 가 정의한 시그니처 유지 (`AppSupabaseClient` 를 첫 인자로). RPC `carry_over_todos` 호출.

```ts
import type { AppSupabaseClient } from '../supabase/types';

export async function carryOverTodos(
  client: AppSupabaseClient,
  targetDate: string,
): Promise<{ moved_count: number }> {
  const { data, error } = await client.rpc('carry_over_todos', { target_date: targetDate });
  if (error) throw error;
  // RPC returns table 형태 — 첫 행을 반환
  const row = Array.isArray(data) ? data[0] : data;
  return { moved_count: row?.moved_count ?? 0 };
}
```

### 2. `epicProgress.ts`

```ts
import type { AppSupabaseClient } from '../supabase/types';

export async function recalcEpicProgress(
  client: AppSupabaseClient,
  epicId: string,
): Promise<{ progress: number }> {
  const { data, error } = await client.rpc('recalc_epic_progress', { epic_id: epicId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { progress: row?.progress ?? 0 };
}
```

> 실제 반환 칼럼명 (`moved_count`, `progress`) 은 Sub-03 의 RPC 정의 (`API_CONTRACT.md §4`) 와 정확히 일치. 칼럼 mismatch 시 contract 문서를 우선 갱신 후 본 코드 수정.

## 주의사항

1. **시그니처 불변** — Sub-02 의 시그니처를 유지. 변경 시 Sub-05 mobile 측 import 가 깨짐 (Sub-PRD §주의사항 4)
2. **`client` 외부 주입** — `@todo-list/core` 는 플랫폼 독립. supabase 싱글톤 import 금지 (Sub-PRD §8 — Sub-02 결정)
3. **error throw 정책** — RPC error 발생 시 throw. 호출 측 (TanStack Query mutation) 이 캐치하여 UI 처리
4. **RPC 인자명 일치** — `target_date`, `epic_id` (snake_case) — Postgres 함수 정의와 정확히 일치. camelCase 사용 금지

## 검증 체크리스트

- [ ] `grep -n "rpc('carry_over_todos'" packages/core/src/services/carryOver.ts` 1건
- [ ] `grep -n "rpc('recalc_epic_progress'" packages/core/src/services/epicProgress.ts` 1건
- [ ] `grep -RIn "from 'react-native'" packages/core/src/services/` 0건
- [ ] `grep -RIn "from 'next/" packages/core/src/services/` 0건
- [ ] `grep -RIn "window\." packages/core/src/services/` 0건
- [ ] `pnpm --filter @todo-list/core typecheck` exit code 0 (또는 `pnpm --filter @todo-list/core build`)
- [ ] `grep -n "throw error" packages/core/src/services/carryOver.ts packages/core/src/services/epicProgress.ts` 각 1건
