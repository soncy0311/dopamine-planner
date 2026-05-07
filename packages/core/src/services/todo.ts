import type { AppSupabaseClient } from '../supabase/types';
import {
  mapSubIssueRow,
  mapTodoDailyView,
  type SubIssue,
  type TodoDailyView,
  type TodoInsert,
  type TodoStatus,
  type TodoUpdate,
} from '../domain/todo';
import type { Workspace } from '../domain/category';
import { recalcEpicProgress } from './epicProgress';

export async function listByDate(
  client: AppSupabaseClient,
  workspace: Workspace,
  date: string,
): Promise<TodoDailyView> {
  // 일자 뷰 정책 (sub-prd-10 §일자 뷰 정합):
  //  - 진행 중 섹션: status='todo' AND registered_date = date
  //  - 완료    섹션: status='done' AND completed_date = date  (그 날 완료된 것만)
  // sub-issue 의 registered_date 가 다른 날로 이동하더라도, 완료된 일자에 한해 그 날
  // 의 완료 섹션에 계속 노출된다 — 이력 단절 방지.
  const { data, error } = await client
    .from('sub_issue')
    .select(
      `*,
       epic:epic_issue!inner (
         id, title, progress,
         category:category!inner ( id, name, color, workspace )
       )`,
    )
    .or(
      `and(status.eq.todo,registered_date.eq.${date}),and(status.eq.done,completed_date.eq.${date})`,
    )
    .eq('epic.category.workspace', workspace);
  if (error) throw error;
  return mapTodoDailyView((data ?? []) as Parameters<typeof mapTodoDailyView>[0], date);
}

export async function create(
  client: AppSupabaseClient,
  payload: TodoInsert,
): Promise<SubIssue> {
  const { data, error } = await client
    .from('sub_issue')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapSubIssueRow(data);
}

export async function update(
  client: AppSupabaseClient,
  id: string,
  patch: TodoUpdate,
): Promise<SubIssue> {
  const { data, error } = await client
    .from('sub_issue')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapSubIssueRow(data);
}

export async function remove(
  client: AppSupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client.from('sub_issue').delete().eq('id', id);
  if (error) throw error;
}

export async function toggle(
  client: AppSupabaseClient,
  id: string,
  nextStatus: TodoStatus,
): Promise<SubIssue> {
  const completed_date =
    nextStatus === 'done' ? new Date().toISOString().slice(0, 10) : null;
  const { data, error } = await client
    .from('sub_issue')
    .update({ status: nextStatus, completed_date })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapSubIssueRow(data);
}

export async function cascadeToggleEpic(
  client: AppSupabaseClient,
  epic: { id: string },
  subs: ReadonlyArray<{ id: string; status: TodoStatus }>,
  target: TodoStatus,
): Promise<void> {
  // sub 가 0개인 epic 도 사용자가 직접 완료/해제 토글할 수 있도록 epic 자체를 갱신.
  // recalc RPC 는 total=0 이면 'completed' 로 만들지 않으므로, 여기서 직접 패치.
  if (subs.length === 0) {
    const completed_date =
      target === 'done' ? new Date().toISOString().slice(0, 10) : null;
    const { error } = await client
      .from('epic_issue')
      .update({
        status: target === 'done' ? 'completed' : 'active',
        completed_date,
        progress: target === 'done' ? 1 : 0,
      })
      .eq('id', epic.id);
    if (error) throw error;
    return;
  }
  const targets = subs.filter((s) => s.status !== target);
  await Promise.all(targets.map((s) => toggle(client, s.id, target)));
  await recalcEpicProgress(client, epic.id);
}

export const todoService = {
  listByDate,
  create,
  update,
  remove,
  toggle,
  cascadeToggleEpic,
};
