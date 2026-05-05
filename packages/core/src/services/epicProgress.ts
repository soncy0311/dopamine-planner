import type { AppSupabaseClient } from '../supabase/types';

export type RecalcEpicProgressArgs = { epic_id: string };
export type RecalcEpicProgressResult = { progress: number };

export async function recalcEpicProgress(
  client: AppSupabaseClient,
  args: RecalcEpicProgressArgs,
): Promise<RecalcEpicProgressResult> {
  const { data, error } = await client.rpc('recalc_epic_progress', { epic_id: args.epic_id });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { progress: row?.progress ?? 0 };
}
