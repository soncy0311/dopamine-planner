import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import type { TodoUpdate, TodoView } from '../domain/todo';

export type UseUpdateTodoArgs = {
  client: AppSupabaseClient;
};

export type UpdateTodoInput = { id: string; patch: TodoUpdate };

export function useUpdateTodo(
  args: UseUpdateTodoArgs,
): UseMutationResult<TodoView, Error, UpdateTodoInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<TodoView, Error, UpdateTodoInput>({
    mutationFn: async ({ id, patch }) => {
      const { data, error } = await client
        .from('sub_issue')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as TodoView;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
