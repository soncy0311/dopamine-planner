# Task 04-11: Realtime invalidation 테스트 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-11 |
| 상태 | 대기중 |
| 의존성 | 04-02, 04-05, 04-08, 04-10 완료 필요 |

## 작업 목표

Realtime invalidate 가 category, epic, sub 변경에 반응해 일자 뷰, category 표시, completed archive, calendar count cache 를 갱신하는지 테스트한다. 다른 세션 변경이 web/mobile 수동 QA 에서 반영되는지도 확인한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/realtime/subscribeTodos.ts` | 확인 - invalidation 대상 query key 점검 |
| `packages/core/src/__tests__/queryKeys.test.ts` | 수정/확인 - invalidate 대상 key 구조 검증 |
| `packages/core/src/__tests__/*` | 수정/신규 - realtime invalidate helper 테스트 |
| `apps/web/src/components/MainDailyView.tsx` | 확인 - web realtime 반영 대상 화면 |
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 확인 - mobile realtime 반영 대상 화면 |

### 구현 세부사항

1. **invalidate 대상 검증**
   - category 변경 시 category 목록, Epic 목록, archive group 관련 key 가 invalidated 되는지 확인한다.
   - epic 변경 시 일자 뷰, archive, calendar count 관련 key 가 invalidated 되는지 확인한다.
   - sub 변경 시 Epic progress 와 archive/count 에 영향을 줄 수 있는 key 가 invalidated 되는지 확인한다.

2. **query key 정합 검증**
   - archive 목록 key 와 calendar count key 가 기간/category 조건별로 분리되는지 확인한다.
   - invalidate 가 과도하게 누락되거나 특정 조건만 갱신하는지 확인한다.

3. **수동 realtime QA 연결**
   - 다른 세션에서 category 삭제, Epic 완료/active 복귀, Sub 토글을 수행한다.
   - web/mobile 화면이 새로고침 없이 또는 문서화된 refresh 정책대로 갱신되는지 기록한다.

### 참조 코드

- `packages/core/src/realtime/subscribeTodos.ts`: realtime subscription/invalidation 구현
- `packages/core/src/__tests__/queryKeys.test.ts`: query key 테스트 패턴
- `docs/dev/20260511-01-ui-update/tasks/tasks-03-06-include-archive-calendar-realtime-invalidation.md`: 선행 realtime task

## 검증 과정

- [ ] category 변경 시 관련 category/Epic/archive query 가 invalidated 된다.
- [ ] epic 완료/active 변경 시 archive/calendar count query 가 invalidated 된다.
- [ ] sub 변경 시 progress 관련 query 가 invalidated 된다.
- [ ] archive 목록 key 와 calendar count key 가 조건별로 분리된다.
- [ ] web/mobile 수동 QA 에서 다른 세션 변경 반영이 확인된다.

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
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)
