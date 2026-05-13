# Task 04-04: progress 접근성 테스트 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-04 |
| 상태 | 완료 |
| 의존성 | 04-02, 04-03 완료 필요 |

## 작업 목표

web/mobile progress bar 의 접근성 속성이 linear UI 전환 이후에도 기존 의미를 유지하는지 검증한다. 자동 테스트로 role/value/label 속성을 확인하고, 수동 QA 에서 실제 포커스와 screen reader label 흐름을 함께 점검한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/ui/__tests__/IssueCardAccordion.test.tsx` | 수정 - web progressbar ARIA 테스트 추가 |
| `packages/ui/src/EpicProgressBar.tsx` | 필요 시 확인/수정 - `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` 유지 |
| `apps/mobile/src/components/IssueCardAccordion.tsx` | 필요 시 확인/수정 - `accessibilityRole`, `accessibilityValue` 유지 |
| `apps/mobile/src/**/__tests__/*` | 가능 시 수정/신규 - RN accessibility props 테스트 |

### 구현 세부사항

1. **web 접근성 속성 검증**
   - `getByRole('progressbar')` 로 progressbar 를 조회한다.
   - `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` 가 fixture 의 완료/전체 개수와 일치하는지 확인한다.

2. **mobile 접근성 속성 검증**
   - 테스트 환경이 있으면 `accessibilityRole="progressbar"` 와 `accessibilityValue` 를 검증한다.
   - 자동화가 어려운 경우 수동 QA 항목에 실제 screen reader label 확인을 기록한다.

3. **수동 접근성 QA 연결**
   - 카드, 상세, 편집 화면의 포커스 이동과 label 정보를 확인한다.
   - Sub 0개 Epic 에서 progressbar 가 없는 상태가 오해를 만들지 않는지 확인한다.

### 참조 코드

- `packages/ui/src/EpicProgressBar.tsx`: web progress 접근성 구현
- `packages/ui/__tests__/IssueCardAccordion.test.tsx`: web 접근성 테스트 패턴
- `apps/mobile/src/components/IssueCardAccordion.tsx`: mobile progress 접근성 구현
- `docs/base/design-system/components/progress-bar.md`: 접근성 정책 문서

## 검증 과정

- [x] web progressbar role/value/valuetext 테스트가 있다.
- [x] mobile accessibilityRole/accessibilityValue 테스트 또는 수동 QA 항목이 있다.
- [x] Sub 0개 Epic 의 progress 접근성 처리 기준이 확인되어 있다.
- [x] 카드, 상세, 편집 화면의 progress 의미가 동일하게 검증되어 있다.
- [x] 접근성 수동 QA 결과가 문서 또는 이슈에 기록되어 있다.

## 주의사항

- Sub-04는 검증 전용이며 Sub-01~03 기능 구현을 대신 수행하지 않는다.
- web/mobile은 같은 fixture와 같은 정책으로 검증한다.
- category 삭제 후 Epic/Sub 데이터 보존은 UI mock만으로 통과 처리하지 않는다.
- `"분류 없음"`은 `category_id = null`이며 실제 category row 생성 금지다.
- 완료 archive/count 기준은 `status = 'completed'` 및 `completed_date` 존재다.
- active 복귀로 `completed_date = null`이 되면 archive/count에서 제외한다.
- 달력 indicator 규칙은 0개 없음, 1~4개는 점 개수, 5개 이상은 `floor(count / 5)` 별표만 표시하고 점을 추가하지 않는다.
- 접근성은 자동 속성 테스트와 수동 포커스/label 흐름 검증을 함께 다룬다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md)
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
