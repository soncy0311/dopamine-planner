# Task 02-02: Supabase 클라이언트 + 타입 alias + 도메인 타입

## 작업 정보

- **Sub-PRD**: `sub-prd-02-feat-core-package.md`
- **의존성**: 02-01 (`packages/core` 골격 존재)
- **대상 파일**:
  - `packages/core/src/supabase/createClient.ts`
  - `packages/core/src/supabase/types.ts`
  - `packages/core/src/domain/todo.ts`
  - `packages/core/src/domain/epic.ts`
  - `packages/core/src/domain/category.ts`
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-02-feat-core-package.md`, `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `packages/core/src/supabase/createClient.ts` 팩토리 시그니처 + 기본 구현
- [ ] `packages/core/src/supabase/types.ts` (`SupabaseClient<Database>` alias)
- [ ] `packages/core/src/domain/{todo,epic,category}.ts` 타입 alias stub

## 구현 세부사항

### 1. `supabase/createClient.ts` (Sub-PRD §핵심 구현 로직 코드 그대로)

```ts
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@todo-list/shared/database';

export type StorageAdapter = {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
};

export type CreateClientOptions = {
  url: string;
  anonKey: string;
  storage: StorageAdapter;
};

export function createClient(opts: CreateClientOptions): SupabaseClient<Database> {
  return createSupabaseClient<Database>(opts.url, opts.anonKey, {
    auth: { storage: opts.storage as any, persistSession: true, autoRefreshToken: true },
  });
}
```

- storage adapter 는 호출 측이 주입 — web=`window.localStorage`, mobile=`AsyncStorage` wrapper
- 본 파일에서 `window` / `AsyncStorage` / `react-native` import 금지

### 2. `supabase/types.ts`

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@todo-list/shared/database';

export type AppSupabaseClient = SupabaseClient<Database>;
export type { Database };
```

- `Database` 타입은 Sub-03 의 `supabase gen types` 산출물 — 본 단계에는 파일 없음. 미존재 시 typecheck 가 실패할 수 있음 → 그 경우 임시로 `packages/shared/src/database.ts` 에 `export type Database = any;` placeholder 만 둘 수 있음 (Sub-03 가 덮어씀)

### 3. `domain/{todo,epic,category}.ts` — 타입 alias stub

각 파일 동일 패턴:

```ts
// domain/todo.ts
import type { Database } from '@todo-list/shared/database';

export type TodoRow = Database['public']['Tables']['sub_issue']['Row'];
export type TodoInsert = Database['public']['Tables']['sub_issue']['Insert'];
export type TodoUpdate = Database['public']['Tables']['sub_issue']['Update'];

// View 타입은 Sub-04 가 실 정의 — 현재는 alias stub
export type TodoView = TodoRow;
```

- `epic.ts`, `category.ts` 도 동일 패턴 (테이블명은 API_CONTRACT.md 기준 — 정확한 테이블명 미확정 시 임시 alias 두고 Sub-04 가 보정)

## 주의사항

1. **플랫폼 독립 TS 만** — `window`, `AsyncStorage`, `react-native`, `next/*`, DOM API import 금지 (Sub-PRD §주의사항 1)
2. **`packages/shared/src/database.ts` 는 Sub-03 산출물** — import 경로만 예약, 본 task 가 직접 생성하지 않음 (Sub-PRD §주의사항 5)
3. **typecheck 임시 placeholder** — `Database` 타입 미존재로 컴파일 실패 시 `packages/shared/src/database.ts` 에 `export type Database = any;` 로만 임시 선언 (Sub-03 자동 생성에 의해 덮어쓰여짐)
4. **createClient 코드는 Sub-PRD 코드 그대로** — auth 옵션·시그니처 변경 금지

## 검증 체크리스트

- [ ] `grep -RIn "from 'react-native'\|from 'next/\|window\.\|AsyncStorage" packages/core/src/supabase packages/core/src/domain` 결과 0건
- [ ] `pnpm --filter @todo-list/core typecheck` 통과
- [ ] `createClient` 의 시그니처가 Sub-PRD §핵심 구현 로직 코드와 1:1 일치
- [ ] `supabase/types.ts` 가 `SupabaseClient<Database>` alias 노출
- [ ] `domain/{todo,epic,category}.ts` 3개 파일 모두 존재 + Row/Insert/Update alias 정의
