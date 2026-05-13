import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { epicService, type CalendarCompletedCountMap } from '../services/epic';
import type { Workspace } from '../domain/category';
import { queryKeys } from '../queryKeys';

export type UseCalendarCompletedCountsArgs = {
  client: AppSupabaseClient;
  workspace: Workspace;
  month: string;
};

export function useCalendarCompletedCounts(
  args: UseCalendarCompletedCountsArgs,
): UseQueryResult<CalendarCompletedCountMap> {
  const { client, workspace, month } = args;
  return useQuery<CalendarCompletedCountMap>({
    queryKey: queryKeys.calendarCompletedCounts(workspace, month),
    queryFn: () => epicService.countCompletedByDateForMonth(client, workspace, month),
  });
}
