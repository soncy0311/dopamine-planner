# Task 03-01: 완료 Epic 목록 조회 service 추가

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md) |
| 작업 번호 | 03-01 |
| 상태 | 대기중 |
| 의존성 | Sub-02 nullable category 정책 완료 필요 |

## 작업 목표

`packages/core` 에 완료 Epic archive 목록을 조회하는 service 를 추가한다. 조회 기준은 `status = 'completed'` 이고 `completed_date` 가 존재하는 Epic 으로 고정하며, workspace, 월/날짜 범위, optional category filter 를 입력받아 web/mobile 이 같은 데이터 계약을 사용하도록 한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/services/epic.ts` | 수정 - 완료 Epic 목록 조회 service 추가 또는 기존 Epic service 확장 |
| `packages/core/src/domain/epic.ts` | 확인/필요 시 수정 - 완료 Epic row mapper 와 nullable category 타입 정합 확인 |
| `packages/shared/src/database.ts` | 확인 - `completed_date`, `category_id: null` generated type 반영 여부 확인 |

### 구현 세부사항

1. **조회 입력 정의**
   - workspace/user 범위를 기존 Epic service 패턴과 동일하게 제한한다.
   - `month` 또는 `from`/`to` 날짜 범위를 받는 입력 모델을 정의한다.
   - category filter 는 전체, 특정 category, `category_id = null` 을 구분할 수 있게 설계한다.

2. **Supabase 조회 조건 구현**
   - `status = 'completed'` 조건을 반드시 포함한다.
   - `completed_date` 가 `null` 인 row 는 archive 에서 제외한다.
   - 정렬은 `completed_date desc` 를 우선하고 같은 날짜 안에서는 기존 Epic 정렬 정책을 따른다.

3. **반환 모델 정리**
   - 제목, 분류, 우선순위, 완료일, 100% progress 표시에 필요한 필드를 포함한다.
   - `category_id = null` 을 service 단계에서 누락하지 않는다.

### 참조 코드

- `packages/core/src/services/epic.ts`: 기존 Epic CRUD 및 목록 조회 패턴
- `packages/core/src/domain/epic.ts`: DB row 에서 domain 모델로 변환하는 mapper 패턴
- `docs/dev/20260511-01-ui-update/sub-prd-02-feat-category-management.md`: nullable category 선행 정책

## 검증 과정

- [ ] `status = 'completed'` 이고 `completed_date` 가 있는 Epic 만 반환된다.
- [ ] active 복귀로 `completed_date = null` 이 된 Epic 이 반환되지 않는다.
- [ ] 특정 category 와 `category_id = null` 필터가 구분된다.
- [ ] 날짜 범위 또는 월 범위 조건이 `completed_date` 기준으로 적용된다.

## 주의사항

- 완료 archive 기준은 `status = 'completed'` 및 `completed_date` 존재 여부다.
- active 복귀로 `completed_date = null` 이 되면 archive/count 에서 제외한다.
- "분류 없음"은 `category_id = null` 그룹이며 실제 category row 를 생성하지 않는다.
- 월 단위 calendar count 는 별도 batch 조회로 처리하고 날짜 셀별 Supabase 호출을 만들지 않는다.
- indicator 규칙은 0개 없음, 1~5개 점 1개, 6개 이상 `floor(count / 5)` 별표다.
- indicator 자체는 장식이며 접근성 문구는 날짜 버튼/accessibility label 에 병합한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
- [`../sub-prd-03-feat-completed-epic-archive-calendar.md`](../sub-prd-03-feat-completed-epic-archive-calendar.md)
