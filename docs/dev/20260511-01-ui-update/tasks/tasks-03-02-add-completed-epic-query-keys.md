# Task 03-02: 완료 Epic query key 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-02 |
| 상태 | 대기중 |
| 의존성 | 03-01 완료 필요 |

## 작업 목표

완료 Epic archive 목록과 월 단위 calendar completed count 를 위한 TanStack Query key 를 `packages/core` 에 추가한다. 날짜 범위, 월, category filter, `category_id = null` 필터가 서로 다른 cache entry 로 분리되도록 key 구조를 확정한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/queryKeys.ts` | 수정 - completed archive 및 calendar count query key 추가 |
| `packages/core/src/__tests__/queryKeys.test.ts` | 수정 - 완료 archive/count key 분리 테스트 추가 |

### 구현 세부사항

1. **archive query key 추가**
   - workspace, 기간 조건, category filter 를 key 요소에 포함한다.
   - 전체 category 와 `category_id = null` 을 같은 key 로 취급하지 않는다.
   - 날짜 범위 기반 조회와 월 기반 조회가 충돌하지 않게 key segment 를 분리한다.

2. **calendar count query key 추가**
   - workspace 와 `year-month` 를 포함하는 월 단위 key 를 만든다.
   - 날짜 셀 단위 key 를 만들지 않는다.

3. **테스트 보강**
   - 전체, 특정 category, "분류 없음" filter key 가 서로 다름을 검증한다.
   - archive 목록 key 와 calendar count key 가 서로 다른 namespace 를 사용함을 검증한다.

### 참조 코드

- `packages/core/src/queryKeys.ts`: 기존 Epic/category query key 구조
- `packages/core/src/__tests__/queryKeys.test.ts`: query key 회귀 테스트 패턴
- `packages/core/src/services/epic.ts`: 03-01에서 추가되는 완료 Epic 조회 입력

## 검증 과정

- [ ] 완료 Epic archive query key 가 기간과 category filter 를 포함한다.
- [ ] `category_id = null` 필터가 전체 필터와 다른 key 를 만든다.
- [ ] calendar completed count key 가 월 단위로만 생성된다.
- [ ] 기존 Epic/category query key 와 namespace 충돌이 없다.

## 주의사항

- 완료 archive 기준은 `status = 'completed'` 및 `completed_date` 존재 여부다.
- active 복귀로 `completed_date = null` 이 되면 archive/count 에서 제외한다.
- "분류 없음"은 `category_id = null` 그룹이며 실제 category row 를 생성하지 않는다.
- 월 단위 calendar count 는 batch 조회하며 날짜 셀별 Supabase 호출 금지다.
- indicator 규칙은 0개 없음, 1~5개 점 1개, 6개 이상 `floor(count / 5)` 별표다.
- indicator 자체는 장식이며 접근성 문구는 날짜 버튼/accessibility label 에 병합한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
