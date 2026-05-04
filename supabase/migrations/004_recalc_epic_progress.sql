-- 004_recalc_epic_progress.sql
-- epic_issue 의 progress 칼럼을 자식 sub_issue 의 done 비율로 재계산.
-- Sub-PRD §RPC 작성 원칙 5개 준수 (003 과 동일).
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
         count(*) filter (where status = 'done')
    into total, done
    from sub_issue
   where user_id = auth.uid()
     and epic_id = recalc_epic_progress.epic_id;

  pct := case when total = 0 then 0 else (done::numeric / total::numeric) end;

  update epic_issue
     set progress = pct
   where id = recalc_epic_progress.epic_id
     and user_id = auth.uid();

  return query select pct;
end;
$$;

revoke all on function public.recalc_epic_progress(uuid) from public, anon;
grant execute on function public.recalc_epic_progress(uuid) to authenticated;
