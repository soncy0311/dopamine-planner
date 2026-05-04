import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';

export type UseDeleteTodoArgs = {
  client: AppSupabaseClient;
};

export type DeleteTodoInput = { id: string };

export function useDeleteTodo(
  _args: UseDeleteTodoArgs,
): UseMutationResult<void, Error, DeleteTodoInput> {
  return useMutation<void, Error, DeleteTodoInput>({
    mutationFn: async (_input) => {
      throw new Error('not implemented in sub-02');
    },
  });
}
