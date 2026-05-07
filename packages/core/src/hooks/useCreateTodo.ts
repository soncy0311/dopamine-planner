import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { todoService } from '../services/todo';
import type { SubIssue, TodoInsert } from '../domain/todo';

export type UseCreateTodoArgs = { client: AppSupabaseClient };
export type CreateTodoInput = TodoInsert;

export function useCreateTodo(
  args: UseCreateTodoArgs,
): UseMutationResult<SubIssue, Error, CreateTodoInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<SubIssue, Error, CreateTodoInput>({
    mutationFn: (input) => todoService.create(client, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['epics'] });
    },
  });
}
