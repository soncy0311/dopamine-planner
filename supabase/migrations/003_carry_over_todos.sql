-- 003_carry_over_todos.sql
-- 미완료 sub_issue 의 due_date 를 target_date 로 일괄 이월 (단일 트랜잭션).
-- Sub-PRD §RPC 작성 원칙 5개 준수:
--   ① security definer + search_path = public
--   ② 본문 첫 줄 auth.uid() null 검증 → unauthorized 예외
--   ③ WHERE 절에 auth.uid() 직접 명시 (본인 데이터만 조작)
--   ④ public/anon 권한 회수 + authenticated 만 execute 부여
--   ⑤ returns table(...) — 클라이언트 타입 추론
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
       set due_date = target_date,
           carry_over_count = carry_over_count + 1
     where user_id = auth.uid()
       and status <> 'done'
       and due_date < target_date
    returning id
  )
  select count(*) into cnt from moved;

  return query select cnt;
end;
$$;

revoke all on function public.carry_over_todos(date) from public, anon;
grant execute on function public.carry_over_todos(date) to authenticated;
