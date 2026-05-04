import type { AppSupabaseClient } from '../supabase/types';

type Workspace = 'life' | 'work';

export function subscribeTodos(
  client: AppSupabaseClient,
  workspace: Workspace,
  onChange: () => void,
): () => void {
  const channel = client
    .channel(`todos:${workspace}`)
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'sub_issue' },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
