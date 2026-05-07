# TASK-09-06: DB 마이그레이션 — 분류 자동 삭제 trigger

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 06
- **상태**: 대기중
- **의존성**: 없음 (04 / 05 와 독립 — 컬럼 rename 무관)

## 작업 목표

sub-prd-09 §1 / §6 의 마이그레이션 006 을 작성·적용한다. 분류 직접 관리 UI 삭제 정책에 맞춰, 마지막 참조 sub / epic 삭제 시 분류 row 도 자동 삭제하는 trigger 를 도입한다 (옵션 A).

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `supabase/migrations/006_purge_orphan_categories.sql` | 신설 | trigger function + AFTER DELETE trigger 2개 |

### 마이그레이션 본문 (개략)

```sql
CREATE OR REPLACE FUNCTION purge_orphan_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.category_id IS NULL THEN
    RETURN OLD;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM epic_issue
     WHERE category_id = OLD.category_id AND user_id = OLD.user_id
  ) AND NOT EXISTS (
    SELECT 1 FROM sub_issue
     WHERE category_id = OLD.category_id AND user_id = OLD.user_id
  ) THEN
    DELETE FROM category
     WHERE id = OLD.category_id AND user_id = OLD.user_id;
  END IF;

  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_purge_orphan_after_epic_delete
AFTER DELETE ON epic_issue
FOR EACH ROW EXECUTE FUNCTION purge_orphan_categories();

CREATE TRIGGER trg_purge_orphan_after_sub_delete
AFTER DELETE ON sub_issue
FOR EACH ROW EXECUTE FUNCTION purge_orphan_categories();

COMMENT ON FUNCTION purge_orphan_categories() IS '옵션 A 채택: 호출 측 단순성 + cascade 케이스 누락 위험 회피 (sub-prd-09 §1)';
```

> `user_id` 스코프 — 다른 user 분류 영향 0. RLS 와 충돌 회피.

### 회귀 시나리오 (로컬 supabase 환경)

1. epic 단독 삭제 → 해당 분류에 다른 sub 없음 → 분류 자동 삭제
2. sub 단독 삭제 → 해당 분류에 epic / 다른 sub 없음 → 분류 자동 삭제
3. epic 삭제 (cascade 로 sub 들 함께 삭제) → 마지막 sub 삭제 시점에 분류 자동 삭제
4. bulk 삭제 (다수 epic 동시 삭제) → 트랜잭션 종료 후 일관된 결과
5. 다른 user 의 epic 삭제 → 본인 분류 영향 0

### 적용 / 회귀 검증

- `make sb-reset` 후 위 5 시나리오 spot check
- `supabase db diff` schema drift 0

## 검증 과정

- [ ] `006_purge_orphan_categories.sql` 신설
- [ ] trigger function 본문이 `user_id` 스코프 포함
- [ ] AFTER DELETE trigger 2개 (epic_issue / sub_issue) 모두 등록
- [ ] 옵션 A 채택 사유 COMMENT 명시
- [ ] 5 회귀 시나리오 모두 spot check 통과
- [ ] 다른 user row 영향 0 (RLS scoping)
- [ ] `make sb-reset` 성공 + drift 0

## 주의사항

1. **RLS 충돌**: trigger function 이 `SECURITY DEFINER` 인 한 RLS 우회 가능 — `user_id` 명시 필수. 누락 시 다른 user 의 분류도 삭제 가능 (sub-prd-09 §주의사항 3).
2. **cascade 케이스**: epic 삭제 → sub_issue cascade 삭제 시 sub trigger 가 행 단위로 호출되어 마지막 sub 삭제 시점에만 분류 삭제. 동시성 / 트랜잭션 경계 검증 필수.
3. **bulk 삭제 성능**: trigger 가 행 단위 호출이므로 N x EXISTS 쿼리. category_id 인덱스 정합 확인 (`idx_*_category_id` 존재 여부).
4. **머지 순서 독립**: 04 / 05 와 독립 — 단독 머지 가능. 다만 sub-prd-09 §주의사항 1 의 "004 → 005 → 006" 권장 순서는 PR 단위 묶음 시 따른다.
5. **scope = db**: PR scope 는 `db`.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §1 / §6 / §주의사항 3
- `supabase/migrations/001_initial_schema.sql`
