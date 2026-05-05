# TASK-01-09: useEpics + Create/Update/Delete 훅

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 09
- **상태**: 완료
- **의존성**: 01 (queryKeys), 04 (services/epic)

## 작업 목표

에픽 도메인의 4종 TanStack Query 훅 (`useEpics`, `useCreateEpic`, `useUpdateEpic`, `useDeleteEpic`) 본문을 작성한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/hooks/useEpics.ts` | 본문 작성 | `useEpics(workspaceOrCategoryId)` |
| `packages/core/src/hooks/useCreateEpic.ts` | 본문 작성 | `useCreateEpic(client)` |
| `packages/core/src/hooks/useUpdateEpic.ts` | 본문 작성 | `useUpdateEpic(client)` |
| `packages/core/src/hooks/useDeleteEpic.ts` | 본문 작성 | `useDeleteEpic(client)` |

### 구현 세부사항

- `useEpics(input)` — 입력 형태 분기:
  - `{ workspace }` → `queryKeys.epics(workspace)` + `epicService.listByWorkspace(client, workspace)`
  - `{ categoryId }` → `queryKeys.epicsByCategory(categoryId)` + `epicService.listByCategory(client, categoryId)`
- 변경 훅 3종 — `useMutation({ mutationFn: (input) => epicService.<op>(...) })`
- `onSuccess` 에서 `qc.invalidateQueries({ queryKey: ['epics'] })` (또는 `queryKeys.epics(ws)` prefix invalidate)
- 모든 훅의 `mutationFn` 은 `services/epic.ts` 함수만 호출

### 참조 코드

sub-prd-01 §7 TanStack Query 훅.

## 검증 과정

- [x] 4개 파일 모두 export 함수 보유
- [x] `useEpics` 가 workspace / categoryId 입력 분기 처리
- [x] 모든 invalidate 가 queryKeys 헬퍼 (`queryKeys.epics(...)` 또는 `queryKeys.epicsByCategory(...)`) 통과 또는 `['epics']` prefix 사용
- [x] `mutationFn` 이 services 함수만 호출
- [ ] `pnpm --filter @todo-list/core typecheck` 통과 (task 11 에서 일괄)

## 주의사항

1. **queryKeys 헬퍼 통과 의무** — 문자열 리터럴 직접 작성 금지.
2. **react-query peerDependency** — `dependencies` 추가 금지.
3. **services 단일 진입점** — 훅 안에서 supabase client 직접 호출 금지.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §3.2
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §7
