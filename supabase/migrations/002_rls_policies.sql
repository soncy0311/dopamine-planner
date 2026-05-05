-- 002_rls_policies.sql
-- 테이블별 RLS 정책. profile 은 self / 그 외는 user_id 기준.
-- 총 15개 정책 (4 테이블 × 4 액션 - profile DELETE 1건).
-- 정책은 003·004 RPC 보다 먼저 적용되어야 RPC 본문의 auth.uid() 검증이 의미 있음.

-- ────────────────────────────────────────
-- profile: id = auth.uid() (DELETE 미작성 — Sub-PRD §2)
-- ────────────────────────────────────────
create policy "profile_select_self" on public.profile
  for select using (auth.uid() = id);

create policy "profile_insert_self" on public.profile
  for insert with check (auth.uid() = id);

create policy "profile_update_self" on public.profile
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ────────────────────────────────────────
-- category: user_id = auth.uid()
-- ────────────────────────────────────────
create policy "category_select_self" on public.category
  for select using (auth.uid() = user_id);

create policy "category_insert_self" on public.category
  for insert with check (auth.uid() = user_id);

create policy "category_update_self" on public.category
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "category_delete_self" on public.category
  for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────
-- epic_issue: user_id = auth.uid() (JOIN 회피 — detail §3.3)
-- ────────────────────────────────────────
create policy "epic_issue_select_self" on public.epic_issue
  for select using (auth.uid() = user_id);

create policy "epic_issue_insert_self" on public.epic_issue
  for insert with check (auth.uid() = user_id);

create policy "epic_issue_update_self" on public.epic_issue
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "epic_issue_delete_self" on public.epic_issue
  for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────
-- sub_issue: user_id = auth.uid() (JOIN 회피)
-- ────────────────────────────────────────
create policy "sub_issue_select_self" on public.sub_issue
  for select using (auth.uid() = user_id);

create policy "sub_issue_insert_self" on public.sub_issue
  for insert with check (auth.uid() = user_id);

create policy "sub_issue_update_self" on public.sub_issue
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sub_issue_delete_self" on public.sub_issue
  for delete using (auth.uid() = user_id);
