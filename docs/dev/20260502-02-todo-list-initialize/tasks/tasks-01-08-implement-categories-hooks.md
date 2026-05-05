# TASK-01-08: useCategories + Create/Update/Delete 훅

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 08
- **상태**: 완료
- **의존성**: 01 (queryKeys), 03 (services/category)

## 작업 목표

카테고리 도메인의 4종 TanStack Query 훅 (`useCategories`, `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`) 본문을 작성한다. 동일 패턴 반복이라 단일 task 로 묶는다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/hooks/useCategories.ts` | 본문 작성 | `useCategories(workspace)` |
| `packages/core/src/hooks/useCreateCategory.ts` | 본문 작성 | `useCreateCategory(client)` |
| `packages/core/src/hooks/useUpdateCategory.ts` | 본문 작성 | `useUpdateCategory(client)` |
| `packages/core/src/hooks/useDeleteCategory.ts` | 본문 작성 | `useDeleteCategory(client)` |

### 구현 세부사항

- `useCategories(workspace)`:
  - `useQuery({ queryKey: queryKeys.categories(workspace), queryFn: () => categoryService.listByWorkspace(client, workspace) })`
- `useCreateCategory / useUpdateCategory / useDeleteCategory`:
  - `useMutation({ mutationFn: (input) => categoryService.<op>(...) })`
  - `onSuccess` 에서 `qc.invalidateQueries({ queryKey: queryKeys.categories(workspace) })`
  - 워크스페이스 인자는 hook 호출 시 결정 — `useCreateCategory(client)` 호출자가 mutate input 으로 workspace 전달
- 모든 훅의 `mutationFn` 은 `services/category.ts` 함수만 호출 (직접 supabase 호출 금지)
- queryKeys 헬퍼 통과 의무

### 참조 코드

sub-prd-01 §7 TanStack Query 훅.

## 검증 과정

- [x] 4개 파일 모두 export 함수 보유
- [x] 모든 invalidate 가 `queryKeys.categories(...)` 통과
- [x] `mutationFn` 이 services 함수만 호출 (직접 supabase API 호출 코드 미포함)
- [ ] `pnpm --filter @todo-list/core typecheck` 통과 (task 11 에서 일괄)

## 주의사항

1. **queryKeys 헬퍼 통과 의무** — 문자열 리터럴 직접 작성 금지 (sub-prd §주의사항 3).
2. **react-query peerDependency** — `dependencies` 추가 금지 (sub-prd §주의사항 7).
3. **services 단일 진입점** — 훅 안에서 supabase client 직접 호출 금지. 모든 호출은 `services/category.ts` 경유.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §3.1
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §7
