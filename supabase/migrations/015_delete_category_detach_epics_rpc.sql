-- 015_delete_category_detach_epics_rpc.sql
-- Explicit user action for deleting a category while preserving connected Epic/Sub rows.

create or replace function public.delete_category_detach_epics(p_category_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if auth.uid() is null then
    raise exception 'delete_category_detach_epics requires an authenticated user'
      using errcode = '28000';
  end if;

  select c.user_id
    into v_user_id
    from public.category c
   where c.id = p_category_id;

  if v_user_id is null then
    raise exception 'category not found'
      using errcode = 'P0002';
  end if;

  if v_user_id <> auth.uid() then
    raise exception 'category does not belong to current user'
      using errcode = '42501';
  end if;

  update public.epic_issue
     set category_id = null
   where category_id = p_category_id
     and user_id = auth.uid();

  delete from public.category
   where id = p_category_id
     and user_id = auth.uid();
end;
$$;

revoke all on function public.delete_category_detach_epics(uuid) from public;
grant execute on function public.delete_category_detach_epics(uuid) to authenticated;

comment on function public.delete_category_detach_epics(uuid) is
  'Detach current user Epic rows from a category, then delete only that category row.';
