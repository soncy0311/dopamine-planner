-- 008_purge_orphan_categories.sql
-- sub-prd-09 §1 / §6 — 분류 직접 관리 UI 폐기 정책에 맞춰 마지막 참조 issue 삭제 시
-- 분류 row 도 자동 삭제하는 trigger (옵션 A 채택).

create or replace function public.purge_orphan_categories()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if old.category_id is null then
    return old;
  end if;

  if not exists (
    select 1 from public.epic_issue
     where category_id = old.category_id
       and user_id = old.user_id
  ) and not exists (
    select 1 from public.sub_issue si
      join public.epic_issue ei on ei.id = si.epic_id
     where ei.category_id = old.category_id
       and si.user_id = old.user_id
  ) then
    delete from public.category
     where id = old.category_id
       and user_id = old.user_id;
  end if;

  return old;
end;
$$;

comment on function public.purge_orphan_categories() is
  '옵션 A 채택: 호출 측 단순성 + cascade 케이스 누락 위험 회피 (sub-prd-09 §1).';

drop trigger if exists trg_purge_orphan_after_epic_delete on public.epic_issue;
create trigger trg_purge_orphan_after_epic_delete
  after delete on public.epic_issue
  for each row execute function public.purge_orphan_categories();

-- sub_issue 자체는 category_id 컬럼이 없음 (epic 을 통해 참조). epic 삭제 cascade
-- 시 마지막 sub 도 함께 삭제되며, 본 trigger 는 epic 삭제 시 한 번 호출되어
-- epic_issue / sub_issue 둘 다 부재함을 동시에 검증한다.
