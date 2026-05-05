'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { useCreateCategory, useUpdateCategory, type Workspace } from '@todo-list/core';
import { CategoryFormSchema, type CategoryFormValues } from '@/lib/forms/schemas';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';
import { supabase } from '@/lib/supabase/client';

export const CATEGORY_PALETTE = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#64748B',
] as const;

type CategoryFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  initial?: { id: string; name: string; color: string };
};

export function CategoryFormModal({
  open,
  onOpenChange,
  workspace,
  initial,
}: CategoryFormModalProps) {
  const isEdit = !!initial;
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
      color: initial?.color ?? CATEGORY_PALETTE[0],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: initial?.name ?? '',
        color: initial?.color ?? CATEGORY_PALETTE[0],
      });
    }
  }, [open, initial, form]);

  const create = useCreateCategory({ client: supabase });
  const update = useUpdateCategory({ client: supabase });

  const submitting = form.formState.isSubmitting || create.isPending || update.isPending;
  const selectedColor = form.watch('color');

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (isEdit) {
        await update.mutateAsync({
          id: initial!.id,
          patch: { name: values.name, color: values.color },
        });
      } else {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userRes.user) {
          toast.error('로그인 세션이 만료되었어요. 다시 로그인 해주세요.');
          return;
        }
        await create.mutateAsync({
          user_id: userRes.user.id,
          workspace,
          name: values.name,
          color: values.color,
        });
      }
      toast.success(isEdit ? '분류가 수정되었어요' : '분류가 생성되었어요');
      onOpenChange(false);
    } catch (err) {
      showFkOrDefaultError(err, '분류 저장에 실패했어요.');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black-900/40" />
        <Dialog.Content className="fixed inset-0 bg-white p-6 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg">
          <Dialog.Title className="text-lg font-semibold text-black-900">
            {isEdit ? '분류 수정' : '분류 추가'}
          </Dialog.Title>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-black-900">이름</span>
              <input
                type="text"
                {...form.register('name')}
                className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500"
                placeholder="분류 이름"
                autoFocus
              />
              {form.formState.errors.name && (
                <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>
              )}
            </label>
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm text-black-900">색상</legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="분류 색상">
                {CATEGORY_PALETTE.map((color) => {
                  const checked = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      aria-label={color}
                      onClick={() =>
                        form.setValue('color', color, { shouldValidate: true, shouldDirty: true })
                      }
                      className={`h-8 w-8 rounded-full border-2 ${
                        checked ? 'border-purple-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
              {form.formState.errors.color && (
                <span className="text-xs text-red-500">{form.formState.errors.color.message}</span>
              )}
            </fieldset>
            <div className="mt-2 flex justify-end gap-2">
              <Dialog.Close
                type="button"
                className="rounded-md px-4 py-2 text-sm text-black-900 hover:bg-gray-50"
              >
                취소
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-md bg-purple-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? '저장 중…' : '저장'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
