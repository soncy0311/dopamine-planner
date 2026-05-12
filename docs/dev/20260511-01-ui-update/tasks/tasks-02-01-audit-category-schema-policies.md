# Task 02-01: category schema/policy 현황 감사

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-01 |
| 상태 | 대기중 |
| 의존성 | 없음 |

## 작업 목표

현재 `epic_issue.category_id` 의 constraint, trigger, index, RLS 정책을 확인해 분류 삭제가 Epic/Sub 삭제로 이어질 수 있는 지점을 명확히 기록한다. 후속 migration 과 RPC 작업이 실제 스키마 이름과 정책에 맞게 작성될 수 있도록 DB 변경 기준을 확정한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `supabase/migrations/001_initial_schema.sql` | 확인 - `epic_issue.category_id` 정의, FK, RLS, index 확인 |
| `supabase/migrations/008_purge_orphan_categories.sql` | 확인 - orphan category trigger/function 동작 확인 |
| `docs/dev/20260511-01-ui-update/sub-prd-02-feat-category-management.md` | 필요 시 수정 - 감사 결과로 변경된 constraint/trigger 명 반영 |

### 구현 세부사항

1. **현재 FK 정책 확인**
   - `epic_issue.category_id` 가 `not null` 인지 확인한다.
   - category FK 의 constraint 명과 `on delete cascade` 여부를 확인한다.
   - Sub 는 Epic 을 통해 분류를 상속한다는 전제를 깨는 별도 category FK 가 있는지 확인한다.

2. **trigger/function 영향 확인**
   - `008_purge_orphan_categories.sql` 의 orphan category 정리 trigger 가 null category 정책과 충돌하는지 검토한다.
   - category delete 또는 epic category detach 후 의도치 않은 category 삭제가 발생하는지 확인한다.

3. **RLS와 index 확인**
   - category, epic_issue 변경 정책이 사용자 본인 row 로 제한되는지 확인한다.
   - `category_id = null` 조회와 category별 조회에 필요한 index가 기존에 있는지 확인한다.

### 참조 코드

- `supabase/migrations/001_initial_schema.sql`: 초기 schema, FK, RLS 정책 확인
- `supabase/migrations/008_purge_orphan_categories.sql`: orphan category trigger 확인
- `docs/dev/20260511-01-ui-update/main-prd-ui-update.md`: 분류 삭제 정책의 상위 요구사항

## 검증 과정

- [ ] 실제 `epic_issue.category_id` constraint 명이 확인되어 후속 migration 에 사용할 수 있다.
- [ ] `category_id` 의 현재 nullability 와 delete action 이 문서화되어 있다.
- [ ] orphan category trigger/function 의 유지, 수정, 폐기 판단 근거가 정리되어 있다.
- [ ] category/epic RLS 정책이 삭제 detach 흐름에서 필요한 권한 조건을 충족하는지 확인했다.

## 주의사항

- 이 작업은 감사 작업이며 schema 를 변경하지 않는다.
- 분류 삭제는 Epic/Sub 삭제가 아니라 detach 라는 정책을 기준으로 판단한다.
- "분류 없음" row 를 만들거나 seed 하는 방향으로 해석하지 않는다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
