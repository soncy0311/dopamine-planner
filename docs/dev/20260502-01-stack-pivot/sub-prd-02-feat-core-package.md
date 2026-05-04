# SUB-PRD: `패키지 골격`

## 작업 정보

- **작업명**: `패키지 골격`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-04
- **종료일**: 2026-05-04
- **최신 업데이트**: 2026-05-04
- **상태**: 구현 완료 (코드 변경 적용됨, `pnpm install` / build / typecheck 는 사용자 환경에서 실행 필요)

## 배경 및 목적

web/mobile (+ 후속 desktop) 가 공유할 비즈니스 로직 모듈 `packages/core` 와 디자인 토큰 단일 source `packages/config/tailwind.config.js` 를 신설한다. main PRD §3 (공통 클라이언트 패키지 신설) 결정의 코드 기반을 마련하여 Sub-04 / Sub-05 가 동일 헬퍼를 import 할 수 있도록 한다. **본 단계는 진입점·디렉토리 골격 + tailwind 공유 config 만 다루며, 비즈니스 로직 stub 의 실 구현은 Sub-04 / Sub-05 에서 채운다.**

## 기술 스택

| 영역 | 기술 |
|------|------|
| 언어 | TypeScript (strict) |
| Supabase SDK | `@supabase/supabase-js` |
| Query | `@tanstack/react-query` |
| 디자인 토큰 | Tailwind v3 (web) + Nativewind v4 호환 (mobile) |
| 모듈 | ESM (TS) + CommonJS (tailwind config) |
| 의존 관리 | pnpm workspaces (`workspace:*`) |

## 핵심 요구 사항

### 1. `packages/core/` 신설

```
packages/core/
├── package.json            # 이름·버전·exports·deps
├── tsconfig.json           # strict, extends @todo-list/config
└── src/
    ├── index.ts                 # 빈 re-export (빌드 통과용)
    ├── supabase/
    │   ├── createClient.ts      # env 주입형 팩토리 (storage adapter 분기)
    │   └── types.ts             # SupabaseClient<Database> alias
    ├── domain/
    │   ├── todo.ts
    │   ├── epic.ts
    │   └── category.ts
    ├── services/
    │   ├── carryOver.ts         # supabase.rpc('carry_over_todos', ...)
    │   └── epicProgress.ts      # supabase.rpc('recalc_epic_progress', ...)
    ├── hooks/
    │   ├── useTodos.ts
    │   ├── useCreateTodo.ts
    │   └── ...                  # TanStack Query 훅
    └── realtime/
        └── subscribeTodos.ts    # 채널 구독 헬퍼
```

각 파일은 진입점·타입 alias 만 작성한다. 본 단계의 stub 정책:

- 함수 시그니처 + 인자 타입 + 반환 타입 정의
- 실 본문은 `throw new Error('not implemented in sub-02')` 또는 빈 구현
- Sub-04 가 services / hooks / realtime 의 실 구현을 채움
- Sub-05 도 동일 stub 을 import 하여 RN 측에서 사용

### 2. `packages/config/tailwind.config.js` 신설

- CommonJS (`module.exports`) — Tailwind 가 require 로 로드
- `theme.extend` 에 디자인 토큰 매핑:
  - color: `docs/base/design-system/tokens.md` § Primitive 컬러 토큰 표의 토큰명·HEX 값과 동일 키
  - spacing: `--spacing-{1..8}` → tailwind spacing 키
  - borderRadius: `--radius-{sm,md,lg,full}`
  - transitionDuration / transitionTimingFunction: `--duration-*` / `--easing-*`
- `content` 은 비워둠 (각 앱의 tailwind.config 에서 채움)

### 3. `packages/shared/src/database.ts` 경로 예약

본 단계에서는 파일을 만들지 않는다. **Sub-03 (Supabase 인프라) 에서 `supabase gen types typescript --local > packages/shared/src/database.ts` 로 자동 생성**된다. `packages/core` 의 `supabase/types.ts` 는 해당 경로를 import 하는 형태로 stub 만 둔다.

### 4. 의존성 추가

| 대상 | 추가 | 제거 |
|---|---|---|
| `apps/web/package.json` | `"@todo-list/core": "workspace:*"` | — |
| `apps/mobile/package.json` | `"@todo-list/core": "workspace:*"`, `"nativewind": "^4.0.0"`, `"tailwindcss": "^3.4.0"` | `"react-native-webview"` |
| `packages/core/package.json` | `"@supabase/supabase-js"`, `"@tanstack/react-query"` (peerDependencies) | — |

### 5. 앱별 tailwind config 신설

- `apps/web/tailwind.config.ts` — `packages/config/tailwind.config.js` 를 import 후 `content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}']` 등으로 확장
- `apps/mobile/tailwind.config.js` — 동일 import + `content: ['./src/**/*.{ts,tsx}']` (Nativewind v4 preset)

> 본 단계에서는 config 파일만 둔다. 실제 className 사용·Nativewind babel plugin 등록은 Sub-04 / Sub-05 에서.

## 핵심 구현 로직

### `createClient` 팩토리 시그니처

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

- **storage adapter 는 호출 측이 주입** — web=`window.localStorage`, mobile=`AsyncStorage` wrapper
- `packages/core` 본문에서 `window` / `AsyncStorage` / `react-native` import 금지

### `services/carryOver.ts`, `services/epicProgress.ts`

`supabase.rpc(...)` 의 thin wrapper. 인자/반환 타입은 `Database['public']['Functions'][...]` 사용.

### `hooks/*.ts`

TanStack Query `useQuery` / `useMutation` 의 wrapper. queryKey 컨벤션:

- `['todos', { workspace, date }]`
- `['epics', { workspace }]`
- `['categories', { workspace }]`

### `realtime/subscribeTodos.ts`

```ts
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

## 구현 시 주의사항

1. **플랫폼 독립 TS 만** — `packages/core/src/` 안에서 `window`, `AsyncStorage`, `react-native`, `next/*`, DOM API import 금지. storage adapter / fetch 등 플랫폼 의존은 인자 주입
2. **React 의존은 peerDependencies 로** — web/mobile 각자가 React 19 / RN 의 React 결정. `packages/core/package.json` 의 `dependencies` 에는 React 를 넣지 않음
3. **tailwind config 는 CommonJS** — Tailwind 가 require 로 로드하므로 `module.exports` 사용. `.ts` 로 작성하지 않는다
4. **본 단계는 stub** — services / hooks / realtime 의 실 구현은 Sub-04 작업 범위. 본 Sub-PRD 에서는 컴파일 통과만 보장
5. **`packages/shared/src/database.ts` 는 Sub-03 산출물** — 본 단계에서 직접 생성하지 않음. `packages/core` 의 import 경로만 예약
6. **node 버전 / pnpm 버전** — 루트 `package.json` `engines` 와 동일 사양 사용. 신규 패키지에서 다른 버전 명시 금지

## 작업

- [x] `packages/core/package.json` 작성 (name=`@todo-list/core`, exports, deps, peerDeps)
- [x] `packages/core/tsconfig.json` 작성 (`extends: @todo-list/config/tsconfig.base.json`, strict)
- [x] `packages/core/src/index.ts` 신설 (하위 모듈 re-export)
- [x] `packages/core/src/supabase/createClient.ts` 팩토리 시그니처 + 기본 구현
- [x] `packages/core/src/supabase/types.ts` (`SupabaseClient<Database>` alias)
- [x] `packages/core/src/domain/{todo,epic,category}.ts` 타입 alias stub
- [x] `packages/core/src/services/carryOver.ts` 시그니처 + stub 본문
- [x] `packages/core/src/services/epicProgress.ts` 시그니처 + stub 본문
- [x] `packages/core/src/hooks/{useTodos,useCreateTodo,useUpdateTodo,useDeleteTodo}.ts` 시그니처 + stub 본문
- [x] `packages/core/src/realtime/subscribeTodos.ts` 헬퍼 시그니처 + stub 본문
- [x] `packages/config/tailwind.config.js` 신설 — design-system tokens 매핑 (color/spacing/radius/motion)
- [x] `apps/web/package.json` 에 `@todo-list/core: workspace:*` 추가
- [x] `apps/mobile/package.json` 에 `@todo-list/core: workspace:*`, `nativewind: ^4.0.0`, `tailwindcss: ^3.4.0` 추가
- [x] `apps/mobile/package.json` 에서 `react-native-webview` 제거
- [x] `apps/web/tailwind.config.ts` 신설 (`packages/config/tailwind.config.js` import + content paths)
- [x] `apps/mobile/tailwind.config.js` 신설 (동일 import + content paths)
- [ ] 루트에서 `pnpm install` 실행 → workspace 의존성 해소 — 로컬 node/pnpm 미설치, 사용자 환경에서 실행 필요
- [ ] `pnpm -r build` 통과 확인 — 동일
- [x] grep 으로 `packages/core/src/` 내 `window` / `AsyncStorage` / `react-native` import 0건 확인

## 검증 기준

- [ ] `pnpm -r build` 통과 (`packages/core` 가 빈 export 라도 컴파일 성공) — 로컬 미설치, 사용자 환경에서 실행 필요
- [ ] `pnpm --filter @todo-list/core typecheck` 통과 — 동일
- [x] `apps/mobile/package.json` 에 `react-native-webview` 의존성 없음 (`grep -n "react-native-webview" apps/mobile/package.json` 결과 0건)
- [ ] `packages/config/tailwind.config.js` 가 `apps/web/tailwind.config.ts` 와 `apps/mobile/tailwind.config.js` 양쪽에서 require 가능 (각 config 파일을 node 로 require 시 에러 없음) — 로컬 node 미설치, 정적 검증 (CommonJS 형식 / `module.exports` 존재) 만 수행
- [x] `grep -RIn "from 'react-native'\|from 'next/\|window\.\|AsyncStorage" packages/core/src/` 결과 0건
- [x] `apps/web/package.json` 과 `apps/mobile/package.json` 양쪽에 `@todo-list/core: workspace:*` 존재
- [x] `packages/core/package.json` 의 `peerDependencies` 에 React 명시 (`react`, mobile 측은 `react-native` 도) — `react` 명시 완료, `react-native` 는 후속 RN 도입 시점에 추가 예약

---

*이 문서는 `스택 전환` 프로젝트의 Sub-PRD 입니다. 전체 범위는 `main-prd-stack-pivot.md` 를 참조하세요.*
