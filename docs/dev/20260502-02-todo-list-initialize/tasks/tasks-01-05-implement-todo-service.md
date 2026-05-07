# TASK-01-05: services/todo.ts CRUD + toggle + listByDate

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 05
- **상태**: 완료
- **의존성**: 02 (도메인 매퍼)

## 작업 목표

`packages/core/src/services/todo.ts` 의 stub 을 실 구현으로 교체. 일자별 조회(JOIN nested select), CRUD, 토글을 작성한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/services/todo.ts` | 본문 작성 | `listByDate`, `create`, `update`, `remove`, `toggle` |

### 구현 세부사항

- `listByDate(client, workspace, date)` — API_CONTRACT §3.3 의 nested select.
  - `from('sub_issue').select('*, epic_issue!inner(*, category!inner(*))').eq('epic_issue.category.workspace', ws).eq('target_date', date)` 형태
  - 결과를 `mapTodoDailyView(rows, date)` 통과
- `create(client, payload)` — `insert(payload).select().single()` → `mapSubIssueRow`.
- `update(client, id, patch)` — update by id, select.single 후 매퍼 통과.
- `remove(client, id)` — delete by id. void 반환.
- `toggle(client, id, nextStatus)` — `status` + `completed_date` 동시 업데이트.
  - `nextStatus === 'done'` → `completed_date = today` (호출 시점의 날짜)
  - `nextStatus === 'todo'` → `completed_date = null`
  - update 후 select.single → 매퍼 통과

### 참조 코드

sub-prd-01 §5 Sub 서비스, API_CONTRACT §3.3.

## 검증 과정

- [x] 5개 함수 모두 export
- [x] `listByDate` 가 epic + category JOIN 으로 워크스페이스 필터
- [x] `toggle` 이 status + completed_date 를 동시 업데이트
- [ ] `pnpm --filter @todo-list/core typecheck` 통과 (task 11 에서 일괄)
- [x] `grep -RIn "\.eq('user_id'" packages/core/src/services/todo.ts` 결과 0건

## 주의사항

1. **RLS 이중 필터 금지** — `.eq('user_id', auth.uid())` 추가 작성 금지.
2. **toggle 의 completed_date 정합** — done 진입 시 채우고, todo 복귀 시 null. DB 의 완료일 기록과 일치.
3. **매퍼 통과 의무** — 일자별 조회는 `mapTodoDailyView`, 단일 row 는 `mapSubIssueRow` 통과.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §3.3
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §5
