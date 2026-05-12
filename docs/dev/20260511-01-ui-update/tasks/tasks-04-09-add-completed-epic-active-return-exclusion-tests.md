# Task 04-09: 완료 Epic active 복귀 제외 테스트 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-09 |
| 상태 | 대기중 |
| 의존성 | 04-02, 04-08 완료 필요 |

## 작업 목표

완료 Epic 을 active 로 되돌려 `completed_date = null` 이 되었을 때 archive 목록과 calendar count 에서 제외되는지 테스트한다. 기존 Todo/Sub 토글 및 `recalc_epic_progress` 흐름과 충돌하지 않는지도 함께 확인한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/__tests__/cascadeToggleEpic.test.ts` | 수정 - completed에서 active 복귀 제외 테스트 추가 |
| `packages/core/src/__tests__/domain.test.ts` | 수정/확인 - archive/count mapper 제외 조건 테스트 |
| `packages/core/src/services/epic.ts` | 확인 - status 전환과 `completed_date` 처리 |
| `packages/core/src/__tests__/*` | 수정/신규 - calendar count service/hook 제외 테스트 |

### 구현 세부사항

1. **status 전환 검증**
   - completed Epic 을 active 로 되돌리면 `completed_date = null` 이 되는지 확인한다.
   - active 상태 Epic 이 completed archive 조회에서 제외되는지 확인한다.

2. **calendar count 제외 검증**
   - active 복귀된 Epic 이 기존 완료 날짜 count 에 남지 않는지 확인한다.
   - 같은 날짜에 다른 completed Epic 이 있으면 해당 count 만 유지되는지 확인한다.

3. **토글 회귀 확인**
   - Todo/Sub 토글로 Epic progress 가 재계산되는 기존 흐름이 깨지지 않는지 확인한다.
   - 실패 시 Sub-03 구현 범위로 되돌려 수정한다.

### 참조 코드

- `packages/core/src/__tests__/cascadeToggleEpic.test.ts`: Epic 완료/active 전환 테스트
- `packages/core/src/services/epic.ts`: Epic status update service
- `docs/dev/20260511-01-ui-update/tasks/tasks-03-15-add-completed-epic-archive-calendar-tests.md`: 선행 회귀 테스트 task

## 검증 과정

- [ ] completed Epic 을 active 로 되돌리면 `completed_date = null` 이 된다.
- [ ] active 복귀 Epic 은 archive 목록에서 제외된다.
- [ ] active 복귀 Epic 은 calendar count 에서 제외된다.
- [ ] 기존 Todo/Sub 토글과 progress 재계산 회귀가 없다.
- [ ] web/mobile 수동 QA 에서 active 복귀 후 archive/count 제외가 확인된다.

## 주의사항

- Sub-04는 검증 전용이며 Sub-01~03 기능 구현을 대신 수행하지 않는다.
- web/mobile은 같은 fixture와 같은 정책으로 검증한다.
- category 삭제 후 Epic/Sub 데이터 보존은 UI mock만으로 통과 처리하지 않는다.
- `"분류 없음"`은 `category_id = null`이며 실제 category row 생성 금지다.
- 완료 archive/count 기준은 `status = 'completed'` 및 `completed_date` 존재다.
- active 복귀로 `completed_date = null`이 되면 archive/count에서 제외한다.
- 달력 indicator 규칙은 0개 없음, 1~5개 점 1개, 6개 이상 `floor(count / 5)` 별표다.
- 접근성은 자동 속성 테스트와 수동 포커스/label 흐름 검증을 함께 다룬다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)
