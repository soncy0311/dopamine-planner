import type { AppSupabaseClient } from '../supabase/types';

export type CarryOverArgs = { target_date: string };
export type CarryOverResult = {
  /* Database['public']['Functions']['carry_over_todos']['Returns'] — Sub-04 에서 채움 */
};

export async function carryOverTodos(
  _client: AppSupabaseClient,
  _args: CarryOverArgs,
): Promise<CarryOverResult> {
  throw new Error('not implemented in sub-02');
}
