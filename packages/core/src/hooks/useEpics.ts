import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { epicService } from '../services/epic';
import type { EpicIssue } from '../domain/epic';
import type { Workspace } from '../domain/category';
import { queryKeys } from '../queryKeys';

export type UseEpicsArgs =
  | { client: AppSupabaseClient; workspace: Workspace }
  | { client: AppSupabaseClient; categoryId: string };

export function useEpics(args: UseEpicsArgs): UseQueryResult<EpicIssue[]> {
  if ('categoryId' in args) {
    const { client, categoryId } = args;
    return useQuery<EpicIssue[]>({
      queryKey: queryKeys.epicsByCategory(categoryId),
      queryFn: () => epicService.listByCategory(client, categoryId),
    });
  }
  const { client, workspace } = args;
  return useQuery<EpicIssue[]>({
    queryKey: queryKeys.epics(workspace),
    queryFn: () => epicService.listByWorkspace(client, workspace),
  });
}
