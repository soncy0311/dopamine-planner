# TASK-01-14: packages/core 의 index.ts re-export 갱신

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 14
- **상태**: 완료
- **의존성**: 01 ~ 13 (모든 신규/구현 모듈)

## 작업 목표

`packages/core/src/index.ts` 에 본 sub-prd 에서 신설/실 구현된 모듈을 외부(web/mobile)에서 import 할 수 있도록 re-export 한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/index.ts` | export 추가 | queryKeys, domain, services, hooks, realtime |

### 구현 세부사항

re-export 대상:

- `queryKeys` + `invalidateByTable` (from `./queryKeys`)
- `mapCategoryRow` / `mapEpicRow` / `mapSubIssueRow` / `mapTodoDailyView` (from `./domain/*`)
- services 모듈:
  - `categoryService` namespace 또는 개별 함수 (`./services/category`)
  - `epicService` (`./services/epic`)
  - `todoService` (`./services/todo`)
  - `carryOverTodos` (`./services/carryOver`)
  - `recalcEpicProgress` (`./services/epicProgress`)
- hooks:
  - `useCategories`, `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`
  - `useEpics`, `useCreateEpic`, `useUpdateEpic`, `useDeleteEpic`
  - `useTodos`, `useCreateTodo`, `useUpdateTodo`, `useDeleteTodo`, `useToggleTodo`
- realtime:
  - `subscribeTodos` (from `./realtime/subscribeTodos`)
- 도메인 타입 (API_CONTRACT §7) 도 함께 re-export — `Category`, `Epic`, `SubIssue` 등

### 참조 코드

sub-prd-01 §작업 16번.

## 검증 과정

- [x] `packages/core/src/index.ts` 가 위 모든 식별자를 export
- [x] `pnpm --filter @todo-list/core build` 통과
- [x] `pnpm --filter @todo-list/core typecheck` 통과
- [x] 외부 (web/mobile) 에서 `import { useTodos, subscribeTodos, queryKeys } from '@todo-list/core'` 가 typecheck 통과 (build 통과로 표면 검증)

## 주의사항

1. **단일 진입점** — web/mobile 은 `@todo-list/core` 만 import. 하위 경로(`@todo-list/core/src/...`) 직접 import 금지.
2. **타입과 런타임 함수 모두 export** — `export type { ... }` 와 `export { ... }` 둘 다 필요.
3. **Tree-shaking 보존** — 가능한 named export 유지. 거대한 default export 객체 금지.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §작업 16
