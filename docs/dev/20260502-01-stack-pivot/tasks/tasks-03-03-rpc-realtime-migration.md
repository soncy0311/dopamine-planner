# Task 03-03: RPC 2종 + Realtime publication (003 / 004 / 005)

## 작업 정보

- **Sub-PRD**: `sub-prd-03-feat-supabase-infra.md`
- **의존성**: 03-02 (테이블 + RLS 적용 완료)
- **대상 파일**:
  - `supabase/migrations/003_carry_over_todos.sql`
  - `supabase/migrations/004_recalc_epic_progress.sql`
  - `supabase/migrations/005_realtime_publication.sql`
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-03-feat-supabase-infra.md`, `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md` (§3 ERD), `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md` (§4 RPC)

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `supabase/migrations/003_carry_over_todos.sql` 작성 — RPC 함수
- [ ] `supabase/migrations/004_recalc_epic_progress.sql` 작성 — RPC 함수
- [ ] `supabase/migrations/005_realtime_publication.sql` 작성 — publication 등록

## 구현 세부사항

### 1. `003_carry_over_todos.sql`

Sub-PRD §핵심 구현 로직 코드 그대로 (1:1 복제):

```sql
create or replace function carry_over_todos(target_date date)
returns table(moved_count integer)
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cnt integer;
begin
  if uid is null then
    raise exception 'unauthorized';
  end if;
  with moved as (
    update sub_issue
       set due_date = target_date
     where user_id = uid
       and status <> 'done'
       and due_date < target_date
    returning id
  )
  select count(*) into cnt from moved;
  return query select cnt;
end;
$$;

revoke all on function carry_over_todos(date) from public, anon;
grant execute on function carry_over_todos(date) to authenticated;
```

### 2. `004_recalc_epic_progress.sql`

Sub-PRD §핵심 구현 로직 코드 그대로 (1:1 복제):

```sql
create or replace function recalc_epic_progress(epic_id uuid)
returns table(progress numeric)
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  total integer;
  done integer;
  pct numeric;
begin
  if uid is null then
    raise exception 'unauthorized';
  end if;
  select count(*) filter (where true), count(*) filter (where status = 'done')
    into total, done
    from sub_issue
   where user_id = uid and epic_id = recalc_epic_progress.epic_id;
  pct := case when total = 0 then 0 else (done::numeric / total::numeric) end;
  update epic_issue set progress = pct where id = recalc_epic_progress.epic_id and user_id = uid;
  return query select pct;
end;
$$;

revoke all on function recalc_epic_progress(uuid) from public, anon;
grant execute on function recalc_epic_progress(uuid) to authenticated;
```

### 3. `005_realtime_publication.sql`

```sql
-- publication 미존재 시 생성
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table profile, category, epic_issue, sub_issue;
```

> Supabase Cloud 환경은 `supabase_realtime` publication 이 기본 존재하지만, 로컬 `supabase db reset` 컨텍스트에서도 안전하도록 존재 검사 후 생성 분기를 둔다.

## 주의사항

1. **RPC 작성 원칙 5개 준수** (Sub-PRD §RPC 작성 원칙 / detail §5.2):
   1. `language plpgsql security definer set search_path = public`
   2. 본문 첫 줄 `if auth.uid() is null then raise exception 'unauthorized'; end if;`
   3. WHERE 절에 `auth.uid()` 명시 — 본인 데이터만 조작
   4. `revoke all … from public, anon;` + `grant execute … to authenticated;`
   5. 반환 타입 `returns table(...)` — 타입 추론을 위해
2. **본문 코드 1:1 복제** — Sub-PRD 코드 블록을 그대로 옮긴다. 임의 칼럼명 변경 / 로직 변경 금지
3. **칼럼명 mismatch** — `epic_id`, `target_date`, `status`, `due_date`, `user_id` 가 detail §3 ERD 와 일치해야 함. mismatch 시 detail 문서 우선 정렬 (Sub-PRD §주의사항 5)
4. **순서 보장** — 005(realtime) 는 마지막. 002(RLS) 후 003·004(RPC) → 005(publication) (Sub-PRD §마이그레이션 순서)
5. **로컬 검증은 03-04 에서 일괄** — 본 task 에서는 SQL 작성만

## 검증 체크리스트

- [ ] `ls supabase/migrations/003_carry_over_todos.sql supabase/migrations/004_recalc_epic_progress.sql supabase/migrations/005_realtime_publication.sql` — 3개 파일 존재
- [ ] `grep -l "security definer" supabase/migrations/003_carry_over_todos.sql supabase/migrations/004_recalc_epic_progress.sql` — 양쪽 매치
- [ ] `grep -c "auth.uid()" supabase/migrations/003_carry_over_todos.sql` — 2건 이상 (`uid := auth.uid()` + WHERE)
- [ ] `grep -c "auth.uid()" supabase/migrations/004_recalc_epic_progress.sql` — 2건 이상
- [ ] `grep -l "raise exception 'unauthorized'" supabase/migrations/003_carry_over_todos.sql supabase/migrations/004_recalc_epic_progress.sql` — 양쪽 매치
- [ ] `grep -l "grant execute" supabase/migrations/003_carry_over_todos.sql supabase/migrations/004_recalc_epic_progress.sql` — 양쪽 매치
- [ ] `grep -l "revoke all" supabase/migrations/003_carry_over_todos.sql supabase/migrations/004_recalc_epic_progress.sql` — 양쪽 매치
- [ ] `grep -n "add table" supabase/migrations/005_realtime_publication.sql` 결과 1줄에 `profile`, `category`, `epic_issue`, `sub_issue` 4개 모두 포함
