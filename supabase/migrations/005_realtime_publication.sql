-- 005_realtime_publication.sql
-- 4개 테이블을 supabase_realtime publication 에 등록.
-- Cloud 환경은 publication 이 기본 존재하지만, 로컬 supabase db reset 컨텍스트에서도
-- 안전하도록 존재 검사 후 생성 분기를 둔다.
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table profile, category, epic_issue, sub_issue;
