# Task 01-07: mobile Epic 상세/편집 progress 정책 정합 확인

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md) |
| 작업 번호 | 01-07 |
| 상태 | 대기중 |
| 의존성 | tasks-01-06 완료 필요 |

## 작업 목표

mobile Epic 상세/편집 화면에 progress 표시가 있는지 확인하고, 표시가 있다면 카드와 동일한 linear 및 Sub 0개 미표기 정책으로 보정한다. 현재 확인된 구현에서는 `apps/mobile/src/app/epic-form.tsx` 와 `apps/mobile/src/components/forms/EpicForm.tsx` 에 별도 progress 표시가 없으므로, 작업 시점에 재확인한 결과를 완료 기록에 남긴다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/mobile/src/app/epic-form.tsx` | 확인/필요 시 수정 - Epic 생성/수정 screen progress 표시 여부 점검 |
| `apps/mobile/src/components/forms/EpicForm.tsx` | 확인/필요 시 수정 - Epic form progress 표시 여부 점검 |
| `apps/mobile/src/**` | 검색 - `progressPercent`, `progressbar`, `segments`, `accessibilityRole="progressbar"` 사용처 추가 확인 |

### 구현 세부사항

1. **사용처 재검색**
   - `rg -n "progressPercent|progressbar|segments|accessibilityRole=\\\"progressbar\\\"|progress" apps/mobile/src` 로 mobile progress 표시 사용처를 확인한다.
   - Spinner 의 progressbar role 은 로딩 표시이므로 Epic 진행률 검토 범위와 분리한다.

2. **상세/편집 화면 정책 적용**
   - Epic 진행률 UI 가 있다면 `totalSubCount > 0` 일 때만 linear bar 를 표시한다.
   - `totalSubCount === 0` 일 때는 progress row 를 숨긴다.
   - `accessibilityValue` 의 `min`, `max`, `now`, `text` 를 카드와 같은 의미로 맞춘다.

3. **현재 구현 확인 결과 기록**
   - `epic-form.tsx` 는 생성/수정 screen orchestration 이며 현재 progress UI 가 없다.
   - `EpicForm.tsx` 는 입력 폼이며 현재 progress UI 가 없다.
   - 변경이 없다면 "해당 없음, 카드 정책으로 충분" 을 완료 기록에 남긴다.

### 참조 코드

- `apps/mobile/src/app/epic-form.tsx`: 현재 Epic 생성/수정 screen
- `apps/mobile/src/components/forms/EpicForm.tsx`: 현재 Epic form UI
- `apps/mobile/src/components/IssueCardAccordion.tsx`: mobile 카드 progress 정책 기준

## 검증 과정

- [ ] mobile 상세/편집 화면의 progress 관련 사용처 검색 결과를 확인했다.
- [ ] progress 표시가 있는 경우 카드와 동일한 linear/Sub 0개 미표기 정책이 적용되어 있다.
- [ ] progress 표시가 없는 경우 불필요한 UI 를 새로 추가하지 않았고, 확인 결과를 작업 기록에 남겼다.
- [ ] 기존 Epic 생성/수정/삭제 흐름이 변경되지 않았다.

## 주의사항

- `Spinner` 의 `accessibilityRole="progressbar"` 는 Epic progress 와 다른 로딩 의미이므로 변경 대상이 아니다.
- 상세/편집 화면에 progress 가 없다는 이유로 새 progress UI 를 임의로 추가하지 않는다.
- category nullable 또는 분류 제거 정책은 다른 Sub-PRD 범위다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
