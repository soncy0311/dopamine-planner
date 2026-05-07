-- ────────────────────────────────────────────────────────────────────────────
-- category 중복 방지: (user_id, workspace, lower(name)) 유니크 인덱스
-- ────────────────────────────────────────────────────────────────────────────
-- UI (CategoryComboboxCreate) 의 case-insensitive exact-match 와 일치시킨다.
-- 기존 중복 row 는 가장 오래된 것을 canonical 로 두고 epic_issue.category_id
-- 를 canonical 로 재배치한 뒤 나머지를 제거한다.
-- ────────────────────────────────────────────────────────────────────────────

-- Step 1: epic_issue.category_id 를 canonical 로 재배치
update public.epic_issue e
set category_id = canon.canonical_id
from public.category c,
  lateral (
    select id as canonical_id
    from public.category c2
    where c2.user_id = c.user_id
      and c2.workspace = c.workspace
      and lower(c2.name) = lower(c.name)
    order by c2.created_at, c2.id
    limit 1
  ) canon
where e.category_id = c.id
  and c.id <> canon.canonical_id;

-- Step 2: canonical 이 아닌 중복 row 삭제
delete from public.category c
where exists (
  select 1
  from public.category c2
  where c2.user_id = c.user_id
    and c2.workspace = c.workspace
    and lower(c2.name) = lower(c.name)
    and (c2.created_at, c2.id) < (c.created_at, c.id)
);

-- Step 3: 유니크 인덱스 (case-insensitive)
create unique index if not exists category_user_workspace_name_unique
  on public.category (user_id, workspace, lower(name));

comment on index public.category_user_workspace_name_unique is
  '같은 사용자 · workspace 안에서 분류 이름 중복 방지 (case-insensitive).';
