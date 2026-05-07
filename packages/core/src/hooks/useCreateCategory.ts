import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { categoryService } from '../services/category';
import type { Category, CategoryInsert } from '../domain/category';
import { queryKeys } from '../queryKeys';

export type UseCreateCategoryArgs = { client: AppSupabaseClient };
export type CreateCategoryInput = CategoryInsert;

export function useCreateCategory(
  args: UseCreateCategoryArgs,
): UseMutationResult<Category, Error, CreateCategoryInput> {
  const { client } = args;
  const qc = useQueryClient();
  return useMutation<Category, Error, CreateCategoryInput>({
    mutationFn: (input) => categoryService.create(client, input),
    onSuccess: (created) => {
      qc.invalidateQueries({
        queryKey: queryKeys.categories(created.workspace),
      });
    },
  });
}
