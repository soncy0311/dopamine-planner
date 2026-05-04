import type { AppSupabaseClient } from '../supabase/types';

export type CarryOverArgs = { target_date: string };
export type CarryOverResult = { moved_count: number };

export async function carryOverTodos(
  client: AppSupabaseClient,
  args: CarryOverArgs,
): Promise<CarryOverResult> {
  const { data, error } = await client.rpc('carry_over_todos', { target_date: args.target_date });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { moved_count: row?.moved_count ?? 0 };
}
