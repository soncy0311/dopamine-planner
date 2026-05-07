# TASK-01-12: useToggleTodo (optimistic + 200ms debounce)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 12
- **상태**: 완료
- **의존성**: 01 (queryKeys), 05 (services/todo), 07 (services/epicProgress)

## 작업 목표

`packages/core/src/hooks/useToggleTodo.ts` 본문을 작성한다. optimistic update + 200ms epic 단위 debounce 후 진행률 재계산을 포함한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/hooks/useToggleTodo.ts` | 본문 작성 | `useToggleTodo(client)` + 내부 `debounceByEpic` 헬퍼 |

### 구현 세부사항

- 시그니처: `useToggleTodo(client: SupabaseClient<Database>)` → `useMutation` 반환
- `mutationFn`: `todoService.toggle(client, input.id, input.nextStatus)` (input: `{ id, epicId, nextStatus }`)
- `onMutate`:
  - `queryKeys.todos` prefix 의 모든 캐시 항목에 대해 snapshot
  - 해당 sub_issue 의 `status` 를 `nextStatus` 로 즉시 갱신 (optimistic)
  - context 로 snapshot 반환
- `onError`:
  - context 의 snapshot 으로 rollback
- `onSuccess`:
  - `debouncedRecalc(input.epicId)` 호출 — 200ms debounce
- `onSettled`:
  - `qc.invalidateQueries({ queryKey: ['todos'] })`
  - `qc.invalidateQueries({ queryKey: ['epics'] })`
- `debounceByEpic(ms, fn)` 헬퍼:
  - epicId 별 별도 timer 보관 (Map<string, Timeout>)
  - 동일 epicId 의 호출은 마지막 호출만 ms 후 실행
  - 서로 다른 epicId 는 독립 타이머
  - 외부 의존성 없이 setTimeout 으로 구현 (sub-prd §기술 스택)

### 참조 코드

sub-prd-01 §핵심 구현 로직 의 `useToggleTodo` 예시 코드.

## 검증 과정

- [x] `useToggleTodo` export
- [x] `debounceByEpic` 내부 헬퍼 (또는 동등 로직) 존재 — epicId 키 기반 Map<string, Timeout>
- [x] `onMutate` 에 snapshot/optimistic 갱신 로직 포함
- [x] `onError` 에 rollback 로직 포함
- [x] `onSuccess` 에서 debounced `recalcEpicProgress` 호출
- [x] `onSettled` 에서 todos / epics invalidate
- [x] `pnpm --filter @todo-list/core typecheck` 통과

## 주의사항

1. **debounce 키는 epicId** — 동일 epic 의 5번 토글이 1번 RPC 호출로 합쳐져야 함. 서로 다른 epic 은 독립 (sub-prd §주의사항 6).
2. **외부 의존성 추가 금지** — lodash.debounce 등 import 금지. setTimeout 으로 자체 구현 (sub-prd §기술 스택).
3. **optimistic snapshot 범위** — `queryKeys.todos` prefix 전체 (날짜 무관 모든 일자별 캐시). 한 sub 가 여러 일자에 노출되는 경우 (이월) 까지 일관 갱신.
4. **react-query peerDependency** — `dependencies` 추가 금지.
5. **단위 테스트 필수** — task 15 에서 동일 epic 5회 토글 → RPC 1회 합쳐짐 검증.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §3.3 / §RPC
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §7, §핵심 구현 로직
