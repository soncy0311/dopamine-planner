-- 014_category_nullable_set_null.sql
-- Category deletion must detach Epic rows instead of deleting Epic/Sub data.

drop trigger if exists trg_purge_orphan_after_epic_delete on public.epic_issue;
drop function if exists public.purge_orphan_categories();

alter table public.epic_issue
  add column if not exists workspace workspace;

update public.epic_issue e
   set workspace = c.workspace
  from public.category c
 where e.category_id = c.id
   and e.workspace is null;

alter table public.epic_issue
  alter column workspace set not null;

create index if not exists idx_epic_issue_user_workspace
  on public.epic_issue(user_id, workspace);

alter table public.epic_issue
  drop constraint if exists epic_issue_category_id_fkey;

alter table public.epic_issue
  alter column category_id drop not null;

alter table public.epic_issue
  add constraint epic_issue_category_id_fkey
  foreign key (category_id)
  references public.category(id)
  on delete set null;

comment on column public.epic_issue.workspace is
  'Denormalized workspace used to keep uncategorized Epic rows scoped after category detach.';
