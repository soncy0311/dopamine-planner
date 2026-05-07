# TASK-10-20: mobile — `components/EpicAccordionCard.tsx` priority prop + 헤더 badge

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-20
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-04 (Priority 타입)

## 작업 목표

sub-prd-10 §5.5 — `apps/mobile/src/components/EpicAccordionCard.tsx` 가 `priority?: 'high'|'medium'|'low'` prop 을 받아 헤더에 badge 렌더 (RN Nativewind 토큰 매핑).

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/components/EpicAccordionCard.tsx` | 수정 | priority prop 추가 + 헤더 RN badge 렌더 |

### 변경 세부

```tsx
import type { Priority } from '@todo-list/core';

type Props = {
  epicId: string;
  title: string;
  priority?: Priority;     // 추가
  ...
};

const PRIORITY_LABEL: Record<Priority, string> = { high: '높음', medium: '보통', low: '낮음' };

export function EpicAccordionCard({ priority, ... }: Props) {
  return (
    <View>
      <View className="flex-row items-center gap-2">
        ...카테고리 dot...
        {priority && (
          <View className={`px-2 h-6 rounded-full items-center justify-center bg-priority-${priority}-bg`}>
            <Text className={`text-xs font-medium text-priority-${priority}`}>
              {PRIORITY_LABEL[priority]}
            </Text>
          </View>
        )}
        <Text>{title}</Text>
      </View>
      ...
    </View>
  );
}
```

### 회귀 영향

- mobile EpicAccordionCard 헤더에 priority badge 시각 노출
- 호출 측 (TASK-10-19) 가 priority 주입 시 자동 렌더

## 검증 과정

- [x] Props 에 `priority?: Priority` 존재
- [x] 헤더에 priority badge 마크업 (RN View + Text) 렌더 블록
- [x] `pnpm --filter @todo-list/mobile run typecheck` 통과
- [x] 수동: 시뮬레이터에서 priority 별 badge 색 시각 확인

## 주의사항

1. **Nativewind priority 토큰 검증**: `bg-priority-{p}-bg` / `text-priority-{p}` 가 mobile 에서 정상 작동하는지 확인 (sub-prd-10 §주의사항 6). 미작동 시 hex 매핑 폴백.
2. **packages/ui 정합**: web 의 `EpicAccordionCard` (`packages/ui`) 는 React DOM, mobile 은 RN — 동일 컴포넌트 공유 불가. 구조 / 토큰 정합만 유지.
3. **명명 rename 별개 task**: TASK-10-23 (사용자 결정 §A 채택 시) 에서 `IssueCardAccordion` rename — 본 task 는 기존 명 유지.
4. **scope = feat(mobile)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §5.5 / §주의사항 6
- [`./tasks-10-04-core-domain-priority-relocate.md`](./tasks-10-04-core-domain-priority-relocate.md)
- [`./tasks-10-08-ui-epic-accordion-card-priority-badge.md`](./tasks-10-08-ui-epic-accordion-card-priority-badge.md) (web 동등)
- `apps/mobile/src/components/EpicAccordionCard.tsx`
