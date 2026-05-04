# Task 03-02: 스키마 + RLS 마이그레이션 (001 / 002)

## 작업 정보

- **Sub-PRD**: `sub-prd-03-feat-supabase-infra.md`
- **의존성**: 03-01 (`supabase/` 골격 존재)
- **대상 파일**:
  - `supabase/migrations/001_initial_schema.sql`
  - `supabase/migrations/002_rls_policies.sql`
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-03-feat-supabase-infra.md`, `docs/dev/20260502-02-todo-list-initialize/detail-todo-service-initialize.md` (§3 ERD — SoT), `docs/dev/20260502-02-todo-list-initialize/API_CONTRACT.md`

## 상태

- 2026-05-04: **완료** — `detail-todo-service-initialize.md` §3 ERD 갱신본 (epic_issue.user_id/progress, sub_issue.user_id/epic_id/due_date) 기반으로 두 마이그레이션 작성. 로컬 reset 검증은 03-04 에서 수행.

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `supabase/migrations/001_initial_schema.sql` 작성 — 4개 테이블 + RLS 활성화
- [x] `supabase/migrations/002_rls_policies.sql` 작성 — 테이블별 정책 (15건)

## 구현 세부사항

### 1. `001_initial_schema.sql` — 테이블 4개

작성 대상 테이블 (`detail-todo-service-initialize.md` §3 ERD 와 1:1 일치):

- `profile` — 사용자 프로필 (`id` = `auth.users.id`, `user_id` 또는 `id` 기준 self 정책)
- `category` — 카테고리. `user_id uuid not null references auth.users(id)`
- `epic_issue` — Epic. `user_id`, `category_id`, `progress numeric default 0`
- `sub_issue` — 서브 이슈(=todo). `user_id`, `epic_id`, `due_date date`, `status text` 등

각 테이블 공통:

- `id uuid primary key default gen_random_uuid()` (또는 `auth.users(id)` 직접 참조 — `profile`)
- `created_at timestamptz default now() not null`
- `updated_at timestamptz default now() not null`
- 마지막 줄: `alter table <name> enable row level security;`

`updated_at` 자동 갱신:

```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_<table>_updated_at
  before update on <table>
  for each row execute function public.set_updated_at();
```

> 칼럼명·타입·NOT NULL·CHECK 제약 등 세부는 detail §3 ERD 를 1:1 으로 따른다. ERD 와 mismatch 발견 시 ERD 우선 정렬 (Sub-PRD §주의사항 5).

### 2. `002_rls_policies.sql` — 테이블별 정책

Sub-PRD §2 의 표 그대로 (총 15개 정책 — `profile` DELETE 제외):

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profile` | self | self | self | — |
| `category` | self | self | self | self |
| `epic_issue` | self | self | self | self |
| `sub_issue` | self | self | self | self |

정책 작성 패턴:

```sql
-- profile: id = auth.uid() (profile.id = auth.users.id)
create policy "profile_select_self" on profile
  for select using (auth.uid() = id);
create policy "profile_insert_self" on profile
  for insert with check (auth.uid() = id);
create policy "profile_update_self" on profile
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- category / epic_issue / sub_issue: user_id = auth.uid()
create policy "category_select_self" on category
  for select using (auth.uid() = user_id);
create policy "category_insert_self" on category
  for insert with check (auth.uid() = user_id);
create policy "category_update_self" on category
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "category_delete_self" on category
  for delete using (auth.uid() = user_id);

-- epic_issue / sub_issue 동일 패턴 (user_id 기준)
```

> `epic_issue`, `sub_issue` 도 `user_id` 칼럼이 직접 존재하는 형태가 ERD 의 SoT. `category_id` / `epic_id` 경유 정책이 아닌, 자체 `user_id` 직접 비교를 사용 (Sub-PRD §2 — `auth.uid() = user_id` 기준).

## 주의사항

1. **칼럼명 SoT** — `detail-todo-service-initialize.md` §3 ERD 가 source of truth. 스키마 작성 중 mismatch 발견 시 detail 문서를 우선 갱신 후 마이그레이션에 반영 (Sub-PRD §주의사항 5)
2. **Dashboard 직접 수정 금지** — 모든 변경은 마이그레이션 파일로 (Sub-PRD §주의사항 1)
3. **순서 보장** — 002(RLS) 는 003·004(RPC) 보다 반드시 먼저. `auth.uid()` 검증이 의미를 가지려면 RLS 가 선행 (Sub-PRD §마이그레이션 순서)
4. **enable row level security 누락 금지** — 4개 테이블 모두 활성화. 활성화 없이 정책만 작성하면 정책이 적용되지 않음
5. **`profile` DELETE 정책 미작성** — Sub-PRD §2 표상 DELETE 가 `—` 이므로 `profile_delete_*` 정책은 작성하지 않는다
6. **로컬 검증은 03-04 에서 일괄** — 본 task 에서는 SQL 작성만, 실제 `supabase db reset` 은 03-04

## 검증 체크리스트

- [x] `ls supabase/migrations/001_initial_schema.sql supabase/migrations/002_rls_policies.sql` — 두 파일 모두 존재
- [x] `grep -c "create table" supabase/migrations/001_initial_schema.sql` — 4건
- [x] `grep -c "enable row level security" supabase/migrations/001_initial_schema.sql` — 4건
- [x] `grep -c "create policy" supabase/migrations/002_rls_policies.sql` — 15건
- [x] `grep -c "auth.uid()" supabase/migrations/002_rls_policies.sql` — 20건 (≥15)
- [x] `grep -n "profile_delete" supabase/migrations/002_rls_policies.sql` — 0건
