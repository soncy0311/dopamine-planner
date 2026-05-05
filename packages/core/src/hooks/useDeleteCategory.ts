import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { categoryService } from '../services/category';
import type { Workspace } from '../domain/category';
import { queryKeys } from '../queryKeys';

export type UseDeleteCategoryArgs = { client: AppSupabaseClient };
export type DeleteCategoryInput = { id: string; workspace: Workspace };

export function useDeleteCategory(
  args: UseDeleteCategoryArgs,
): UseMutationResult<void, Error, DeleteCategoryInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<void, Error, DeleteCategoryInput>({
    mutationFn: ({ id }) => categoryService.remove(client, id),
    onSuccess: (_data, { workspace }) => {
      qc.invalidateQueries({ queryKey: queryKeys.categories(workspace) });
    },
  });
}
