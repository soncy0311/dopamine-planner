import type { AppSupabaseClient } from '../supabase/types';
import {
  flattenJoined,
  mapSubIssueRow,
  type SubIssue,
  type SubIssueRowWithJoins,
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
  // 일자 뷰 노출 정책 (sub-prd-10 §일자 뷰 정합):
  //  - 진행 중 섹션: 완료되지 않은 (active) Epic + 그 Epic 의 모든 sub (status·날짜 무관)
  //  - 완료    섹션: 본 일자에 완료된 Epic (completed_date = date) + 그 Epic 의 모든 sub
  //
  // 즉 sub 의 registered_date / completed_date 는 노출 정책에 영향 없음. Epic 의
  // status 와 completed_date 가 SoT.
  const baseSelect = `*,
     epic:epic_issue!inner (
       id, title, progress, status, completed_date, workspace,
       category:category ( id, name, color, workspace )
     )`;

  const [activeRes, doneRes] = await Promise.all([
    // 진행 중 섹션 sub: Epic.status = 'active'
    client
      .from('sub_issue')
      .select(baseSelect)
      .eq('epic.status', 'active')
      .eq('epic.workspace', workspace),
    // 완료 섹션 sub: Epic.status = 'completed' AND Epic.completed_date = date
    client
      .from('sub_issue')
      .select(baseSelect)
      .eq('epic.status', 'completed')
      .eq('epic.completed_date', date)
      .eq('epic.workspace', workspace),
  ]);
  if (activeRes.error) throw activeRes.error;
  if (doneRes.error) throw doneRes.error;

  const todoRows = (activeRes.data ?? []) as SubIssueRowWithJoins[];
  const doneRows = (doneRes.data ?? []) as SubIssueRowWithJoins[];
  return {
    date,
    todo: todoRows.map(flattenJoined),
    done: doneRows.map(flattenJoined),
  };
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
