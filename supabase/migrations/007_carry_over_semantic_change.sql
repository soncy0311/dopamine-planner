-- 007_carry_over_semantic_change.sql
-- sub-prd-09 §1 — carry_over_todos RPC 본문을 새 컬럼명·의미로 재정의.
-- 시그니처/반환 타입은 003 과 동일. 호출 측 영향 0.

create or replace function public.carry_over_todos(target_date date)
returns table(moved_count integer)
language plpgsql security definer set search_path = public
as $$
declare
  cnt integer;
begin
  if auth.uid() is null then
    raise exception 'unauthorized';
  end if;

  with moved as (
    update sub_issue
       set registered_date = target_date,
           carry_over_count = carry_over_count + 1
     where user_id = auth.uid()
       and status <> 'done'
       and registered_date < target_date
    returning id
  )
  select count(*) into cnt from moved;

  return query select cnt;
end;
$$;

revoke all on function public.carry_over_todos(date) from public, anon;
grant execute on function public.carry_over_todos(date) to authenticated;
