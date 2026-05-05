import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { epicService } from '../services/epic';

export type UseDeleteEpicArgs = { client: AppSupabaseClient };
export type DeleteEpicInput = { id: string };

export function useDeleteEpic(
  args: UseDeleteEpicArgs,
): UseMutationResult<void, Error, DeleteEpicInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<void, Error, DeleteEpicInput>({
    mutationFn: ({ id }) => epicService.remove(client, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['epics'] });
    },
  });
}
