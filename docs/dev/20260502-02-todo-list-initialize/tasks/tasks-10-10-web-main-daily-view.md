# TASK-10-10: web — `MainDailyView.tsx` AddButton SVG 제거 + EpicCard priority 전달 + Sub priority prop 제거

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-10
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-08 (`EpicAccordionCard` priority prop)

## 작업 목표

sub-prd-10 §4.1 — `apps/web/src/components/MainDailyView.tsx` 갱신:
1. AddButton SVG 제거 (격차 #4) — 텍스트 `+ 추가` 단독
2. `EpicAccordionCard` 호출에 `priority={epic.priority}` 전달
3. `subIssues.map` 의 `<TodoItem priority={...} />` prop 제거
4. standalone TodoItem (`standaloneTodo` / `standaloneDone`) 의 priority prop 제거

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/MainDailyView.tsx` | 수정 | AddButton 텍스트 단독 + EpicCard priority wiring + Sub priority 제거 |

### 변경 세부

#### 1. AddButton SVG 제거 (현 L260~274)

```tsx
// 변경 전
<button>
  <svg width="16" height="16" ...>...</svg>
  추가
</button>

// 변경 후 — issue-creation.md §2 정합
<button>+ 추가</button>
```

#### 2. EpicAccordionCard priority 전달

```tsx
{epics.map((epic) => (
  <EpicAccordionCard
    key={epic.id}
    epicId={epic.id}
    title={epic.title}
    priority={epic.priority}   // 추가
    ...
  />
))}
```

#### 3. subIssues.map 의 priority 제거

```tsx
// 변경 전
<TodoItem priority={s.priority} ... />
// 변경 후
<TodoItem ... />
```

#### 4. standalone TodoItem priority 제거

```tsx
// standaloneTodo / standaloneDone 양쪽 모두
<TodoItem priority={item.priority} ... />
// → priority prop 제거
```

### 회귀 영향

- 메인 일자 뷰의 AddButton 렌더 시각 변경 (텍스트 단독)
- Epic 카드 헤더에 priority badge 노출 시작
- Sub 행에 priority 배지 미노출 (sub-prd-10 §B 잠정안 정합)

## 검증 과정

- [x] `MainDailyView.tsx` 안 `<svg>` 사용 중 AddButton 의 SVG 0건
- [x] AddButton 텍스트가 `+ 추가` 단독
- [x] `EpicAccordionCard` 호출에 `priority={epic.priority}` 존재
- [x] `<TodoItem priority` 패턴 0건
- [x] `pnpm --filter @todo-list/web run typecheck` / `lint` 통과
- [x] 수동: 메인 일자 뷰에서 `+ 추가` 버튼 텍스트 단독 / Epic 헤더 priority badge / Sub 행 priority 미노출 확인

## 주의사항

1. **머지 순서**: 10-04 → 10-07 → 10-08 머지 후 본 task. 단독 머지 시 `EpicAccordionCard` 가 priority prop 미정의 → typecheck 실패.
2. **AddButton 시각**: 격차 #4 정합. 추가 SVG / 아이콘 부재. issue-creation.md §2 의 패턴 그대로.
3. **standalone TodoItem 의 grid 마크업**: TASK-10-24 에서 적용. 본 task 는 priority prop 제거에 한정.
4. **scope = refactor(web)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §4.1
- [`./tasks-10-08-ui-epic-accordion-card-priority-badge.md`](./tasks-10-08-ui-epic-accordion-card-priority-badge.md)
- [`./tasks-10-24-ui-todo-item-grid-2row.md`](./tasks-10-24-ui-todo-item-grid-2row.md)
- [`../../../base/design-system/components/issue-creation.md`](../../../base/design-system/components/issue-creation.md) §2
- `apps/web/src/components/MainDailyView.tsx`
