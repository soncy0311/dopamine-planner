# Task 02-03: orphan category trigger 검토 및 수정

## 기본 정보

| 항목 | 내용 |
|---|---|
| Sub-PRD | [`sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md) |
| 작업 번호 | 02-03 |
| 상태 | 완료 |
| 의존성 | 02-01 완료 필요 |

## 작업 목표

기존 orphan category trigger/function 이 `category_id = null` 정책, category 수정/삭제, Epic detach 흐름과 충돌하지 않도록 검토하고 필요하면 수정 또는 폐기 migration 을 작성한다.

## 상세 구현 내용

### 대상 파일

| 파일 경로 | 작업 |
|---|---|
| `supabase/migrations/008_purge_orphan_categories.sql` | 확인 - 기존 orphan category 정리 로직 분석 |
| `supabase/migrations/{next}_category_nullable_set_null.sql` | 수정/연계 - 02-02 migration 과 같은 변경 단위에 포함할지 판단 |
| `supabase/migrations/{next}_review_orphan_category_trigger.sql` | 필요 시 신규 생성 - trigger/function 수정 또는 제거 |

### 구현 세부사항

1. **충돌 조건 정의**
   - Epic 의 category 를 null 로 바꾸는 update 가 orphan trigger 를 실행하는지 확인한다.
   - category 삭제 detach 흐름에서 trigger 가 사용자 의도와 다르게 category 를 삭제하는지 확인한다.

2. **수정 방향 결정**
   - 새 정책과 무관하면 유지한다.
   - `category_id = null` 전환과 충돌하면 trigger 조건을 수정하거나 제거한다.
   - 제거 시 기존 기능 영향과 대체 cleanup 책임을 문서화한다.

3. **권한과 RLS 정합 확인**
   - trigger/function 이 security definer 를 쓰는 경우 search_path 와 사용자 row 제한을 확인한다.
   - 본인 category 외 row 에 영향을 주지 않도록 조건을 점검한다.

### 참조 코드

- `supabase/migrations/008_purge_orphan_categories.sql`: 검토 대상 trigger/function
- `supabase/migrations/001_initial_schema.sql`: category, epic_issue 관계 정의

## 검증 과정

- [x] orphan category trigger 의 유지/수정/폐기 결정이 명확하다.
- [x] Epic category detach 가 의도치 않은 Epic/Sub/category 삭제를 유발하지 않는다.
- [x] trigger/function 변경이 사용자 본인 row 범위를 벗어나지 않는다.
- [x] migration reset 시 trigger/function 생성 순서가 깨지지 않는다.

## 주의사항

- category 삭제는 명시적 사용자 액션 또는 RPC 흐름에서만 일어나야 한다.
- `category_id = null` Epic 을 orphan category row 로 보정하려 하면 안 된다.
- trigger 변경은 DB 정책 변경이므로 02-02 migration 과 순서 충돌이 없어야 한다.

## 관련 문서

- [`../main-prd-ui-update.md`](../main-prd-ui-update.md)
- [`../sub-prd-02-feat-category-management.md`](../sub-prd-02-feat-category-management.md)
