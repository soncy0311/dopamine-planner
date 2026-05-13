# Task 02-02: category nullable 및 on delete set null migration 작성

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-02 |
| 상태 | 완료 |
| 의존성 | 02-01 완료 필요 |

## 작업 목표

`epic_issue.category_id` 를 nullable 로 전환하고 category FK 를 `on delete set null` 정책으로 변경하는 Supabase migration 을 작성한다. 분류 삭제 후 연결 Epic/Sub 가 삭제되지 않고 Epic 의 category 만 비워지는 DB 계약을 만든다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `supabase/migrations/{next}_category_nullable_set_null.sql` | 신규 생성 - `category_id` nullable 및 FK delete action 전환 |
| `supabase/migrations/001_initial_schema.sql` | 확인 - 기존 constraint 정의와 migration 적용 순서 검증 |

### 구현 세부사항

1. **FK 재정의**
   - 02-01 에서 확인한 실제 constraint 명을 사용해 기존 category FK 를 제거한다.
   - `epic_issue.category_id` 에서 `not null` 제약을 제거한다.
   - FK 를 `references public.category(id) on delete set null` 로 재생성한다.

2. **기존 데이터 보존**
   - 기존 Epic row 의 `category_id` 값은 유지한다.
   - migration 은 category row 또는 epic/sub row 를 삭제하지 않는다.

3. **idempotent 적용성 검토**
   - Supabase local reset 에서 migration 이 순서대로 재적용될 수 있게 작성한다.
   - constraint 이름 충돌, 이미 제거된 constraint 처리 등 반복 적용 리스크를 점검한다.

### 참조 코드

- `supabase/migrations/001_initial_schema.sql`: 기존 schema 정의
- `docs/dev/20260511-01-ui-update/sub-prd-02-feat-category-management.md`: migration 방향 예시

## 검증 과정

- [x] migration 적용 후 `epic_issue.category_id` 가 nullable 이다.
- [x] category FK delete action 이 `set null` 이다.
- [x] category 삭제가 연결 Epic/Sub 삭제로 이어지지 않는 schema 가 된다.
- [x] "분류 없음"은 `category_id = null` 로만 표현되고 별도 category row 를 만들지 않는다.

## 주의사항

- 데이터 손실 방지를 최우선으로 한다.
- category FK 를 `on delete cascade` 로 되돌리거나 유지하면 안 된다.
- 실제 타입 생성은 02-05 에서 처리한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
