import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import type { TodoUpdate, TodoView } from '../domain/todo';

export type UseUpdateTodoArgs = {
  client: AppSupabaseClient;
};

export type UpdateTodoInput = { id: string; patch: TodoUpdate };

export function useUpdateTodo(
  _args: UseUpdateTodoArgs,
): UseMutationResult<TodoView, Error, UpdateTodoInput> {
  return useMutation<TodoView, Error, UpdateTodoInput>({
    mutationFn: async (_input) => {
      throw new Error('not implemented in sub-02');
    },
  });
}
