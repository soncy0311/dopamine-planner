import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { todoService } from '../services/todo';

export type UseDeleteTodoArgs = { client: AppSupabaseClient };
export type DeleteTodoInput = { id: string };

export function useDeleteTodo(
  args: UseDeleteTodoArgs,
): UseMutationResult<void, Error, DeleteTodoInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<void, Error, DeleteTodoInput>({
    mutationFn: ({ id }) => todoService.remove(client, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['epics'] });
    },
  });
}
