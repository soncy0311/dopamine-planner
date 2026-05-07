# TASK-10-27: ui — `EpicProgressBar.tsx` 토큰 정합 (격차 #13)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-27
- **상태**: 완료 (2026-05-07)
- **의존성**: 없음 (독립)

## 작업 목표

sub-prd-10 §8.5 / 격차 #13 — `packages/ui/src/EpicProgressBar.tsx` 의 시각 토큰을 prototype `proto-epic-progress-segmented` 정합으로 갱신:
1. segment gap `gap-1 (4px)` → `gap-[2px]`
2. segment radius `rounded-sm (4px)` → `rounded-full`
3. segment 색: track `bg-periwinkle-100` 또는 `--color-bg-surface` / filled `bg-purple-500` 유지
4. height `h-2 (8px)` 유지
5. (선택) 명명 검토 — `EpicProgressBar` → `SegmentedProgressBar` rename + variant prop 도입

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/ui/src/EpicProgressBar.tsx` | 수정 | gap / radius / 색 토큰 정합 |
| (선택) `packages/ui/src/index.ts` | 수정 | rename 채택 시 export 명 변경 |

### 변경 세부

#### 1. segment 토큰 갱신

```tsx
// 변경 전
<div className="flex gap-1">
  {segments.map((filled, i) => (
    <div
      key={i}
      className={`flex-1 h-2 rounded-sm ${filled ? 'bg-purple-500' : 'bg-periwinkle-200'}`}
    />
  ))}
</div>

// 변경 후
<div className="flex gap-[2px]">
  {segments.map((filled, i) => (
    <div
      key={i}
      className={`flex-1 h-2 rounded-full ${filled ? 'bg-purple-500' : 'bg-periwinkle-100'}`}
    />
  ))}
</div>
```

#### 2. percent text — 호출자 일관성 우선해 컴포넌트 외부 유지

sub-prd-10 §8.5 잠정 결론 — bar 만 컴포넌트가 책임. percent text 는 호출자가 `flex items-center gap-2` 로 가로 정렬.

#### 3. (선택) rename + variant

```tsx
// 잠정 — sub-prd-10 §8.5 잠정 = rename + variant 도입
type Props = {
  total: number;
  done: number;
  variant?: 'segmented' | 'linear';  // default 'segmented'
};

export function SegmentedProgressBar({ total, done, variant = 'segmented' }: Props) {
  if (variant === 'linear') {
    return (
      <div className="h-2 bg-periwinkle-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 transition-all"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
    );
  }
  // segmented (기본)
  return ( ... );
}
```

> rename 채택 시 호출 측 (`MainDailyView` / `EpicAccordionCard`) 의 import 동반 갱신. 본 task 범위 안에서 처리하거나 별도 task 분리.

### 회귀 영향

- segment 사이 간격 4px → 2px (시각 미세)
- segment 모서리 약간 둥근 → 완전 둥근 (시각 미세)
- track 색 미세 변화 (`periwinkle-200` → `periwinkle-100`)

## 검증 과정

- [x] segment gap 이 `gap-[2px]`
- [x] segment radius 가 `rounded-full`
- [x] track / filled 색 토큰 정합
- [x] height `h-2` 유지
- [x] (rename 채택 시) `SegmentedProgressBar` export + 호출 측 import 갱신
- [x] `pnpm --filter @todo-list/ui run typecheck` / `lint` 통과
- [x] 수동: Epic 카드의 progress bar 시각 검증 (gap / radius / 색)

## 주의사항

1. **rename 검토 — 본 task 범위 결정 필요**: rename 채택 시 호출 측 광범위 영향 → 별도 task 분리 권장. 잠정 = 본 task 안에서 토큰 갱신만 + rename 은 후속 sub.
2. **prototype 정합 SoT**: `docs/base/prototype/css/organisms.css` L368-385. gap / radius / height / 색 1:1 비교.
3. **percent text 위치**: 본 task 는 컴포넌트 외부 유지 (호출자 정렬). 컴포넌트 내장 시 호출자 마이그레이션 비용 — 후속 결정.
4. **scope = refactor(ui)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §8.5 / 격차 #13
- `docs/base/prototype/css/organisms.css` (L368-385)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
- [`../../../base/design-system/components.md`](../../../base/design-system/components.md) §SegmentedProgressBar
- `packages/ui/src/EpicProgressBar.tsx`
