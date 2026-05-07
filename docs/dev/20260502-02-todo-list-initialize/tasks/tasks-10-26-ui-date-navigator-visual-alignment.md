# TASK-10-26: ui — `DateNavigator.tsx` 시각 정합 (격차 #12)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-26
- **상태**: 완료 (2026-05-07)
- **의존성**: 없음 (독립)

## 작업 목표

sub-prd-10 §8.4 / 격차 #12 — `packages/ui/src/DateNavigator.tsx` 를 prototype `proto-date-navigator` 정합으로 갱신:
1. 좌/우 화살표를 `lucide-react` 의 `ChevronLeft` / `ChevronRight` 로 교체
2. week strip day cell: `gap 2px + day-label (top, font-xs) + day-num 32px circle (radius-full)`
3. selected: `bg-purple-500 text-white` + `radius-full` 32px circle
4. today: `border 1.5px purple-500 + text-purple-500 + weight-semibold`
5. 확장 calendar grid: 36px cell + `radius-full`
6. today 판정 로직 추가

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/DateNavigator.tsx` | 수정 | Chevron 아이콘 + week strip 정합 + today/selected 시각 + calendar cell radius-full |

### 변경 세부

#### 1. lucide import 추가

```tsx
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
```

#### 2. 헤더 좌/우 버튼

```tsx
<button onClick={prev} aria-label="이전 주">
  <ChevronLeft size={20} />
</button>
<button onClick={toggleExpand}>
  <span>{title}</span>
  <ChevronDown className={expanded ? 'rotate-180' : ''} />
</button>
<button onClick={next} aria-label="다음 주">
  <ChevronRight size={20} />
</button>
```

#### 3. week strip day cell

```tsx
<div className="flex flex-col items-center gap-[2px]">
  <span className="text-xs font-medium text-text-secondary">{dayLabel}</span>
  <div
    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm
      ${isSelected ? 'bg-purple-500 text-white' : ''}
      ${isToday && !isSelected ? 'border-[1.5px] border-purple-500 text-purple-500 font-semibold' : ''}
    `}
  >
    {dayNum}
  </div>
</div>
```

#### 4. today 판정

```tsx
const todayIso = new Date().toISOString().slice(0, 10);
const isToday = (iso: string) => iso === todayIso;
```

#### 5. 확장 시 calendar grid

```tsx
<div className="grid grid-cols-7 gap-1">
  {monthDays.map((d) => (
    <div
      key={d.iso}
      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm
        ${isSelected(d) ? 'bg-purple-500 text-white' : ''}
        ${isToday(d.iso) && !isSelected(d) ? 'border-[1.5px] border-purple-500 text-purple-500 font-semibold' : ''}
      `}
    >
      {d.num}
    </div>
  ))}
</div>
```

> 36px = `w-9 h-9` (Tailwind 9 = 2.25rem = 36px).

### 회귀 영향

- 좌/우 화살표 시각이 텍스트 → 아이콘
- week strip / calendar 의 cell 이 사각형 → 원형
- today 시각 (ring/border) 신설 — 이전에는 부재

## 검증 과정

- [x] `lucide-react` 의 `ChevronLeft` / `ChevronRight` import + 사용
- [x] week strip day-num 이 32px circle (`w-8 h-8 rounded-full`)
- [x] selected 시각 = filled circle (`bg-purple-500 text-white`)
- [x] today 시각 = `border-[1.5px] border-purple-500 text-purple-500`
- [x] 확장 시 calendar cell 36px (`w-9 h-9 rounded-full`)
- [x] today 판정 로직 (`new Date().toISOString().slice(0,10)` 비교) 존재
- [x] `pnpm --filter @todo-list/ui run typecheck` / `lint` 통과
- [x] 수동: 좌/우 화살표 / week strip / today 시각 / selected 시각 / 확장 calendar 시각 모두 prototype 정합

## 주의사항

1. **prototype 정합 SoT**: `docs/base/prototype/css/molecules.css` L139-310. 각 token 1:1 비교.
2. **today + selected 동시**: today 가 selected 와 겹치면 selected 우선 (filled circle). 위 로직의 `&& !isSelected` 가드 정합.
3. **timezone**: `new Date().toISOString()` 이 UTC 라 KST 기준 today 가 다를 수 있음 — 호출자 timezone (`useDateQuery` 의 today 산출 정합) 와 동등한 ISO 산출 함수 사용 (`packages/core` 의 today helper 가 있다면 import).
4. **mobile 동등 컴포넌트**: TASK-10-28 에서 RN 변환.
5. **scope = refactor(ui)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §8.4 / 격차 #12
- `docs/base/prototype/css/molecules.css` (L139-310)
- `docs/base/prototype/pages/page-prototypes.html` (`proto-date-navigator`)
- `packages/ui/src/DateNavigator.tsx`
