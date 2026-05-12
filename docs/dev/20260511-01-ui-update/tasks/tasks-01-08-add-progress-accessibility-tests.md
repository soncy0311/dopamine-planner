# Task 01-08: Progress 접근성 테스트 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md) |
| 작업 번호 | 01-08 |
| 상태 | 대기중 |
| 의존성 | tasks-01-04, tasks-01-05, tasks-01-06, tasks-01-07 완료 필요 |

## 작업 목표

web progressbar 의 role/value/보조 텍스트 테스트를 추가하고, mobile 은 테스트 스크립트 부재를 고려해 접근성 props 검증 또는 수동 QA 항목을 명시한다. 시각 UI 가 linear 로 바뀌어도 보조기기 의미는 "전체 N개 중 M개 완료" 로 유지되어야 한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/ui/__tests__/IssueCardAccordion.test.tsx` | 수정 - web 카드 progressbar 접근성 및 Sub 0개 미표기 테스트 추가 |
| `packages/ui/src/IssueCardAccordion.tsx` | 필요 시 수정 - 테스트 가능한 aria/value/text 속성 보강 |
| `packages/ui/src/EpicProgressBar.tsx` | 필요 시 수정 - `aria-valuetext` 등 접근성 속성 보강 |
| `apps/mobile/src/components/IssueCardAccordion.tsx` | 필요 시 수정 - `accessibilityRole`, `accessibilityValue` 보강 |

### 구현 세부사항

1. **web role/value 테스트**
   - Sub 일부 완료 fixture 로 `getByRole('progressbar')` 를 검증한다.
   - `aria-valuemin="0"`, `aria-valuemax`, `aria-valuenow` 값이 count 또는 문서 기준과 일치하는지 확인한다.
   - `aria-valuetext` 가 `전체 2개 중 1개 완료 (50%)` 와 같은 의미를 담는지 검증한다.

2. **Sub 0개 미표기 테스트**
   - `totalSubCount = 0` 또는 빈 sub fixture 에서 `queryByRole('progressbar')` 가 `null` 인지 확인한다.
   - percent 텍스트도 표시되지 않는지 확인한다.

3. **segmented 회귀 방지**
   - progressbar 내부에 Sub 개수만큼 segment element 를 렌더링하는 이전 구조가 남지 않도록 테스트 가능한 selector 또는 구조 검증을 추가한다.
   - 구현이 className 기반이면 지나치게 취약한 스타일 테스트 대신 role/value 중심으로 검증한다.

4. **mobile 검증 계획**
   - mobile package 에 test script 가 없으므로 자동화가 어렵다면 `make test` 범위에서 제외하고 `typecheck` 및 수동 QA 체크리스트를 남긴다.
   - 가능하면 RN 컴포넌트 테스트 환경 유무를 확인한 뒤 `accessibilityRole`/`accessibilityValue` props 검증을 추가한다.

### 참조 코드

- `packages/ui/__tests__/IssueCardAccordion.test.tsx`: 현재 web 카드 테스트
- `packages/ui/src/EpicProgressBar.tsx`: web progressbar aria 속성 구현
- `apps/mobile/src/components/IssueCardAccordion.tsx`: mobile progress 접근성 props 구현 대상

## 검증 과정

- [ ] web 테스트에 progressbar role/value/valuetext 검증이 추가되어 있다.
- [ ] Sub 0개 Epic 에서 progressbar 미표기 테스트가 추가되어 있다.
- [ ] 일부 완료와 전체 완료 fixture 가 접근성 의미를 검증한다.
- [ ] mobile 자동 테스트가 없으면 typecheck 및 수동 QA 검증 항목이 명시되어 있다.
- [ ] `make test` 실행 시 추가된 web 테스트가 통과한다.

## 주의사항

- 테스트는 구현 세부 className 보다 사용자/보조기기 관찰 가능 의미를 우선 검증한다.
- mobile package 에 test script 가 없다는 현재 제약을 문서화하고, 없는 스크립트를 임의로 요구하지 않는다.
- 접근성 보강 과정에서 progress 계산식을 변경하지 않는다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-01-refactor-progress-ui-unification.md`](../sub-prd-01-refactor-progress-ui-unification.md)
- [`../../../base/design-system/components/progress-bar.md`](../../../base/design-system/components/progress-bar.md)
