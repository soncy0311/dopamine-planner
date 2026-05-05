import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import type { TodoView } from '../domain/todo';

export type UseTodosArgs = {
  client: AppSupabaseClient;
  workspace: 'life' | 'work';
  date: string;
};

export function useTodos(args: UseTodosArgs): UseQueryResult<TodoView[]> {
  const { client, workspace, date } = args;
  return useQuery<TodoView[]>({
    queryKey: ['todos', { workspace, date }],
    queryFn: async () => {
      const { data, error } = await client
        .from('sub_issue')
        .select(
          `*,
           epic:epic_issue!inner (
             id, title,
             category:category!inner ( id, name, color, workspace )
           )`,
        )
        .eq('due_date', date)
        .eq('epic.category.workspace', workspace);
      if (error) throw error;
      return (data ?? []) as TodoView[];
    },
  });
}
