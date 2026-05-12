# Task 04-06: null category 렌더링 테스트 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-06 |
| 상태 | 대기중 |
| 의존성 | 04-02, 04-05 완료 필요 |

## 작업 목표

`category_id = null` Epic 이 web/mobile 카드, 필터, 편집 폼, archive 에서 `"분류 없음"`으로 표시되는지 테스트한다. `"분류 없음"`을 실제 category row 로 만들지 않고 nullable category 상태로 처리하는지 검증한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/__tests__/domain.test.ts` | 수정 - null category mapper 테스트 |
| `packages/core/src/__tests__/queryKeys.test.ts` | 수정 - 전체/분류 없음 필터 key 분리 테스트 |
| `apps/web/src/components/**/__tests__/*` | 수정/신규 - web null category 표시/필터 테스트 |
| `apps/mobile/src/**/__tests__/*` | 수정/신규 - mobile null category 표시 테스트 |

### 구현 세부사항

1. **core null category 검증**
   - DB row 의 `category_id = null` 이 domain Epic 의 `categoryId: null` 로 변환되는지 확인한다.
   - "전체" 필터와 "분류 없음" 필터가 query key 와 결과 의미에서 구분되는지 확인한다.

2. **web 렌더링 검증**
   - 카드와 목록에서 null category Epic 이 `"분류 없음"`으로 표시되는지 확인한다.
   - 필터에서 "분류 없음" 선택 시 null category Epic 만 포함되는지 확인한다.

3. **mobile 렌더링 검증**
   - mobile 카드와 목록에서 null category Epic 표시가 web 과 같은 문구/의미를 갖는지 확인한다.
   - 자동화가 어려우면 수동 QA 항목으로 기록한다.

### 참조 코드

- `packages/core/src/__tests__/domain.test.ts`: domain mapper 테스트 패턴
- `packages/core/src/__tests__/queryKeys.test.ts`: query key 테스트 패턴
- `apps/web/src/components/MainDailyView.tsx`: web 표시/필터 확인 대상
- `apps/mobile/src/components/MainDailyViewMobile.tsx`: mobile 표시/필터 확인 대상

## 검증 과정

- [ ] `category_id = null` Epic 이 domain 에서 null category 로 유지된다.
- [ ] `"분류 없음"` category row 를 만들지 않는 테스트 또는 검증이 있다.
- [ ] web 카드/목록/필터에서 `"분류 없음"` 표시가 검증된다.
- [ ] mobile 카드/목록에서 `"분류 없음"` 표시가 검증된다.
- [ ] "전체"과 "분류 없음" 필터가 구분된다.

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
