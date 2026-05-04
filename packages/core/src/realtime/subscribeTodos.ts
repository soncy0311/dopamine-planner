import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@todo-list/shared/database';

export function subscribeTodos(
  client: SupabaseClient<Database>,
  workspace: 'life' | 'work',
  onChange: (event: 'INSERT' | 'UPDATE' | 'DELETE') => void,
): () => void {
  const channel = client
    .channel(`todos:${workspace}`)
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'sub_issue' },
      (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE' }) => {
        onChange(payload.eventType);
      },
    )
    .subscribe();
  return () => {
    client.removeChannel(channel);
  };
}
