# Task 04-05: category delete detach 테스트 검증

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md) |
| 작업 번호 | 04-05 |
| 상태 | 완료 |
| 의존성 | 04-01, 04-02 완료 필요 |

## 작업 목표

category 삭제가 연결 Epic/Sub 삭제로 이어지지 않고 Epic 의 `category_id` 만 `null` 로 전환되는지 DB 또는 core service 테스트로 검증한다. UI mock 이 아니라 실제 정책 경로를 통해 데이터 보존 회귀를 막는다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `packages/core/src/__tests__/rpc.test.ts` | 수정/확인 - category delete detach RPC 테스트 |
| `packages/core/src/__tests__/domain.test.ts` | 수정/확인 - null category domain 변환 검증 |
| `packages/core/src/services/category.ts` | 확인 - delete detach service 호출 경로 |
| `packages/core/src/services/epic.ts` | 확인 - `category_id = null` 저장 허용 여부 |
| `supabase/migrations/**` | 확인 - FK nullable/set null 정책 반영 여부 |

### 구현 세부사항

1. **DB 정책 검증**
   - category 삭제 후 연결 Epic row 가 삭제되지 않는지 확인한다.
   - 연결 Epic 의 `category_id` 가 `null` 이 되는지 확인한다.
   - 연결 Sub row 가 Epic 과 함께 유지되는지 확인한다.

2. **service/RPC 경로 검증**
   - category delete service 가 detach 정책을 사용하는지 확인한다.
   - RPC 가 있다면 타 사용자 category 삭제가 차단되는지 확인한다.

3. **회귀 조건 확인**
   - 기존 cascade delete 정책이 남아 Epic/Sub 를 삭제할 가능성이 없는지 확인한다.
   - 실패 시 Sub-02 구현 범위로 되돌려 수정한다.

### 참조 코드

- `packages/core/src/__tests__/rpc.test.ts`: RPC 테스트 패턴
- `packages/core/src/services/category.ts`: category 삭제 service
- `packages/core/src/services/epic.ts`: Epic category update service
- `docs/dev/20260511-01-ui-update/tasks/tasks-02-17-add-category-detach-tests.md`: 선행 테스트 task

## 검증 과정

- [x] category 삭제 후 연결 Epic row 가 삭제되지 않는다.
- [x] category 삭제 후 연결 Epic 의 `category_id` 가 `null` 이 된다.
- [x] category 삭제 후 연결 Sub row 가 삭제되지 않는다.
- [x] 타 사용자 category 삭제가 차단되는 테스트가 있다.
- [x] UI mock 만으로 통과 처리하지 않고 DB 또는 core service 경로를 검증한다.

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
- [`../sub-prd-04-test-cross-client-qa.md`](../sub-prd-04-test-cross-client-qa.md)
