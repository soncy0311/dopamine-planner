# Task 02-08: epic service/update payload null category 허용

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-08 |
| 상태 | 완료 |
| 의존성 | 02-06 완료 필요 |

## 작업 목표

Epic 생성/수정 service 와 hook 이 `category_id = null` 을 정상 저장하도록 payload 타입과 변환 로직을 보정한다. 신규 Epic 생성 시 category 선택은 optional 이며, 사용자가 선택하지 않으면 분류 없는 Epic 으로 생성되어야 한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/services/epic.ts` | 수정 - create/update payload 에 nullable category 반영 |
| `packages/core/src/hooks/useCreateEpic.ts` | 수정/확인 - category 미선택 생성 허용 |
| `packages/core/src/hooks/useUpdateEpic.ts` | 수정/확인 - category 제거 저장 허용 |
| `packages/core/src/services/todo.ts` | 확인/필요 시 수정 - Epic category null 이 Todo 조회에 미치는 영향 점검 |

### 구현 세부사항

1. **create payload 수정**
   - category 선택 값이 없을 때 `category_id: null` 또는 DB 기본 정책에 맞는 값을 전송한다.
   - category 필수 검증이 core service 에 있으면 optional 로 변경한다.

2. **update payload 수정**
   - Epic 편집에서 분류 제거 시 `category_id = null` 이 실제 update payload 에 포함되도록 한다.
   - undefined 는 변경 없음, null 은 분류 제거라는 의미로 구분한다.

3. **조회/mapper 정합**
   - category join 결과가 null 인 Epic 을 service 가 정상 반환하는지 확인한다.
   - Todo/Sub 조회에서 Epic category join null 때문에 row 가 누락되지 않도록 join 방식을 점검한다.

### 참조 코드

- `packages/core/src/services/epic.ts`: Epic create/update/query service
- `packages/core/src/hooks/useCreateEpic.ts`: 신규 Epic 생성 hook
- `packages/core/src/hooks/useUpdateEpic.ts`: Epic 수정 hook
- `packages/core/src/services/todo.ts`: Todo/Sub 조회 시 Epic category 참조

## 검증 과정

- [x] 신규 Epic 을 category 없이 생성할 수 있다.
- [x] 기존 Epic update 에서 `category_id = null` 을 저장할 수 있다.
- [x] undefined 와 null 의 의미가 service payload 에서 구분된다.
- [x] null category Epic 조회가 누락되거나 mapper 오류를 내지 않는다.

## 주의사항

- 신규 Epic 생성 시 category 선택은 optional 로 전환한다.
- category null 저장을 빈 문자열이나 가짜 id 로 변환하지 않는다.
- UI form validation 변경은 web/mobile 후속 task 에서 처리한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
