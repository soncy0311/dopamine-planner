# TASK-10-28: mobile — RN 컴포넌트 prototype 시각 정합 (격차 #9~#13 동등)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-28
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-23 (rename), TASK-10-24 (web TodoItem grid), TASK-10-26 (web DateNavigator), TASK-10-27 (web SegmentedProgressBar)

## 작업 목표

sub-prd-10 §사용자 결정 §E — mobile RN 동등 컴포넌트들을 prototype 시각 정합으로 갱신. 마크업 구조는 RN 적합 형태로 변환.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/components/TodoItem.tsx` | 수정 | grid 2-row 마크업의 RN 변환 (`flex-col` 로 tags row + title row) |
| `apps/mobile/src/components/IssueCardAccordion.tsx` (또는 EpicAccordionCard — TASK-10-23 rename 결과 정합) | 수정 | priority badge 시각 토큰 정합 (Nativewind) |
| `apps/mobile/src/components/CategoryFilterChips.tsx` 또는 동등 | 수정 / 신설 | border + bg-elevated + active 토큰 정합 (web TASK-10-25 동등) |
| `apps/mobile/src/components/DateNavigator.tsx` 또는 동등 (web `packages/ui/DateNavigator` 의 RN 동등) | 수정 / 신설 | Chevron 아이콘 + week strip day-num circle + today 시각 + calendar cell radius-full |

### 변경 세부

#### 1. TodoItem grid 2-row RN 변환

RN 은 CSS grid 미지원 — `flex-col` + 자식 row 로 변환.

```tsx
<View className="flex-row items-center min-h-12">
  {/* checkbox */}
  <Pressable onPress={onToggle}>...</Pressable>

  <View className="flex-1 ml-3">
    {/* row 1: tags (category 만) */}
    {category && (
      <View className="flex-row gap-1 mb-[2px]">
        <CategoryBadge category={category} />
      </View>
    )}
    {/* row 2: title */}
    <Text>{title}</Text>
  </View>

  {/* trailing */}
  <View className="flex-row items-center gap-2">
    {carryOverCount > 0 && <CarryOverBadge count={carryOverCount} />}
  </View>
</View>
```

#### 2. EpicAccordionCard / IssueCardAccordion priority badge 토큰

```tsx
<View className={`px-2 h-6 rounded-full bg-priority-${priority}-bg items-center justify-center`}>
  <Text className={`text-xs font-medium text-priority-${priority}`}>
    {PRIORITY_LABEL[priority]}
  </Text>
</View>
```

> Nativewind 토큰이 정상 작동하는지 검증. 미작동 시 hex 매핑 폴백.

#### 3. CategoryFilterChips RN 동등

존재 여부 검증 후 — 부재라면 신설 / 존재 시 토큰 정합:

```tsx
<Pressable
  onPress={onSelect}
  className={`border h-8 px-3 rounded-full ${
    isActive
      ? 'border-purple-100 bg-purple-100'
      : 'border-periwinkle-200 bg-white'
  }`}
>
  <Text className={isActive ? 'text-purple-700' : 'text-periwinkle-500'}>
    {label}
  </Text>
</Pressable>
```

#### 4. DateNavigator RN 동등

존재 여부 검증 후 — 부재라면 신설 / 존재 시 시각 정합. `lucide-react-native` 의 `ChevronLeft` / `ChevronRight` / `ChevronDown` 사용:

```tsx
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react-native';

// week strip day cell
<Pressable className="flex-col items-center" onPress={onSelectDate}>
  <Text className="text-xs font-medium text-text-secondary">{dayLabel}</Text>
  <View
    className={`w-8 h-8 rounded-full items-center justify-center mt-[2px]
      ${isSelected ? 'bg-purple-500' : ''}
      ${isToday && !isSelected ? 'border-[1.5px] border-purple-500' : ''}
    `}
  >
    <Text className={
      isSelected ? 'text-white text-sm'
      : isToday ? 'text-purple-500 text-sm font-semibold'
      : 'text-text-primary text-sm'
    }>{dayNum}</Text>
  </View>
</Pressable>
```

### 회귀 영향

- mobile 메인 일자 뷰 / DateNavigator / FilterChips 시각 변경 (web 과 동등)
- RN 시뮬레이터 시각 검증 필수

## 검증 과정

- [x] mobile TodoItem 가 tags row 1 (category) + title row 2 구조
- [x] mobile EpicAccordionCard / IssueCardAccordion 헤더 priority badge 토큰 정합
- [x] mobile CategoryFilterChips 의 비활성 / 활성 토큰 정합
- [x] mobile DateNavigator 의 chevron 아이콘 + day-num circle + today/selected 시각 정합
- [x] `pnpm --filter @todo-list/mobile run typecheck` 통과
- [x] 수동 (시뮬레이터): web 과 동등 시각 — 측면 비교 통과

## 주의사항

1. **CSS grid 부재**: RN 은 grid 미지원 — `flex-col` / `flex-row` + 자식 row 구조로 변환. 시각 결과는 동등.
2. **Nativewind priority/color 토큰 작동 여부**: 우선 Nativewind 클래스로 시도, 미작동 시 hex 매핑 폴백 + 후속 SoT 갱신 (sub-prd-10 §주의사항 6).
3. **lucide-react-native 의존성**: mobile 패키지의 dependencies 에 `lucide-react-native` 부재 시 추가. dev branch 의 `apps/mobile/package.json` 검증.
4. **DateNavigator / FilterChips RN 동등 부재 가능성**: sub-prd-10 §미해결 9 — 부재 시 신설 vs 후속 sub 결정. 본 task 잠정 = 본 sub 에서 신설.
5. **scope = refactor(mobile)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §8.2~§8.5 / §사용자 결정 §E / §주의사항 6 / §미해결 9
- [`./tasks-10-23-rename-epic-accordion-card-to-issue-card-accordion.md`](./tasks-10-23-rename-epic-accordion-card-to-issue-card-accordion.md)
- [`./tasks-10-24-ui-todo-item-grid-2row.md`](./tasks-10-24-ui-todo-item-grid-2row.md)
- [`./tasks-10-25-web-category-filter-chips-tokens.md`](./tasks-10-25-web-category-filter-chips-tokens.md)
- [`./tasks-10-26-ui-date-navigator-visual-alignment.md`](./tasks-10-26-ui-date-navigator-visual-alignment.md)
- [`./tasks-10-27-ui-segmented-progress-bar-tokens.md`](./tasks-10-27-ui-segmented-progress-bar-tokens.md)
- `apps/mobile/src/components/{TodoItem,EpicAccordionCard}.tsx`
