import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';

export type UseDeleteTodoArgs = {
  client: AppSupabaseClient;
};

export type DeleteTodoInput = { id: string };

export function useDeleteTodo(
  args: UseDeleteTodoArgs,
): UseMutationResult<void, Error, DeleteTodoInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<void, Error, DeleteTodoInput>({
    mutationFn: async ({ id }) => {
      const { error } = await client.from('sub_issue').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
