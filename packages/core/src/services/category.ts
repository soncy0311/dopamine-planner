import type { AppSupabaseClient } from '../supabase/types';
import {
  mapCategoryRow,
  type Category,
  type CategoryInsert,
  type CategoryUpdate,
  type Workspace,
} from '../domain/category';

export async function listByWorkspace(
  client: AppSupabaseClient,
  workspace: Workspace,
): Promise<Category[]> {
  const { data, error } = await client
    .from('category')
    .select('*')
    .eq('workspace', workspace)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []).map(mapCategoryRow);
}

export async function create(
  client: AppSupabaseClient,
  payload: CategoryInsert,
): Promise<Category> {
  const { data, error } = await client
    .from('category')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapCategoryRow(data);
}

export async function update(
  client: AppSupabaseClient,
  id: string,
  patch: CategoryUpdate,
): Promise<Category> {
  const { data, error } = await client
    .from('category')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapCategoryRow(data);
}

export async function remove(
  client: AppSupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client.rpc('delete_category_detach_epics', {
    p_category_id: id,
  });
  if (error) throw error;
}

export const categoryService = { listByWorkspace, create, update, remove };
