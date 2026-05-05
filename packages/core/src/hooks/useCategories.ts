import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { categoryService } from '../services/category';
import type { Category, Workspace } from '../domain/category';
import { queryKeys } from '../queryKeys';

export type UseCategoriesArgs = {
  client: AppSupabaseClient;
  workspace: Workspace;
};

export function useCategories(
  args: UseCategoriesArgs,
): UseQueryResult<Category[]> {
  const { client, workspace } = args;
  return useQuery<Category[]>({
    queryKey: queryKeys.categories(workspace),
    queryFn: () => categoryService.listByWorkspace(client, workspace),
  });
}
