import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import type { TodoInsert, TodoView } from '../domain/todo';

export type UseCreateTodoArgs = {
  client: AppSupabaseClient;
};

export type CreateTodoInput = TodoInsert;

export function useCreateTodo(
  args: UseCreateTodoArgs,
): UseMutationResult<TodoView, Error, CreateTodoInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<TodoView, Error, CreateTodoInput>({
    mutationFn: async (input) => {
      const { data, error } = await client
        .from('sub_issue')
        .insert(input)
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
