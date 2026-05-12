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
  create,
  update,
  remove,
  recalcProgress,
};
