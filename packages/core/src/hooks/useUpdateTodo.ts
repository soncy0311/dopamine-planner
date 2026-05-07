import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { todoService } from '../services/todo';
import type { SubIssue, TodoUpdate } from '../domain/todo';

export type UseUpdateTodoArgs = { client: AppSupabaseClient };
export type UpdateTodoInput = { id: string; patch: TodoUpdate };

export function useUpdateTodo(
  args: UseUpdateTodoArgs,
): UseMutationResult<SubIssue, Error, UpdateTodoInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<SubIssue, Error, UpdateTodoInput>({
    mutationFn: ({ id, patch }) => todoService.update(client, id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['epics'] });
    },
  });
}
