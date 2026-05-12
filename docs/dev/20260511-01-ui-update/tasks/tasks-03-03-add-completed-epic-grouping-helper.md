# Task 03-03: 완료 Epic category 그룹핑 헬퍼 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-03 |
| 상태 | 대기중 |
| 의존성 | 03-01, 03-02 완료 필요 |

## 작업 목표

완료 Epic 목록을 category 기준으로 그룹핑하는 domain helper 를 추가한다. 일반 category group 은 기존 sort/order 정책을 따르고, `category_id = null` row 는 후속 task 에서 "분류 없음" 그룹으로 안정적으로 합칠 수 있는 구조를 만든다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/domain/epic.ts` | 수정 - `CompletedEpicArchiveGroup` 타입 및 grouping helper 추가 |
| `packages/core/src/__tests__/domain.test.ts` | 수정 - 완료 Epic 그룹핑 테스트 추가 |

### 구현 세부사항

1. **그룹 모델 정의**
   - `categoryId: string | null`, `categoryName`, `categoryColor`, `epics` 를 포함한다.
   - 완료 Epic row 의 category metadata 가 비어 있어도 helper 가 예외 없이 처리하도록 한다.

2. **정렬 정책 적용**
   - 일반 category 는 기존 category sort/order 정책을 우선한다.
   - 그룹 내 Epic 은 `completed_date desc` 정렬을 유지한다.

3. **테스트 작성**
   - 여러 category 의 완료 Epic 이 category 별 그룹으로 묶이는지 검증한다.
   - 비어 있는 category group 을 표시할지 여부는 UI 요구사항에 맞춰 명확히 결정하고 테스트에 반영한다.

### 참조 코드

- `packages/core/src/domain/epic.ts`: Epic mapper 및 domain helper 위치
- `packages/core/src/__tests__/domain.test.ts`: domain helper 테스트 패턴
- `packages/core/src/services/epic.ts`: 완료 Epic row 반환 모델

## 검증 과정

- [ ] 완료 Epic 이 category 별 group 으로 묶인다.
- [ ] group 모델이 web/mobile 에 필요한 category 이름, 색상, 완료 Epic 목록을 포함한다.
- [ ] 일반 category group 정렬이 기존 category sort/order 정책을 따른다.
- [ ] `category_id = null` row 가 helper 처리 과정에서 누락되지 않는다.

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
