# TASK-10-02: DB 마이그레이션 — `priority` 컬럼 epic_issue 이전

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-02
- **상태**: 완료 (2026-05-07)
- **의존성**: 없음 (DB 블록의 가장 선행)

## 작업 목표

sub-prd-10 §1 — `priority` 의미 단위를 sub_issue 에서 epic_issue 로 이전한다. 마이그레이션 013 신설 + `make sb-reset` 적용 + seed.sql 검증.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `supabase/migrations/013_move_priority_to_epic_issue.sql` | 신설 | epic_issue.priority 추가 + sub_issue.priority 제거 |
| `supabase/seed.sql` | 수정 (있을 경우) | sub_issue 시드의 priority 참조 제거 + epic_issue 시드에 priority 추가 |

### 마이그레이션 본문

```sql
ALTER TABLE epic_issue ADD COLUMN priority priority NOT NULL DEFAULT 'medium';
ALTER TABLE sub_issue DROP COLUMN priority;
COMMENT ON COLUMN epic_issue.priority IS 'Epic 단위 priority. Sub 는 부모 Epic priority 를 상속.';
```

> 인덱스 신설 없음 — sub-prd-10 §1 — 현재 정렬·필터 요구사항 부재. 후속 sub 에서 정렬 도입 시 검토.

### seed.sql 갱신 절차

1. `grep "sub_issue.*priority" supabase/seed.sql` — 매치 0 또는 INSERT row 의 priority 컬럼·값 제거
2. `grep "epic_issue.*INSERT" supabase/seed.sql` — 기존 INSERT 에 priority 컬럼 / 값 추가 (모두 `'medium'` default 또는 다양화)
3. `make sb-reset` 으로 시드 재적용 시 에러 0 확인

### 적용 / 회귀 검증

- 로컬: `make sb-reset` (또는 `supabase db reset`) 으로 마이그레이션 013 까지 적용
- `supabase db diff` schema drift 0
- `psql` 로 `\d epic_issue` / `\d sub_issue` 출력해 priority 컬럼 위치 확인
- 기존 sub_issue priority 값은 의도된 폐기 (사용자 결정 §1) — 별도 백업 컬럼 미신설

## 검증 과정

- [x] `013_move_priority_to_epic_issue.sql` 신설
- [x] `ALTER TABLE epic_issue ADD COLUMN priority` + `ALTER TABLE sub_issue DROP COLUMN priority` 두 statement 포함
- [x] 컬럼 COMMENT 가 의미 (Epic 단위, Sub 상속) 명시
- [x] `supabase/seed.sql` 의 sub_issue priority 참조 0건 + epic_issue 시드에 priority 채움
- [x] `make sb-reset` 성공 + `supabase db diff` drift 0
- [x] `\d epic_issue` 출력에 priority 컬럼 존재 / `\d sub_issue` 에는 부재

## 주의사항

1. **머지 순서 강제**: sub-prd-10 §주의사항 2 — 013 → types regen → core domain → service → ui → web → mobile. 순서 깨지면 build 광범위 실패.
2. **atomic 묶음 필수**: 본 task (013 적용) + TASK-10-03 (types regen) + TASK-10-04 (core domain) 는 한 PR 로 묶어 머지 — 단계별 단독 머지 시 typecheck 실패. PR scope = `feat(db)` + 본문에 후속 task 함께 포함 명시.
3. **데이터 손실 명시**: 기존 sub_issue priority 값은 폐기 (사용자 결정 §1). PR 본문에 의도된 폐기 + 사유 명시.
4. **인덱스 미신설**: 검색용 인덱스 신설 안 함. 후속 sub 에서 정렬·필터 도입 시 검토.
5. **scope = feat(db)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §1 / §주의사항 2
- `supabase/migrations/001_initial_schema.sql` (sub_issue priority 컬럼 위치)
- `supabase/migrations/007_carry_over_semantic_change.sql` (RPC priority 의존 검증 대상 — TASK-10-30 회귀)
