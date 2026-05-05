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
  const { data, error } = await client
    .from('sub_issue')
    .select(
      `*,
       epic:epic_issue!inner (
         id, title, progress,
         category:category!inner ( id, name, color, workspace )
       )`,
    )
    .eq('due_date', date)
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
