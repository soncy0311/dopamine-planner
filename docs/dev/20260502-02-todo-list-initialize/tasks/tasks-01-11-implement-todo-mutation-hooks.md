# TASK-01-11: useCreateTodo / useUpdateTodo / useDeleteTodo

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 11
- **상태**: 완료
- **의존성**: 01 (queryKeys), 05 (services/todo)

## 작업 목표

서브 이슈 변경 훅 3종 (`useCreateTodo`, `useUpdateTodo`, `useDeleteTodo`) 본문을 작성한다. `useToggleTodo` 는 별도 task (12) 로 분리.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/hooks/useCreateTodo.ts` | 본문 작성 | `useCreateTodo(client)` |
| `packages/core/src/hooks/useUpdateTodo.ts` | 본문 작성 | `useUpdateTodo(client)` |
| `packages/core/src/hooks/useDeleteTodo.ts` | 본문 작성 | `useDeleteTodo(client)` |

### 구현 세부사항

- 각 훅: `useMutation({ mutationFn: (input) => todoService.<op>(...) })`
- `onSuccess` 에서 `qc.invalidateQueries({ queryKey: ['todos'] })` (전체 todos prefix invalidate — 일자 무관)
- 변경에 epic 영향이 있는 경우 `['epics']` invalidate 도 함께 (예: create/update/delete 모두 epic 진행률 영향). 단 epic 진행률 재계산 RPC 호출은 본 훅에서 직접 호출하지 않음 — Realtime 또는 명시 호출 측이 처리
- 모든 훅의 `mutationFn` 은 `services/todo.ts` 함수만 호출

### 참조 코드

sub-prd-01 §7 TanStack Query 훅.

## 검증 과정

- [x] 3개 파일 모두 export 함수 보유
- [x] 모든 invalidate 가 `queryKeys.todos(...)` 또는 `['todos']` prefix
- [x] `mutationFn` 이 services 함수만 호출
- [x] `pnpm --filter @todo-list/core typecheck` 통과

## 주의사항

1. **queryKeys 헬퍼 통과 의무** — 직접 문자열 리터럴 작성 시 prefix 형태(`['todos']`) 만 허용 (invalidate 광역 prefix 용도).
2. **services 단일 진입점** — 훅 안에서 supabase client 직접 호출 금지.
3. **toggle 은 본 task 범위 밖** — task 12 에서 별도 처리.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §3.3
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §7
