# Task 03-04: null category 를 "분류 없음" 그룹으로 매핑

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-04 |
| 상태 | 완료 |
| 의존성 | 03-03 및 Sub-02 nullable category 정책 완료 필요 |

## 작업 목표

`category_id = null` 인 완료 Epic 을 archive 그룹에서 `"분류 없음"`으로 표시되도록 domain mapping 을 완성한다. 이 그룹은 실제 category row 가 아니라 null category 의 표현이며, 일반 category 그룹 뒤 마지막에 배치한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/domain/epic.ts` | 수정 - null category group 표시명/정렬 처리 |
| `packages/core/src/__tests__/domain.test.ts` | 수정 - "분류 없음" 그룹 매핑 테스트 추가 |

### 구현 세부사항

1. **표시 모델 고정**
   - `categoryId` 는 `null` 로 유지한다.
   - `categoryName` 은 `"분류 없음"`으로 고정한다.
   - `categoryColor` 는 `null` 또는 기존 null category UI 정책에 맞는 값으로 유지한다.

2. **정렬 정책**
   - 일반 category group 은 기존 sort/order 정책으로 정렬한다.
   - "분류 없음" 그룹은 일반 category group 뒤 마지막에 배치한다.

3. **회귀 테스트**
   - null category 완료 Epic 이 archive 에서 누락되지 않는지 검증한다.
   - 실제 category row 없이도 "분류 없음" group 이 생성되는지 검증한다.

### 참조 코드

- `packages/core/src/domain/epic.ts`: 03-03 grouping helper
- `packages/core/src/__tests__/domain.test.ts`: null category mapper 테스트 위치
- `docs/dev/20260511-01-ui-update/sub-prd-02-feat-category-management.md`: "분류 없음" row 생성 금지 정책

## 검증 과정

- [x] `category_id = null` 완료 Epic 이 `"분류 없음"` group 에 포함된다.
- [x] `"분류 없음"` group 의 `categoryId` 가 `null` 이다.
- [x] `"분류 없음"` group 을 만들기 위해 category row 를 요구하지 않는다.
- [x] `"분류 없음"` group 이 일반 category group 뒤에 배치된다.

## 실행 기록

- **일시**: 2026-05-12 23:58 KST
- **결과**: `"분류 없음"` 그룹 매핑 및 실제 category row 없는 생성 테스트 통과.

## 주의사항

- 완료 archive 기준은 `status = 'completed'` 및 `completed_date` 존재 여부다.
- active 복귀로 `completed_date = null` 이 되면 archive/count 에서 제외한다.
- "분류 없음"은 `category_id = null` 그룹이며 실제 category row 를 생성하지 않는다.
- 월 단위 calendar count 는 batch 조회하며 날짜 셀별 Supabase 호출 금지다.
- indicator 규칙은 0개 없음, 1~4개는 완료 Epic 1개당 점 1개, 5개 이상은 5개당 별 1개만 표시하며 점은 추가하지 않는다. 주간 UI에서는 선택된 날짜에서도 indicator 색상은 변하지 않고, 월간 UI에서는 선택된 날짜 indicator 색상을 흰색으로 바꾼다.
- indicator 자체는 장식이며 접근성 문구는 날짜 버튼/accessibility label 에 병합한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
