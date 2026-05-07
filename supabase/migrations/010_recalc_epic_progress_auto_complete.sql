-- 010_recalc_epic_progress_auto_complete.sql
-- 모든 sub_issue 가 done 일 때 epic_issue.status='completed' + completed_date 자동 갱신.
-- 한 건이라도 todo 로 되돌아가면 status='active' + completed_date=null 로 되돌린다.
-- 시그니처/반환 타입은 004/009 와 동일 (호출 측 영향 0).

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

  if pct >= 1 and total > 0 then
    update epic_issue
       set progress       = pct,
           status         = 'completed',
           completed_date = coalesce(epic_issue.completed_date, current_date)
     where epic_issue.id = recalc_epic_progress.epic_id
       and epic_issue.user_id = auth.uid();
  else
    update epic_issue
       set progress       = pct,
           status         = 'active',
           completed_date = null
     where epic_issue.id = recalc_epic_progress.epic_id
       and epic_issue.user_id = auth.uid();
  end if;

  return query select pct;
end;
$$;

revoke all on function public.recalc_epic_progress(uuid) from public, anon;
grant execute on function public.recalc_epic_progress(uuid) to authenticated;
