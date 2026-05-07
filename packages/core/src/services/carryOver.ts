import type { AppSupabaseClient } from '../supabase/types';

export async function carryOverTodos(
  client: AppSupabaseClient,
  targetDate: string,
): Promise<number> {
  const { data, error } = await client.rpc('carry_over_todos', {
    target_date: targetDate,
  });
  if (error) throw error;
  return data?.[0]?.moved_count ?? 0;
}
