-- 009_fix_recalc_epic_progress_ambiguous.sql
-- 004 의 recalc_epic_progress 본문에서 파라미터 epic_id 가 sub_issue.epic_id 컬럼과
-- 충돌하여 PostgreSQL 42702 (ambiguous column) 에러 발생 → 컬럼을 테이블명으로 한정.

create or replace function public.recalc_epic_progress(epic_id uuid)
returns table(progress numeric)
language plpgsql security definer set search_path = public
as $$
declare
  total integer;
  done integer;
  pct numeric;
begin
  if auth.uid() is null then
    raise exception 'unauthorized';
  end if;

  select count(*) filter (where true),
         count(*) filter (where sub_issue.status = 'done')
    into total, done
    from sub_issue
   where sub_issue.user_id = auth.uid()
     and sub_issue.epic_id = recalc_epic_progress.epic_id;

  pct := case when total = 0 then 0 else (done::numeric / total::numeric) end;

  update epic_issue
     set progress = pct
   where epic_issue.id = recalc_epic_progress.epic_id
     and epic_issue.user_id = auth.uid();

  return query select pct;
end;
$$;

revoke all on function public.recalc_epic_progress(uuid) from public, anon;
grant execute on function public.recalc_epic_progress(uuid) to authenticated;
