# TASK-09-04: DB 마이그레이션 — `sub_issue.due_date` → `registered_date` rename

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 04
- **상태**: 대기중
- **의존성**: 없음 (DB 블록의 가장 선행)

## 작업 목표

sub-prd-09 §1 의 마이그레이션 004 를 작성·적용한다. `sub_issue.due_date` 컬럼 / 인덱스를 `registered_date` 명으로 rename. 기존 데이터 값 손실 0.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `supabase/migrations/004_rename_sub_issue_due_to_registered.sql` | 신설 | 컬럼 + 인덱스 rename |
| `supabase/seed.sql` | 수정 (있을 경우) | 시드 내 `due_date` 참조 → `registered_date` |

### 마이그레이션 본문

```sql
ALTER TABLE sub_issue RENAME COLUMN due_date TO registered_date;
ALTER INDEX idx_sub_issue_user_due_status RENAME TO idx_sub_issue_user_registered_status;
COMMENT ON COLUMN sub_issue.registered_date IS '그 날짜에 등록 / 이월된 sub. 마감일 의미 아님.';
```

> 컬럼 코멘트로 의미 변경을 SoT 에 명시.

### seed.sql 갱신

`supabase/seed.sql` 안에 `INSERT INTO sub_issue ... (due_date)` 또는 동등 표현 존재 시 `registered_date` 로 일괄 교체. 부재 시 변경 없음 — task 종료 시 grep 으로 확인.

### 적용 / 회귀 검증

- 로컬: `make sb-reset` 또는 `supabase db reset` 으로 마이그레이션 적용
- `supabase db diff` schema drift 0
- 기존 sub_issue row 의 `registered_date` 값이 이전 `due_date` 값과 동일한지 spot check

## 검증 과정

- [ ] `004_rename_sub_issue_due_to_registered.sql` 신설
- [ ] `ALTER TABLE` / `ALTER INDEX` 두 statement 모두 포함
- [ ] 컬럼 COMMENT 가 의미 변경을 SoT 로 명시
- [ ] `supabase/seed.sql` grep `due_date` 0건 (또는 사전부터 0)
- [ ] `make sb-reset` 성공 + `supabase db diff` drift 0
- [ ] 기존 row 의 값 손실 0 (spot check)
- [ ] 후속 task (05 / 07) 가 본 컬럼명을 참조 가능

## 주의사항

1. **머지 순서 강제**: 004 → 005 → 006. 단독 머지 시 005 의 RPC 가 본 컬럼을 참조하므로 회귀 위험. PR 분리 권장 (sub-prd-09 §위험 §완화).
2. **client 호출 일시 중단 검토**: 본 마이그레이션 머지 후 005 머지 전까지 003 의 carry-over RPC 가 일시적으로 broken — 호출 측 (client-side carry-over 호출) 영향 검토 (sub-prd-09 §주의사항 1).
3. **인덱스 rename 누락 방지**: 컬럼만 rename 하면 idx 명이 옛 명으로 남음 — 함께 rename.
4. **데이터 마이그레이션 X**: 본 task 는 `RENAME` 만. 값은 그대로 옮겨지므로 의미 변경은 PR 본문 / COMMENT 로만 표현.
5. **scope = db**: PR scope 는 `db` 또는 `feat(db)`.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §1 / §주의사항 1
- `supabase/migrations/001_initial_schema.sql`
- [`../API_CONTRACT.md`](../API_CONTRACT.md) (TASK-09-01 에서 갱신됨)
