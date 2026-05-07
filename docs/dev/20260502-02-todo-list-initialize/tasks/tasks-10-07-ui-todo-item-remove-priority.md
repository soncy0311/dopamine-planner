# TASK-10-07: ui — `TodoItem.tsx` priority prop / 배지 / 라벨 / 클래스 모두 제거

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-07
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-04 (domain 타입 갱신)

## 작업 목표

sub-prd-10 §3.1 — `packages/ui/src/TodoItem.tsx` 에서 priority 관련 prop / 라벨 / 클래스 / 배지 렌더 블록을 모두 제거한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/TodoItem.tsx` | 수정 | priority prop / `PRIORITY_LABEL` / `priorityBadgeClass` / 배지 렌더 (현 L112~119) 모두 제거 |

### 변경 세부

1. `TodoItemPriority` 타입 정의 제거 (만약 외부에서 import 시 동반 정리)
2. `priority?: TodoItemPriority | null` prop 제거
3. `PRIORITY_LABEL` 상수 객체 제거
4. `priorityBadgeClass` 함수 / 매핑 제거
5. JSX 안 priority 배지 블록 (현 라인 112~119) 삭제
6. props 디스트럭처링에서 `priority` 제거

### 회귀 영향

- `EpicAccordionCard` 의 `subIssues.map` 의 `<TodoItem priority={...} />` 호출 → TASK-10-08 에서 prop 제거 동반
- `apps/web/src/components/MainDailyView.tsx` 의 standalone TodoItem 호출 → TASK-10-10 에서 prop 제거
- `apps/mobile/src/components/MainDailyViewMobile.tsx` 동일 → TASK-10-19
- `apps/mobile/src/components/TodoItem.tsx` 잔존 priority → TASK-10-21

### 의존성 검증

```bash
grep -rn "TodoItemPriority" packages/ apps/
# 본 task 후 0건이어야 함 (또는 호출 측 task 들이 동반 정리 후 0건)
```

## 검증 과정

- [x] `TodoItem.tsx` 안 priority / Priority 키워드 0건
- [x] `TodoItemPriority` 타입 정의 / export 0건
- [x] `pnpm --filter @todo-list/ui run typecheck` 통과 (호출 측 task 미머지 시 web/mobile 만 깨짐)
- [x] `pnpm --filter @todo-list/ui run test` — 기존 TodoItem 테스트 통과 (priority 검증 케이스 있으면 동반 삭제)

## 주의사항

1. **함께 머지**: 호출 측 (10-08 / 10-10 / 10-19 / 10-21) 과 같은 PR 또는 연속 PR 로 머지. 단독 머지 시 web/mobile build 깨짐.
2. **격차 #10 마크업 재구조는 별도 task**: 본 task 는 priority 제거에 한정. grid 2-row 마크업 재구조는 TASK-10-24 에서 처리.
3. **`category` prop 유지**: TodoItem 의 category prop 은 유지 (TASK-10-24 의 grid row 1 에 사용).
4. **scope = refactor(ui)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §3.1
- [`./tasks-10-04-core-domain-priority-relocate.md`](./tasks-10-04-core-domain-priority-relocate.md)
- [`./tasks-10-08-ui-epic-accordion-card-priority-badge.md`](./tasks-10-08-ui-epic-accordion-card-priority-badge.md)
- [`./tasks-10-24-ui-todo-item-grid-2row.md`](./tasks-10-24-ui-todo-item-grid-2row.md)
- `packages/ui/src/TodoItem.tsx`
