# TASK-10-24: ui — `TodoItem.tsx` grid 2-row 마크업 재구조 (격차 #10)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-24
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-07 (TodoItem priority 제거)

## 작업 목표

sub-prd-10 §8.2 / 격차 #10 — `packages/ui/src/TodoItem.tsx` 를 prototype `proto-todo-item` 의 grid 2-row 마크업으로 재구조한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/TodoItem.tsx` | 수정 | grid 2-row 마크업 재구조 |

### 변경 세부

#### 1. 컨테이너 grid 정합

```tsx
<div
  className="grid items-center min-h-12"
  style={{
    gridTemplateColumns: 'auto 1fr auto',
    rowGap: '2px',
    columnGap: 'var(--spacing-3)',
  }}
>
  {/* 체크박스: row 2 col 1 */}
  <div style={{ gridRow: 2, gridColumn: 1 }}>
    <Checkbox ... />
  </div>

  {/* tags: row 1 col 2 — category 배지만 (priority 미노출) */}
  <div style={{ gridRow: 1, gridColumn: 2 }} className="flex gap-1">
    {category && <CategoryBadge category={category} />}
  </div>

  {/* title: row 2 col 2 */}
  <div style={{ gridRow: 2, gridColumn: 2 }}>
    <span>{title}</span>
  </div>

  {/* carry-over +N / chevron: row 2 col 3 */}
  <div style={{ gridRow: 2, gridColumn: 3 }} className="flex items-center gap-2">
    {carryOverCount > 0 && <CarryOverBadge count={carryOverCount} />}
    {chevron}
  </div>
</div>
```

> 클래스 vs inline style 선택은 Tailwind 의 `grid-cols-[auto_1fr_auto]` + 자식 `[grid-row:1]` 등 임의 값 클래스도 가능. 일관성 우선.

#### 2. category prop 동작

- `category` 미주입 시 row 1 비표시 (자동) — EpicAccordion 안 sub 행에서 category 주입하지 않으면 row 1 비표시
- stand-alone TodoItem 호출 측 (TASK-10-10) 은 category 를 주입해 row 1 노출

#### 3. priority 미사용 검증

- 본 task 시점에 priority prop 은 TASK-10-07 에서 이미 제거됨
- tags row 에 priority 배지 코드 0건 — sub-prd-10 §1 정합

### 회귀 영향

- TodoItem 시각이 단일 row → 2-row 로 변경
- EpicAccordionCard 의 sub 렌더 (category prop 미주입 가정) 는 row 1 비표시 → 시각 변화 적음
- stand-alone TodoItem (web MainDailyView / mobile MainDailyViewMobile) 은 category 주입 시 row 1 노출 → 시각 변화 큼

## 검증 과정

- [x] grid 2-row 구조 적용 (체크박스 col 1, tags col 2 row 1, title col 2 row 2, trailing col 3)
- [x] category 미주입 시 row 1 비표시 (조건부 렌더링)
- [x] priority 키워드 0건
- [x] `pnpm --filter @todo-list/ui run typecheck` / `lint` 통과
- [x] 수동: stand-alone TodoItem 의 category 배지가 title 위 (row 1) 노출 시각 확인
- [x] 수동: EpicAccordion 안 sub 행이 title + checkbox 만 표시 시각 확인

## 주의사항

1. **prototype 정합 SoT**: `docs/base/prototype/css/molecules.css` L6-95 정합. grid-template-columns / row-gap / column-gap / min-height / align-items 모두 일치.
2. **사용자 결정 §B 잠정안**: stand-alone 만 grid 2-row + category 노출. EpicAccordion sub 는 title 만 — 본 task 는 컴포넌트 자체를 grid 2-row 로 갱신하되, 호출 측의 category 주입 정책으로 노출 제어.
3. **mobile 동등 컴포넌트**: TASK-10-28 의 mobile visual alignment 에서 RN 변환 처리. 본 task 는 web 한정.
4. **scope = refactor(ui)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §8.2 / 격차 #10 / §사용자 결정 §B
- [`./tasks-10-07-ui-todo-item-remove-priority.md`](./tasks-10-07-ui-todo-item-remove-priority.md)
- [`./tasks-10-28-mobile-visual-alignment.md`](./tasks-10-28-mobile-visual-alignment.md)
- `docs/base/prototype/css/molecules.css` (L6-95)
- `docs/base/prototype/pages/page-prototypes.html` (`proto-todo-item`)
- `packages/ui/src/TodoItem.tsx`
