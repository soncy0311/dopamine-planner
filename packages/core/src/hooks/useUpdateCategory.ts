import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { categoryService } from '../services/category';
import type { Category, CategoryUpdate } from '../domain/category';
import { queryKeys } from '../queryKeys';

export type UseUpdateCategoryArgs = { client: AppSupabaseClient };
export type UpdateCategoryInput = { id: string; patch: CategoryUpdate };

export function useUpdateCategory(
  args: UseUpdateCategoryArgs,
): UseMutationResult<Category, Error, UpdateCategoryInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<Category, Error, UpdateCategoryInput>({
    mutationFn: ({ id, patch }) => categoryService.update(client, id, patch),
    onSuccess: (updated) => {
      qc.invalidateQueries({
        queryKey: queryKeys.categories(updated.workspace),
      });
    },
  });
}
