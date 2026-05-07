import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { epicService } from '../services/epic';
import type { EpicInsert, EpicIssue } from '../domain/epic';

export type UseCreateEpicArgs = { client: AppSupabaseClient };
export type CreateEpicInput = EpicInsert;

export function useCreateEpic(
  args: UseCreateEpicArgs,
): UseMutationResult<EpicIssue, Error, CreateEpicInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<EpicIssue, Error, CreateEpicInput>({
    mutationFn: (input) => epicService.create(client, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['epics'] });
    },
  });
}
