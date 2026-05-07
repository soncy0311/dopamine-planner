# TASK-09-05: DB 마이그레이션 — `carry_over_todos` RPC 의미 변경

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 05
- **상태**: 대기중
- **의존성**: TASK-09-04 (컬럼 rename 머지 후)

## 작업 목표

sub-prd-09 §1 의 마이그레이션 005 를 작성·적용한다. `carry_over_todos(target_date)` RPC 본문을 새 컬럼명 + 의미로 재정의한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `supabase/migrations/005_carry_over_semantic_change.sql` | 신설 | RPC 본문 재정의 |

### 마이그레이션 본문

```sql
CREATE OR REPLACE FUNCTION carry_over_todos(target_date date)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE sub_issue
     SET registered_date = target_date,
         carry_over_count = carry_over_count + 1
   WHERE user_id = auth.uid()
     AND registered_date < target_date
     AND status <> 'done';

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;
```

> `SECURITY DEFINER` 유지 + `auth.uid()` 로 RLS scoping. 003 의 시그니처 / 반환 타입과 호환.

### 호환성 검토

- 입력 / 반환 시그니처 불변 → 호출 측 (`packages/core` 의 `useCarryOverTodos`) 변경 0
- 의미만 변경 — `registered_date < target_date AND status<>'done'` row 의 `registered_date` 를 `target_date` 로 갱신. carry_over_count++ 그대로

### 적용 / 회귀 검증

- 로컬: `make sb-reset` → 시드 데이터로 RPC 호출 → affected count 검증
- 다른 user 의 row 가 영향 받지 않는지 (RLS scoping) 확인 — 시드에 2 user 분 데이터 추가 권장

## 검증 과정

- [ ] `005_carry_over_semantic_change.sql` 신설
- [ ] RPC 본문이 `registered_date` 를 사용하고 `due_date` 참조 0건
- [ ] `SECURITY DEFINER` + `auth.uid()` RLS scoping 유지
- [ ] `carry_over_count + 1` 동작 그대로
- [ ] 시그니처 (`target_date date`, `RETURNS integer`) 불변 — 호출 측 영향 0
- [ ] `make sb-reset` 성공 + RPC 호출 spot check
- [ ] 다른 user row 영향 0 확인

## 주의사항

1. **머지 순서**: 04 머지 후 진행. 04 가 미머지 상태에서 본 task 머지 시 SQL 컴파일 실패.
2. **client 호출 영향**: 003 의 carry-over RPC 호출 측 (client-side `useCarryOverTodos`) 가 본 task 머지 전·후로 동작 변화 — 본문 의미가 다름. 호출 측 코드 변경 0이지만 동작 의미는 변경됨을 PR 본문에 명시.
3. **RLS 검증 필수**: trigger 가 아닌 RPC 이지만 SECURITY DEFINER 이므로 `auth.uid()` 누락 시 다른 user 의 row 도 갱신 가능. 본 task 의 가장 큰 리스크.
4. **scope = db**: PR scope 는 `db`.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §1
- `supabase/migrations/003_carry_over_todos.sql`
- [`./tasks-09-04-db-rename-due-to-registered.md`](./tasks-09-04-db-rename-due-to-registered.md)
