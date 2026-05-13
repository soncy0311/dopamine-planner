# Task 04-10: 달력 indicator count 규칙 테스트 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-10 |
| 상태 | 완료 |
| 의존성 | 04-02, 04-09 완료 필요 |

## 작업 목표

달력 indicator 규칙이 web/mobile 에서 동일하게 적용되는지 테스트한다. 완료 Epic count 0개, 1개, 4개, 5개, 6개, 10개 케이스를 fixture 로 검증하고, count 기준이 `status = 'completed'` 및 `completed_date` 존재인지 확인한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/__tests__/domain.test.ts` | 수정/신규 - indicator count mapper 테스트 |
| `packages/core/src/__tests__/queryKeys.test.ts` | 수정/확인 - calendar count query key 테스트 |
| `apps/web/src/components/**/__tests__/*` | 수정/신규 - web calendar indicator 렌더링 테스트 |
| `apps/mobile/src/**/__tests__/*` | 수정/신규 - mobile calendar indicator 렌더링 테스트 |
| `apps/web/src/components/MainDailyView.tsx` | 확인 - web indicator 렌더링 대상 |
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 확인 - mobile indicator 렌더링 대상 |

### 구현 세부사항

1. **count 규칙 검증**
   - 완료 Epic 0개 날짜는 indicator 를 표시하지 않는다.
   - 완료 Epic 1~4개 날짜는 count 와 같은 개수의 점을 표시한다.
   - 완료 Epic 5개 이상 날짜는 `floor(count / 5)` 개의 별표만 표시하고 점을 추가하지 않는다.

2. **archive/count 기준 검증**
   - `status = 'completed'` 및 `completed_date` 가 있는 Epic 만 count 에 포함한다.
   - active 복귀 또는 `completed_date = null` 인 Epic 은 count 에 포함하지 않는다.

3. **web/mobile 정합 검증**
   - 같은 fixture 날짜에서 web/mobile indicator 결과가 같은지 확인한다.
   - 자동화가 어려운 mobile 범위는 수동 QA 항목으로 연결한다.

### 참조 코드

- `apps/web/src/components/MainDailyView.tsx`: web calendar indicator 구현
- `apps/mobile/src/components/MainDailyViewMobile.tsx`: mobile calendar indicator 구현
- `packages/core/src/__tests__/queryKeys.test.ts`: calendar count query key 테스트
- `docs/dev/20260511-01-ui-update/tasks/tasks-03-09-add-web-calendar-completed-indicator.md`: web 선행 task
- `docs/dev/20260511-01-ui-update/tasks/tasks-03-13-add-mobile-calendar-completed-indicator.md`: mobile 선행 task

## 검증 과정

- [x] 완료 Epic 0개 날짜는 indicator 가 없다.
- [x] 완료 Epic 1개와 4개 날짜는 count 와 같은 점 개수를 표시한다.
- [x] 완료 Epic 5개, 6개, 10개 날짜는 `floor(count / 5)` 별표만 표시한다.
- [x] count 기준이 `status = 'completed'` 및 `completed_date` 존재로 검증된다.
- [x] web/mobile indicator 규칙이 같은 fixture 로 검증된다.

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
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)
