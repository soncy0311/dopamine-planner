import type { AppSupabaseClient } from '../supabase/types';

export async function recalcEpicProgress(
  client: AppSupabaseClient,
  epicId: string,
): Promise<number> {
  const { data, error } = await client.rpc('recalc_epic_progress', {
    epic_id: epicId,
  });
  if (error) throw error;
  return data?.[0]?.progress ?? 0;
}
