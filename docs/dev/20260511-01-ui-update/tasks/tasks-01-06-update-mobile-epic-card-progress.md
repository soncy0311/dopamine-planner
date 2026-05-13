# Task 01-06: mobile Epic 카드 progress linear 적용

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md) |
| 작업 번호 | 01-06 |
| 상태 | 완료 |
| 의존성 | tasks-01-03 완료 필요 |

## 작업 목표

mobile Epic 카드에서 segment 배열 기반 progress 렌더링을 단일 linear progress bar 로 전환한다. Sub 가 0개인 Epic 에서는 progress bar 와 percent 영역을 표시하지 않고, `accessibilityRole="progressbar"` 및 `accessibilityValue` 의미는 Sub 가 있는 경우에 유지한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/mobile/src/components/IssueCardAccordion.tsx` | 수정 - segment map 렌더링을 linear fill width 로 변경 |
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 수정 - `segments` 전달 제거 및 count 기반 props 전달 |

### 구현 세부사항

1. **props 계약 변경**
   - `segments: { filled: boolean }[]` 대신 `totalSubCount`, `completedSubCount`, `progressPercent` 또는 동등한 count 입력을 사용한다.
   - 기존 `subIssues` 는 펼침 body 렌더링용으로 유지한다.

2. **linear bar 렌더링**
   - `totalSubCount > 0` 인 경우 track `<View>` 와 fill `<View>` 를 렌더링한다.
   - fill width 는 `progressPercent` 또는 `completedSubCount / totalSubCount` 기반으로 계산한다.
   - `totalSubCount === 0` 이면 progress row 자체를 렌더링하지 않는다. 현재의 빈 periwinkle bar fallback 은 제거한다.

3. **mobile 접근성 유지**
   - progress 컨테이너에 `accessibilityRole="progressbar"` 를 지정한다.
   - `accessibilityValue={{ min: 0, max: totalSubCount, now: completedSubCount, text: '전체 N개 중 M개 완료 (NN%)' }}` 형태로 의미를 제공한다.
   - 시각 percent 텍스트는 중복 전달이 과하면 `accessible={false}` 등 RN 패턴을 검토한다.

### 참조 코드

- `apps/mobile/src/components/IssueCardAccordion.tsx`: 현재 segment 배열 map 및 Sub 0개 빈 bar 렌더링
- `apps/mobile/src/components/MainDailyViewMobile.tsx`: 현재 `segments={item.subs.map(...)}` 전달 및 Sub 0개 `epic.progress` fallback
- `packages/ui/src/EpicProgressBar.tsx`: web linear 정책 참고

## 검증 과정

- [x] mobile Epic 카드에서 segment 배열이 화면에 렌더링되지 않는다.
- [x] Sub 0개 Epic 에서는 progress row 와 percent 텍스트가 표시되지 않는다.
- [x] Sub 일부 완료/전체 완료 케이스의 percent 가 `completedSubCount / totalSubCount` 와 일치한다.
- [x] `accessibilityRole` 과 `accessibilityValue` 가 Sub 가 있는 progress 에 유지된다.
- [x] mobile package 에 별도 test script 가 없으면 `typecheck` 및 수동 QA 항목으로 검증 계획을 남긴다.

## 주의사항

- React Native 에서는 width percent 문자열과 className 조합이 실제 렌더링되는지 확인한다.
- mobile checkbox, 펼침, sub issue press 동작은 변경하지 않는다.
- web 구현은 task 01-04 에서 별도로 처리한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
