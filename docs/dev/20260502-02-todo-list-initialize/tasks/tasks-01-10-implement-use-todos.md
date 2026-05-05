# TASK-01-10: useTodos 조회 + 자동 이월 effect

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 10
- **상태**: 대기중
- **의존성**: 01 (queryKeys), 05 (services/todo), 06 (services/carryOver)

## 작업 목표

`packages/core/src/hooks/useTodos.ts` 본문을 작성한다. 일자별 sub_issue 조회 + 진입 시 자동 이월 1회 호출 effect 를 포함한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/hooks/useTodos.ts` | 본문 작성 | `useTodos(client, workspace, date)` |

### 구현 세부사항

- 시그니처: `useTodos(client, workspace: string, date: string)` → `{ done: SubIssue[]; todo: SubIssue[]; ...query }` 형태
- `useQuery({ queryKey: queryKeys.todos(workspace, date), queryFn: () => todoService.listByDate(client, workspace, date) })`
- 자동 이월 effect:
  - `useEffect(() => { ... }, [client, workspace, date])`
  - 조건: `date === today (로컬 날짜)` 일 때만 호출
  - `carryOverTodos(client, today)` 호출
  - `moved_count > 0` 인 경우 `qc.invalidateQueries({ queryKey: queryKeys.todos(workspace, today) })`
  - 호출 결과는 사용자 알림 없이 조용히 처리
  - 에러는 console 경고만 (UI 미반영) — 다음 진입 시 재시도

### 참조 코드

- sub-prd-01 §7 TanStack Query 훅
- sub-prd-01 §9 자동 이월 진입 트리거

## 검증 과정

- [ ] `useTodos` export
- [ ] queryKey 가 `queryKeys.todos(workspace, date)` 사용
- [ ] `useEffect` 안에서 `carryOverTodos` 호출
- [ ] 호출 후 invalidate 가 `queryKeys.todos(workspace, today)` 통과
- [ ] 멱등성 보장 (003 마이그레이션 WHERE 절) 가정 — 추가 가드 코드 없음
- [ ] `pnpm --filter @todo-list/core typecheck` 통과

## 주의사항

1. **자동 이월 트리거 위치 단일화** — 본 hook 의 effect 1군데에서만 호출. web/mobile 별도 호출 금지 (sub-prd §주의사항 5).
2. **멱등성 신뢰** — 003 마이그레이션 WHERE 절이 보장. 호출 측 가드 추가 금지.
3. **조용한 이월** — 토스트·로딩 표시 없음. 사용자 알림 0건.
4. **queryKeys 헬퍼 통과 의무**.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §3.3 / §RPC
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §7, §9
