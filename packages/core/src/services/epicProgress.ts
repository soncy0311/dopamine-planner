import type { AppSupabaseClient } from '../supabase/types';

export type RecalcEpicProgressArgs = { epic_id: string };
export type RecalcEpicProgressResult = {
  /* Database['public']['Functions']['recalc_epic_progress']['Returns'] — Sub-04 에서 채움 */
};

export async function recalcEpicProgress(
  _client: AppSupabaseClient,
  _args: RecalcEpicProgressArgs,
): Promise<RecalcEpicProgressResult> {
  throw new Error('not implemented in sub-02');
}
