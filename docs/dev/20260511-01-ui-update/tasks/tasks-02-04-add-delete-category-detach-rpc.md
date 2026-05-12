# Task 02-04: delete_category_detach_epics RPC 작성

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-04 |
| 상태 | 대기중 |
| 의존성 | 02-02, 02-03 완료 필요 |

## 작업 목표

분류 삭제 시 연결 Epic 의 `category_id` 를 null 로 바꾸고 category row 를 삭제하는 흐름을 하나의 트랜잭션으로 보장하는 RPC 를 작성한다. 삭제 의미는 Epic/Sub 삭제가 아니라 detach 로 고정한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `supabase/migrations/{next}_delete_category_detach_epics_rpc.sql` | 신규 생성 - RPC function 정의 및 권한 설정 |
| `supabase/migrations/{next}_category_nullable_set_null.sql` | 확인 - nullable FK 정책과 RPC 순서 정합 확인 |

### 구현 세부사항

1. **RPC 계약 정의**
   - 함수명은 `delete_category_detach_epics(category_id uuid)` 를 우선 사용한다.
   - 대상 category 가 `auth.uid()` 소유인지 먼저 검증한다.
   - 연결 `epic_issue.category_id` 를 null 로 update 한 뒤 category row 를 delete 한다.

2. **권한과 보안**
   - 필요 시 `SECURITY DEFINER` 로 작성하되 `search_path` 를 명시한다.
   - update/delete 모두 본인 row 에만 적용되도록 `user_id = auth.uid()` 조건을 포함한다.
   - 잘못된 category id 또는 타 사용자 category 는 no-op 또는 명확한 error 정책 중 하나로 고정한다.

3. **원자성 보장**
   - update 와 delete 가 하나의 함수 실행 안에서 완료되도록 한다.
   - 중간 실패 시 category 만 삭제되거나 Epic 참조가 깨지는 상태를 만들지 않는다.

### 참조 코드

- `supabase/migrations/001_initial_schema.sql`: RLS, category/epic_issue column 구조
- `packages/core/src/__tests__/rpc.test.ts`: RPC 테스트 패턴
- `docs/dev/20260511-01-ui-update/sub-prd-02-feat-category-management.md`: RPC 필요 조건

## 검증 과정

- [ ] RPC 가 연결 Epic 을 삭제하지 않고 `category_id = null` 로 변경한다.
- [ ] RPC 실행 후 category row 만 삭제된다.
- [ ] 타 사용자 category/epic row 에 영향을 주지 않는다.
- [ ] "분류 없음" category row 를 생성하지 않는다.

## 주의사항

- DB FK 가 `on delete set null` 이더라도 RPC 는 명시적 detach 정책과 권한 검증을 제공해야 한다.
- `SECURITY DEFINER` 사용 시 권한 상승 범위와 search_path 를 반드시 제한한다.
- 클라이언트 다중 호출보다 RPC 를 우선 사용하되, 서비스 레이어에서 fallback 정책이 필요하면 별도 명시한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
