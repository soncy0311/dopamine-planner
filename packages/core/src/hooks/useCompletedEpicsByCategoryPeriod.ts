import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import {
  epicService,
  type CompletedEpicPeriodFilter,
} from '../services/epic';
import type { EpicIssue } from '../domain/epic';
import type { Workspace } from '../domain/category';
import { queryKeys } from '../queryKeys';

export type UseCompletedEpicsByCategoryPeriodArgs = {
  client: AppSupabaseClient;
  workspace: Workspace;
  categoryId: string | null;
  period: CompletedEpicPeriodFilter;
};

export function useCompletedEpicsByCategoryPeriod(
  args: UseCompletedEpicsByCategoryPeriodArgs,
): UseQueryResult<EpicIssue[]> {
  const { client, workspace, categoryId, period } = args;
  return useQuery<EpicIssue[]>({
    queryKey: queryKeys.completedEpicsByCategoryPeriod(
      workspace,
      categoryId ?? '',
      period.mode,
      period.value,
    ),
    queryFn: () => {
      if (!categoryId) return Promise.resolve([]);
      return epicService.listCompletedByCategoryPeriod(
        client,
        workspace,
        categoryId,
        period,
      );
    },
    enabled: categoryId !== null,
  });
}
