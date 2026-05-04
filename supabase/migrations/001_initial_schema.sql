-- 001_initial_schema.sql
-- detail-todo-service-initialize.md §3 ERD 1:1 반영 (2026-05-04 갱신본).
-- 4개 테이블 + enum + updated_at 트리거 + RLS 활성화.

-- gen_random_uuid()
create extension if not exists pgcrypto;

-- ────────────────────────────────────────
-- enums
-- ────────────────────────────────────────
create type workspace as enum ('life', 'work');
create type priority as enum ('high', 'medium', 'low');
create type todo_status as enum ('todo', 'done');
create type epic_status as enum ('active', 'completed', 'archived');

-- ────────────────────────────────────────
-- updated_at 자동 갱신 함수
-- ────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ────────────────────────────────────────
-- profile (auth.users 1:1)
-- ────────────────────────────────────────
create table public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profile_updated_at
  before update on public.profile
  for each row execute function public.set_updated_at();

alter table public.profile enable row level security;

-- ────────────────────────────────────────
-- category
-- ────────────────────────────────────────
create table public.category (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace workspace not null,
  name text not null,
  color text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_category_user_id on public.category(user_id);
create index idx_category_user_workspace on public.category(user_id, workspace);

create trigger trg_category_updated_at
  before update on public.category
  for each row execute function public.set_updated_at();

alter table public.category enable row level security;

-- ────────────────────────────────────────
-- epic_issue
-- user_id 비정규화 보유 (RLS JOIN 회피 — detail §3.3)
-- progress 칼럼은 recalc_epic_progress RPC 가 갱신
-- ────────────────────────────────────────
create table public.epic_issue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.category(id) on delete cascade,
  title text not null,
  description text,
  status epic_status not null default 'active',
  registered_date date,
  completed_date date,
  progress numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_epic_issue_user_id on public.epic_issue(user_id);
create index idx_epic_issue_category_id on public.epic_issue(category_id);

create trigger trg_epic_issue_updated_at
  before update on public.epic_issue
  for each row execute function public.set_updated_at();

alter table public.epic_issue enable row level security;

-- ────────────────────────────────────────
-- sub_issue
-- user_id 비정규화 보유 (RLS JOIN 회피)
-- epic_id (단축형) — RPC SQL 정합
-- due_date — carry_over_todos 가 이동시키는 칼럼
-- ────────────────────────────────────────
create table public.sub_issue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  epic_id uuid not null references public.epic_issue(id) on delete cascade,
  title text not null,
  description text,
  priority priority not null default 'medium',
  status todo_status not null default 'todo',
  due_date date,
  completed_date date,
  carry_over_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_sub_issue_user_id on public.sub_issue(user_id);
create index idx_sub_issue_epic_id on public.sub_issue(epic_id);
create index idx_sub_issue_user_due_status on public.sub_issue(user_id, due_date, status);

create trigger trg_sub_issue_updated_at
  before update on public.sub_issue
  for each row execute function public.set_updated_at();

alter table public.sub_issue enable row level security;
