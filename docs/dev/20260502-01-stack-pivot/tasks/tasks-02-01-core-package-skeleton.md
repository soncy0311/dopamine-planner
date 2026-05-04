# Task 02-01: packages/core 패키지 골격

## 작업 정보

- **Sub-PRD**: `sub-prd-02-feat-core-package.md`
- **의존성**: 없음 (기반)
- **대상 파일**:
  - `packages/core/package.json`
  - `packages/core/tsconfig.json`
  - `packages/core/src/index.ts`
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-02-feat-core-package.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `packages/core/package.json` 작성 (name=`@todo-list/core`, exports, deps, peerDeps)
- [x] `packages/core/tsconfig.json` 작성 (`extends: @todo-list/config/tsconfig.base.json`, strict)
- [x] `packages/core/src/index.ts` 신설 (하위 모듈 re-export)

## 구현 세부사항

### 1. `packages/core/package.json`

- `name: "@todo-list/core"`, `version: "0.0.0"`, `private: true`
- `main` / `types` / `exports` 필드로 ESM 진입점 노출 (`./src/index.ts` 또는 빌드 산출물)
- `dependencies`: 비워둠 (실 구현은 Sub-04)
- `peerDependencies`:
  - `react` (web/mobile 각자 결정)
  - `@supabase/supabase-js`
  - `@tanstack/react-query`
  - 후속 RN 도입 시 `react-native` 추가 예약
- `scripts`: `typecheck`, `build` (tsc) 정도만 stub
- `engines` 는 루트 `package.json` 와 동일 사양 — 신규 명시 금지

### 2. `packages/core/tsconfig.json`

- `extends: "@todo-list/config/tsconfig.base.json"`
- strict 옵션 활성 (base 에서 상속)
- `compilerOptions.outDir`, `rootDir` 만 명시
- `include: ["src/**/*"]`

### 3. `packages/core/src/index.ts`

- 빈 파일 또는 하위 모듈 re-export 만:
  ```ts
  export * from './supabase/createClient';
  export * from './supabase/types';
  export * from './domain/todo';
  export * from './domain/epic';
  export * from './domain/category';
  export * from './services/carryOver';
  export * from './services/epicProgress';
  export * from './hooks/useTodos';
  export * from './hooks/useCreateTodo';
  export * from './hooks/useUpdateTodo';
  export * from './hooks/useDeleteTodo';
  export * from './realtime/subscribeTodos';
  ```
- 단, 본 task 시점에는 하위 모듈이 아직 없으므로 빈 export 로 두고 02-02/03 에서 점진 추가해도 무방

## 주의사항

1. **React 의존은 peerDependencies 로** — `dependencies` 에 React/RN 넣지 않는다 (Sub-PRD §주의사항 2)
2. **node/pnpm 버전 신규 명시 금지** — 루트 `engines` 와 동일 (Sub-PRD §주의사항 6)
3. **stub 단계** — 실제 함수 본문은 Sub-04. 본 task 는 패키지 골격만
4. **tsconfig 는 base 상속** — `@todo-list/config/tsconfig.base.json` 경로가 존재해야 함. 미존재 시 즉시 보고

## 검증 체크리스트

- [ ] `pnpm --filter @todo-list/core typecheck` 통과 — 로컬에 node/pnpm 미설치, 02-06 에서 사용자 환경에서 검증 필요
- [x] `packages/core/package.json` 에 `exports` / `peerDependencies` 필드 존재
- [x] `packages/core/package.json` `dependencies` 에 `react` / `react-native` / `next` 0건 (`grep -n` 확인)
- [x] `packages/core/tsconfig.json` 의 `extends` 가 `@todo-list/config/tsconfig.base.json`
- [x] `packages/core/src/index.ts` 존재 (빈 파일 또는 re-export)
