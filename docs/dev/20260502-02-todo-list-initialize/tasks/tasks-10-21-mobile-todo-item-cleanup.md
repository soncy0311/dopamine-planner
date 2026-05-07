# TASK-10-21: mobile — `components/TodoItem.tsx` priority badge / prop 잔존 정리

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-21
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-04 (domain 타입)

## 작업 목표

sub-prd-10 §5.6 — `apps/mobile/src/components/TodoItem.tsx` 의 priority badge / prop / 라벨 / 클래스가 잔존 시 제거. (web 의 `packages/ui/TodoItem` 변경과 정합)

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/components/TodoItem.tsx` | 수정 | priority 관련 코드 모두 제거 (잔존 시) |

### 변경 절차

1. `grep -n "priority" apps/mobile/src/components/TodoItem.tsx` 로 잔존 확인
2. 발견 시:
   - `priority?: ...` prop 제거
   - `PRIORITY_LABEL` / `priorityBadgeClass` 등 매핑 제거
   - JSX 내 priority badge 렌더 블록 제거
   - props 디스트럭처링에서 `priority` 제거
3. 부재 시 본 task 는 검증만 (diff 0)

### 회귀 영향

- mobile Sub 행에 priority 미노출 (sub-prd-10 §B 정합)
- `MainDailyViewMobile` (TASK-10-19) 의 호출 측 priority prop 제거와 양방향 정합

## 검증 과정

- [x] `apps/mobile/src/components/TodoItem.tsx` 안 priority 키워드 0건
- [x] `pnpm --filter @todo-list/mobile run typecheck` 통과
- [x] 수동: 시뮬레이터에서 Sub 행이 priority 미노출 확인

## 주의사항

1. **packages/ui/TodoItem 과 분리**: web 은 `packages/ui` 의 TodoItem 사용, mobile 은 자체 RN TodoItem 사용 (같은 이름 다른 파일). 본 task 는 mobile 한정.
2. **diff 0 가능성**: 이미 정리되어 있다면 본 task 는 검증만.
3. **격차 #10 마크업 재구조**: TASK-10-28 의 mobile visual alignment 에서 grid 마크업 RN 변환. 본 task 는 priority 제거에 한정.
4. **scope = refactor(mobile)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §5.6
- [`./tasks-10-07-ui-todo-item-remove-priority.md`](./tasks-10-07-ui-todo-item-remove-priority.md) (web 동등)
- [`./tasks-10-28-mobile-visual-alignment.md`](./tasks-10-28-mobile-visual-alignment.md)
- `apps/mobile/src/components/TodoItem.tsx`
