import type { QueryClient } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { invalidateByTable } from '../queryKeys';

export function subscribeTodos(
  client: AppSupabaseClient,
  qc: QueryClient,
): () => void {
  const channel = client
    .channel('todos:all')
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'sub_issue' },
      () => invalidateByTable(qc, 'sub_issue'),
    )
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'epic_issue' },
      () => invalidateByTable(qc, 'epic_issue'),
    )
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'category' },
      () => invalidateByTable(qc, 'category'),
    )
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'profile' },
      () => invalidateByTable(qc, 'profile'),
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
