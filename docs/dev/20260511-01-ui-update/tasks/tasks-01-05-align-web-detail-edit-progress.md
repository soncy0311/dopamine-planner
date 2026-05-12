# Task 01-05: web Epic 상세/편집 progress 정책 정합 확인

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md) |
| 작업 번호 | 01-05 |
| 상태 | 완료 |
| 의존성 | tasks-01-04 완료 필요 |

## 작업 목표

web Epic 상세/편집 화면에 progress 표시가 있는지 확인하고, 표시가 있다면 카드와 동일한 linear 및 Sub 0개 미표기 정책으로 보정한다. 현재 확인된 구현에서는 `EpicDetailModal` 과 `EpicFormModal` 에 별도 progress 표시가 없으므로, 작업 시점에 재확인한 결과를 task 완료 기록에 남긴다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `apps/web/src/components/modals/EpicDetailModal.tsx` | 확인/필요 시 수정 - Epic 수정 모달 progress 표시 여부 점검 |
| `apps/web/src/components/modals/EpicFormModal.tsx` | 확인/필요 시 수정 - Epic 생성 모달 progress 표시 여부 점검 |
| `apps/web/src/components/**` | 검색 - `EpicProgressBar`, `progressPercent`, `progressbar`, `segments` 사용처 추가 확인 |

### 구현 세부사항

1. **사용처 재검색**
   - `rg -n "EpicProgressBar|progressPercent|progressbar|segments|progress" apps/web/src packages/ui/src` 로 web progress 표시 사용처를 확인한다.
   - 카드 외 상세/편집 화면에 progress UI 가 추가되어 있다면 task 01-04 와 같은 정책을 적용한다.

2. **상세/편집 화면 정책 적용**
   - `totalSubCount > 0` 일 때만 linear progress bar 를 표시한다.
   - `totalSubCount === 0` 일 때는 progress row 를 표시하지 않는다.
   - 접근성 속성은 `EpicProgressBar` 기본 의미를 사용하거나 동일한 aria 값을 주입한다.

3. **현재 구현 확인 결과 기록**
   - `EpicDetailModal` 은 Epic 수정 폼이며 현재 progress UI 가 없다.
   - `EpicFormModal` 은 Epic 생성 폼이며 현재 progress UI 가 없다.
   - 변경이 없다면 "해당 없음, 카드 정책으로 충분" 을 완료 기록에 남긴다.

### 참조 코드

- `apps/web/src/components/modals/EpicDetailModal.tsx`: 현재 Epic 수정 모달
- `apps/web/src/components/modals/EpicFormModal.tsx`: 현재 Epic 생성 모달
- `packages/ui/src/IssueCardAccordion.tsx`: web 카드 progress 정책 기준

## 검증 과정

- [x] web 상세/편집 화면의 progress 관련 사용처 검색 결과를 확인했다.
- [x] progress 표시가 있는 경우 카드와 동일한 linear/Sub 0개 미표기 정책이 적용되어 있다.
- [x] progress 표시가 없는 경우 불필요한 UI 를 새로 추가하지 않았고, 확인 결과를 작업 기록에 남겼다.
- [x] 기존 Epic 생성/수정 폼 제출 흐름이 변경되지 않았다.

## 완료 기록

- **일시**: 2026-05-12 21:41
- **확인 결과**: `EpicDetailModal`, `EpicFormModal` 에 Epic 진행률 UI 없음. 해당 없음, 카드 정책으로 충분.

## 주의사항

- 상세/편집 화면에 progress 가 없다는 이유로 새 progress UI 를 임의로 추가하지 않는다.
- 분류/우선순위/등록일 폼 정책은 본 task 범위가 아니다.
- task 01-04 에서 정리한 카드 정책과 충돌하는 별도 progress 정책을 만들지 않는다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
