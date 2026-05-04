import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import type { TodoInsert, TodoView } from '../domain/todo';

export type UseCreateTodoArgs = {
  client: AppSupabaseClient;
};

export type CreateTodoInput = TodoInsert;

export function useCreateTodo(
  _args: UseCreateTodoArgs,
): UseMutationResult<TodoView, Error, CreateTodoInput> {
  return useMutation<TodoView, Error, CreateTodoInput>({
    mutationFn: async (_input) => {
      throw new Error('not implemented in sub-02');
    },
  });
}
