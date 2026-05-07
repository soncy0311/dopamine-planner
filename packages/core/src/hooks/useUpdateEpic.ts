import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { epicService } from '../services/epic';
import type { EpicIssue, EpicUpdate } from '../domain/epic';

export type UseUpdateEpicArgs = { client: AppSupabaseClient };
export type UpdateEpicInput = { id: string; patch: EpicUpdate };

export function useUpdateEpic(
  args: UseUpdateEpicArgs,
): UseMutationResult<EpicIssue, Error, UpdateEpicInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<EpicIssue, Error, UpdateEpicInput>({
    mutationFn: ({ id, patch }) => epicService.update(client, id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['epics'] });
    },
  });
}
