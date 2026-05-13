# Task 04-08: 완료 Epic archive group mapper 테스트 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-08 |
| 상태 | 완료 |
| 의존성 | 04-02, 04-06 완료 필요 |

## 작업 목표

완료 Epic archive 의 분류별 grouping helper 또는 mapper 가 일반 분류와 `"분류 없음"` 그룹을 모두 올바르게 만드는지 테스트한다. archive 기준이 `status = 'completed'` 및 `completed_date` 존재인 것도 함께 검증한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/__tests__/domain.test.ts` | 수정 - completed archive group mapper 테스트 추가 |
| `packages/core/src/domain/**` | 확인 - completed Epic grouping helper 위치 점검 |
| `packages/core/src/services/epic.ts` | 확인 - completed archive 조회 결과 shape 점검 |
| `apps/web/src/components/**/__tests__/*` | 필요 시 수정 - web archive group 렌더링 테스트 |
| `apps/mobile/src/**/__tests__/*` | 필요 시 수정 - mobile archive group 렌더링 테스트 |

### 구현 세부사항

1. **group mapper 검증**
   - 일반 category Epic 이 해당 category group 에 포함되는지 확인한다.
   - `category_id = null` Epic 이 `"분류 없음"` group 에 포함되는지 확인한다.
   - group 정렬 정책이 문서와 구현에서 일치하는지 확인한다.

2. **archive 기준 검증**
   - `status = 'completed'` 이면서 `completed_date` 가 있는 Epic 만 포함한다.
   - completed 상태라도 `completed_date` 가 없으면 제외한다.

3. **UI 연결 검증**
   - web/mobile archive 에서 mapper 결과를 그대로 렌더링하는지 확인한다.
   - null category group 을 실제 category row 로 표현하지 않는지 확인한다.

### 참조 코드

- `packages/core/src/__tests__/domain.test.ts`: mapper 테스트 패턴
- `packages/core/src/services/epic.ts`: completed archive service
- `docs/dev/20260511-01-ui-update/tasks/tasks-03-03-add-completed-epic-grouping-helper.md`: grouping helper 선행 task
- `docs/dev/20260511-01-ui-update/tasks/tasks-03-04-map-null-category-to-uncategorized-group.md`: null category group 선행 task

## 검증 과정

- [x] 일반 category completed Epic 이 category group 에 포함된다.
- [x] `category_id = null` completed Epic 이 `"분류 없음"` group 에 포함된다.
- [x] `status = 'completed'` 및 `completed_date` 존재 기준이 테스트된다.
- [x] `completed_date` 가 없는 Epic 은 archive group 에서 제외된다.
- [x] web/mobile archive 렌더링이 같은 group 의미를 사용한다.

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
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)
