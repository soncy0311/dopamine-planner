# Task 01-04: web Epic 카드 progress linear 적용

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md) |
| 작업 번호 | 01-04 |
| 상태 | 완료 |
| 의존성 | tasks-01-03 완료 필요 |

## 작업 목표

web Epic 카드에서 segmented progress 렌더링을 제거하고, Sub 가 1개 이상인 경우 단일 linear progress bar 와 percent 를 표시한다. Sub 가 0개인 Epic 에서는 progress bar 와 percent 영역을 렌더링하지 않는다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/ui/src/IssueCardAccordion.tsx` | 수정 - `segments` 중심 props/렌더링을 `totalSubCount`, `completedSubCount` 또는 동등 데이터로 전환 |
| `apps/web/src/components/MainDailyView.tsx` | 수정 - 카드 호출부에서 `segments` 강제 전달 제거 및 Sub 0개 미표기 입력 적용 |
| `packages/ui/__tests__/IssueCardAccordion.test.tsx` | 필요 시 수정 - 변경된 props 계약에 맞춰 fixture 갱신 |

### 구현 세부사항

1. **카드 props 정리**
   - `IssueCardAccordionProps` 에서 `segments` 를 제거하거나 내부 구현용이 아닌 progress count 입력으로 대체한다.
   - 권장 입력은 `totalSubCount`, `completedSubCount`, `progressPercent` 이다.
   - `progressPercent` 는 기존 표시 의미를 유지하되 `totalSubCount === 0` 에서는 표시하지 않는다.

2. **progress 영역 조건부 렌더링**
   - `totalSubCount > 0` 인 경우에만 progress row 를 렌더링한다.
   - `<EpicProgressBar ... segments />` 처럼 segmented 를 강제하는 호출을 제거한다.
   - percent 텍스트는 linear bar 옆에 유지하되, 접근성 중복 여부는 task 01-08 에서 테스트한다.

3. **MainDailyView 계산 정합**
   - `total = subs.length`, `doneCount = done subs` 계산은 유지한다.
   - `total === 0` 일 때 `epic.progress` fallback 으로 percent 를 계산해 카드에 표시하던 동작을 제거하거나 미사용 처리한다.
   - main checkbox status 계산은 기존처럼 Sub 0개일 때 `epic.status` 기준을 유지한다.

### 참조 코드

- `packages/ui/src/IssueCardAccordion.tsx`: 현재 `segments.length` 와 `segments.filter` 로 progress 계산
- `apps/web/src/components/MainDailyView.tsx`: 현재 `segments={subs.map(...)}` 전달 및 Sub 0개 `epic.progress` fallback
- `packages/ui/src/EpicProgressBar.tsx`: task 01-03 에서 linear 기본화된 progress 컴포넌트

## 검증 과정

- [x] web Epic 카드에서 segmented segment UI 가 렌더링되지 않는다.
- [x] Sub 0개 Epic 에서는 progress row 와 percent 텍스트가 렌더링되지 않는다.
- [x] Sub 일부 완료 케이스에서 percent 는 `Math.round(doneCount / total * 100)` 와 일치한다.
- [x] main checkbox 일괄 완료/해제 동작은 기존과 동일하다.
- [x] 관련 `packages/ui` 테스트 fixture 가 새 props 계약과 일치한다.

## 주의사항

- `IssueCardAccordion` 의 sub issue list 렌더링과 펼침/접힘 동작은 건드리지 않는다.
- `progressPercent` 계산을 `epic.progress` 기준으로 바꾸지 않는다.
- mobile 구현은 별도 task 01-06 에서 처리한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
