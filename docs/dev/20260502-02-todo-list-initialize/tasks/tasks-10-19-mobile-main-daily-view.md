# TASK-10-19: mobile — `MainDailyViewMobile.tsx` EpicCard priority 전달 + Sub TodoItem priority prop 제거

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-19
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-08 (`packages/ui` EpicAccordionCard priority prop), TASK-10-20 (mobile EpicAccordionCard priority prop)

## 작업 목표

sub-prd-10 §5.4 — `apps/mobile/src/components/MainDailyViewMobile.tsx` 의:
1. `EpicAccordionCard` 호출에 `priority={epic.priority}` 전달
2. Sub 행 `<TodoItem priority={...} />` prop 제거

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 수정 | EpicCard priority 전달 + Sub priority prop 제거 |

### 변경 세부

```tsx
// 변경 전
<EpicAccordionCard
  epicId={epic.id}
  title={epic.title}
  // priority 미전달
  ...
/>

// 변경 후
<EpicAccordionCard
  epicId={epic.id}
  title={epic.title}
  priority={epic.priority}   // 추가
  ...
/>
```

```tsx
// Sub 행 (subIssues.map 또는 standalone TodoItem)
// 변경 전
<TodoItem priority={s.priority} ... />

// 변경 후
<TodoItem ... />
```

### 회귀 영향

- mobile 메인 일자 뷰의 Epic 헤더에 priority badge 노출
- Sub 행 priority 미노출 (sub-prd-10 §B 정합)

## 검증 과정

- [x] `MainDailyViewMobile.tsx` 의 `EpicAccordionCard` 호출에 `priority={epic.priority}` 존재
- [x] `<TodoItem priority` 패턴 0건
- [x] `pnpm --filter @todo-list/mobile run typecheck` 통과
- [x] 수동: 시뮬레이터에서 메인 뷰 진입 → Epic 헤더 priority badge / Sub 행 priority 미노출 확인

## 주의사항

1. **머지 순서**: 10-08 / 10-20 (EpicAccordionCard 들이 priority prop 받게 변경) 머지 후 본 task. 단독 머지 시 priority prop 미정의 → typecheck 실패.
2. **standalone TodoItem 처리**: 현재 mobile 에 stand-alone TodoItem 호출이 있다면 priority prop 동반 제거.
3. **scope = refactor(mobile)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §5.4
- [`./tasks-10-08-ui-epic-accordion-card-priority-badge.md`](./tasks-10-08-ui-epic-accordion-card-priority-badge.md)
- [`./tasks-10-20-mobile-epic-accordion-card.md`](./tasks-10-20-mobile-epic-accordion-card.md)
- `apps/mobile/src/components/MainDailyViewMobile.tsx`
