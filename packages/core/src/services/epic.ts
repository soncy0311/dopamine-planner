import type { AppSupabaseClient } from '../supabase/types';
import {
  mapEpicRow,
  type EpicInsert,
  type EpicIssue,
  type EpicRow,
  type EpicUpdate,
} from '../domain/epic';
import type { Workspace } from '../domain/category';
import { recalcEpicProgress } from './epicProgress';

export type CalendarCompletedCountMap = Record<string, number>;

export type CompletedEpicPeriodFilter =
  | { mode: 'month'; value: string }
  | { mode: 'day'; value: string };

export async function listByCategory(
  client: AppSupabaseClient,
  categoryId: string,
): Promise<EpicIssue[]> {
  const { data, error } = await client
    .from('epic_issue')
    .select('*')
    .eq('category_id', categoryId);
  if (error) throw error;
  return (data ?? []).map(mapEpicRow);
}

export async function listByWorkspace(
  client: AppSupabaseClient,
  workspace: Workspace,
): Promise<EpicIssue[]> {
  const { data, error } = await client
    .from('epic_issue')
    .select('*')
    .eq('workspace', workspace);
  if (error) throw error;
  return (data ?? []).map(mapEpicRow);
}

export async function listCompletedByWorkspace(
  client: AppSupabaseClient,
  workspace: Workspace,
): Promise<EpicIssue[]> {
  const { data, error } = await client
    .from('epic_issue')
    .select('*')
    .eq('workspace', workspace)
    .eq('status', 'completed')
    .not('completed_date', 'is', null)
    .order('completed_date', { ascending: false })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapEpicRow);
}

export async function listCompletedByCategoryPeriod(
  client: AppSupabaseClient,
  workspace: Workspace,
  categoryId: string,
  period: CompletedEpicPeriodFilter,
): Promise<EpicIssue[]> {
  let query = client
    .from('epic_issue')
    .select('*')
    .eq('workspace', workspace)
    .eq('category_id', categoryId)
    .eq('status', 'completed')
    .not('completed_date', 'is', null);

  if (period.mode === 'day') {
    query = query.eq('completed_date', period.value);
  } else {
    const { start, end } = monthBounds(period.value);
    query = query.gte('completed_date', start).lt('completed_date', end);
  }

  const { data, error } = await query
    .order('completed_date', { ascending: false })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapEpicRow);
}

function monthBounds(month: string): { start: string; end: string } {
  const [yearPart, monthPart] = month.split('-');
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  const toMonthStart = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
  };
  return { start: toMonthStart(start), end: toMonthStart(end) };
}

export async function countCompletedByDateForMonth(
  client: AppSupabaseClient,
  workspace: Workspace,
  month: string,
): Promise<CalendarCompletedCountMap> {
  const { start, end } = monthBounds(month);
  const { data, error } = await client
    .from('epic_issue')
    .select('completed_date')
    .eq('workspace', workspace)
    .eq('status', 'completed')
    .not('completed_date', 'is', null)
    .gte('completed_date', start)
    .lt('completed_date', end);
  if (error) throw error;

  const counts: CalendarCompletedCountMap = {};
  for (const row of data ?? []) {
    const completedDate = row.completed_date;
    if (!completedDate) continue;
    counts[completedDate] = (counts[completedDate] ?? 0) + 1;
  }
  return counts;
}

export async function create(
  client: AppSupabaseClient,
  payload: EpicInsert,
): Promise<EpicIssue> {
  const { data, error } = await client
    .from('epic_issue')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapEpicRow(data);
}

export async function update(
  client: AppSupabaseClient,
  id: string,
  patch: EpicUpdate,
): Promise<EpicIssue> {
  const { data, error } = await client
    .from('epic_issue')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapEpicRow(data);
}

export async function remove(
  client: AppSupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client.from('epic_issue').delete().eq('id', id);
  if (error) throw error;
}

export function recalcProgress(
  client: AppSupabaseClient,
  epicId: string,
): Promise<number> {
  return recalcEpicProgress(client, epicId);
}

export const epicService = {
  listByCategory,
  listByWorkspace,
  listCompletedByWorkspace,
  listCompletedByCategoryPeriod,
  countCompletedByDateForMonth,
  create,
  update,
  remove,
  recalcProgress,
};
