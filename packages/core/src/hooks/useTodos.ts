import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import type { TodoView } from '../domain/todo';

export type UseTodosArgs = {
  client: AppSupabaseClient;
  workspace: 'life' | 'work';
  date: string;
};

export function useTodos(args: UseTodosArgs): UseQueryResult<TodoView[]> {
  return useQuery<TodoView[]>({
    queryKey: ['todos', { workspace: args.workspace, date: args.date }],
    queryFn: async () => {
      throw new Error('not implemented in sub-02');
    },
  });
}
