-- ────────────────────────────────────────────────────────────────────────────
-- handle_new_user: auth.users INSERT 시 public.profile 자동 생성
-- ────────────────────────────────────────────────────────────────────────────
-- OAuth(Google) / 이메일 / 매직링크 등 모든 가입 경로에서 profile 행이
-- 생성되도록 보장한다. display_name 은 OAuth provider 가 채워주는
-- raw_user_meta_data 의 full_name → name → 이메일 로컬 파트 순으로 fallback.
-- ────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────────────────────
-- 기존 auth.users 중 profile 없는 사용자 backfill
-- ────────────────────────────────────────────────────────────────────────────
insert into public.profile (id, display_name)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  )
from auth.users u
left join public.profile p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
