import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { epicService } from '../services/epic';
import type { EpicIssue } from '../domain/epic';
import type { Workspace } from '../domain/category';
import { queryKeys } from '../queryKeys';

export type UseCompletedEpicsArgs = {
  client: AppSupabaseClient;
  workspace: Workspace;
};

export function useCompletedEpics(
  args: UseCompletedEpicsArgs,
): UseQueryResult<EpicIssue[]> {
  const { client, workspace } = args;
  return useQuery<EpicIssue[]>({
    queryKey: queryKeys.completedEpics(workspace),
    queryFn: () => epicService.listCompletedByWorkspace(client, workspace),
  });
}
