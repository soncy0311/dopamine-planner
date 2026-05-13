# Task 04-01: Sub-PRD 구현 범위 확인

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-01 |
| 상태 | 완료 |
| 의존성 | Sub-01, Sub-02, Sub-03 구현 완료 필요 |

## 작업 목표

Sub-01~03 의 구현 완료 여부와 변경 파일 범위를 확인해 Sub-04 QA 가 실제 구현 결과를 검증할 수 있는 상태인지 판단한다. 미완료 구현, 문서와 다른 정책, 테스트 불가능한 범위를 먼저 식별해 후속 QA task 의 입력 조건을 고정한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `docs/dev/20260511-01-ui-update/sub-prd-01-refactor-progress-ui-unification.md` | 확인 - progress 구현 범위와 완료 기준 점검 |
| `docs/dev/20260511-01-ui-update/sub-prd-02-feat-category-management.md` | 확인 - category/null category 구현 범위와 완료 기준 점검 |
| `docs/dev/20260511-01-ui-update/sub-prd-03-feat-completed-epic-archive-calendar.md` | 확인 - archive/calendar 구현 범위와 완료 기준 점검 |
| `packages/core/src/**` | 확인 - domain/service/query/realtime 변경 범위 점검 |
| `apps/web/src/**` | 확인 - web UI 변경 범위 점검 |
| `apps/mobile/src/**` | 확인 - mobile UI 변경 범위 점검 |

### 구현 세부사항

1. **Sub-PRD 상태 확인**
   - Sub-01~03 의 작업 체크리스트와 검증 기준이 구현 결과와 맞는지 확인한다.
   - Sub-04 에서 검증해야 할 정책이 문서에 남아 있는지 확인한다.

2. **변경 파일 범위 확인**
   - progress, category, archive, calendar, realtime 관련 변경 파일을 분류한다.
   - web/mobile 양쪽에 대응 구현이 있는지 확인한다.

3. **QA 선행 조건 정리**
   - 자동 테스트로 검증할 범위와 수동 QA 로만 확인할 범위를 구분한다.
   - 미완료 구현은 Sub-04 에서 대신 구현하지 않고 선행 task 로 되돌린다.

### 참조 코드

- `packages/core/src/__tests__/domain.test.ts`: core domain 검증 범위 확인
- `packages/core/src/__tests__/queryKeys.test.ts`: query key 검증 범위 확인
- `packages/core/src/realtime/subscribeTodos.ts`: realtime invalidate 검증 범위 확인
- `apps/web/src/components/MainDailyView.tsx`: web 달력/progress 검증 대상 확인
- `apps/mobile/src/components/MainDailyViewMobile.tsx`: mobile 달력/progress 검증 대상 확인

## 검증 과정

- [x] Sub-01~03 의 완료 여부가 확인되어 있다.
- [x] Sub-04 에서 검증할 변경 파일 범위가 정리되어 있다.
- [x] web/mobile 모두 동일 정책으로 QA 할 수 있는 구현 진입점이 확인되어 있다.
- [x] Sub-04 가 선행 기능 구현을 대신 수행하지 않는다는 범위가 기록되어 있다.

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
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)
