# TASK-10-08: ui — `EpicAccordionCard.tsx` priority prop + 헤더 badge 렌더 + sub priority 제거

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-08
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-04 (Priority 타입), TASK-10-07 (TodoItem priority 제거)

## 작업 목표

sub-prd-10 §3.2 — `packages/ui/src/EpicAccordionCard.tsx` 에 priority prop 추가 + 헤더 영역 badge 렌더 + 내부 `EpicAccordionSubIssue` 타입의 priority 제거 + `subIssues.map` 의 priority prop 제거.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/EpicAccordionCard.tsx` | 수정 | priority prop + 헤더 badge + sub priority 제거 |

### 변경 세부

1. `EpicAccordionCardProps` 에 `priority?: 'high' | 'medium' | 'low'` 추가 (또는 `Priority` import)
2. 헤더 영역에 priority badge 렌더 추가
   - 위치: 카테고리 dot 옆 또는 progress 좌측 (잠정 — 디자인 결정자 합류 후 미세 조정)
   - 토큰: `bg-priority-{p}-bg text-priority-{p}` (TodoItem 에서 옮긴 `priorityBadgeClass` 패턴 재사용)
   - priority 미주입 시 badge 미렌더 (`priority` 가 optional)
3. `EpicAccordionSubIssue` 타입에서 `priority?: TodoItemPriority | null` 제거
4. `subIssues.map((s) => <TodoItem priority={s.priority} ... />)` 호출에서 `priority` prop 제거
5. `TodoItemPriority` import 가 본 파일에서만 쓰이고 있었다면 삭제 (TodoItem 외부 export 제거 정합)

### badge 렌더 예시

```tsx
const PRIORITY_LABEL: Record<Priority, string> = { high: '높음', medium: '보통', low: '낮음' };
const priorityClass = (p: Priority) => `bg-priority-${p}-bg text-priority-${p}`;

{priority && (
  <span className={`inline-flex items-center px-2 h-6 rounded-full text-xs font-medium ${priorityClass(priority)}`}>
    {PRIORITY_LABEL[priority]}
  </span>
)}
```

### 회귀 영향

- 호출 측 (`MainDailyView` / `MainDailyViewMobile`) 에서 `priority={epic.priority}` 추가 — TASK-10-10 / 10-19
- TodoItem priority 제거 → sub 행에서 priority 표시 0 (sub-prd-10 §B 잠정안 정합 — EpicAccordion 안 sub 는 title 만)

## 검증 과정

- [x] `EpicAccordionCardProps` 에 priority prop 존재 (optional)
- [x] 헤더 영역에 priority badge 렌더 블록 존재 (priority 주입 시)
- [x] `EpicAccordionSubIssue` 타입에 priority 필드 0건
- [x] `subIssues.map` 의 `<TodoItem>` 호출에 priority prop 0건
- [x] `pnpm --filter @todo-list/ui run typecheck` / `lint` 통과
- [x] 수동: storybook 또는 호출 측 wiring 후 헤더 badge 렌더 시각 확인

## 주의사항

1. **머지 순서**: 10-04 → 10-07 → 10-08. 본 task 단독 머지 시 priority prop 받아도 호출 측 미주입 → badge 미표시 (회귀 0).
2. **badge 위치 / 색 잠정**: sub-prd-10 §주의사항 5 — 디자인 결정자 합류 후 미세 조정. components.md §EpicCard 갱신은 후속 sub.
3. **명명 rename 별개 task**: `EpicAccordionCard` → `IssueCardAccordion` rename 은 TASK-10-23 에서 별도 처리 (사용자 결정 §A).
4. **scope = feat(ui)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §3.2
- [`./tasks-10-04-core-domain-priority-relocate.md`](./tasks-10-04-core-domain-priority-relocate.md)
- [`./tasks-10-07-ui-todo-item-remove-priority.md`](./tasks-10-07-ui-todo-item-remove-priority.md)
- [`../../../base/design-system/components.md`](../../../base/design-system/components.md) §EpicCard
- [`../../../base/design-system/components/issue-creation.md`](../../../base/design-system/components/issue-creation.md) §1
- `packages/ui/src/EpicAccordionCard.tsx`
