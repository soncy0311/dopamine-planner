# TASK-01-04: services/epic.ts CRUD + listByWorkspace

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 04
- **상태**: 완료
- **의존성**: 02 (도메인 매퍼). `recalcProgress` 는 task 07 (`services/epicProgress.ts`) 에 위임 — 본 task 에서는 위임 호출 코드만 작성.

## 작업 목표

`packages/core/src/services/epic.ts` 의 stub 을 실 구현으로 교체. 카테고리/워크스페이스별 조회 + CRUD 4종 + 진행률 재계산 위임을 작성한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/services/epic.ts` | 본문 작성 | `listByCategory`, `listByWorkspace`, `create`, `update`, `remove`, `recalcProgress` |

### 구현 세부사항

- `listByCategory(client, categoryId)` — `from('epic_issue').select('*').eq('category_id', id)` → `mapEpicRow[]`.
- `listByWorkspace(client, workspace)` — JOIN 으로 category 워크스페이스 필터. `select('*, category!inner(workspace)').eq('category.workspace', ws)`. 매퍼 통과.
- `create(client, payload)` / `update(client, id, patch)` / `remove(client, id)` — Category 와 동일 패턴 (insert→select.single, update→select.single, delete).
- `recalcProgress(client, epicId)` — task 07 의 `recalcEpicProgress` 를 import 하여 위임 호출.

### 참조 코드

sub-prd-01 §4 Epic 서비스.

## 검증 과정

- [x] 6개 함수 모두 export
- [x] `listByWorkspace` 가 category JOIN 으로 워크스페이스 필터링
- [x] `recalcProgress` 가 `services/epicProgress.ts` 에 위임 (직접 RPC 호출 코드 미포함)
- [ ] `pnpm --filter @todo-list/core typecheck` 통과 (task 11 에서 일괄)
- [x] `grep -RIn "\.eq('user_id'" packages/core/src/services/epic.ts` 결과 0건

## 주의사항

1. **RLS 이중 필터 금지** — `.eq('user_id', auth.uid())` 추가 작성 금지.
2. **task 07 와의 의존** — `recalcProgress` 는 thin pass-through. 본 task 작성 시 task 07 import 가 typecheck 통과해야 하므로 task 07 stub 이 먼저 존재해야 함.
3. **매퍼 통과 의무** — `mapEpicRow` 호출 후 반환.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §3.2
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §4
