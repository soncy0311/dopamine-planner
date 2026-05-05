'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import {
  useCategories,
  useCreateEpic,
  useUpdateEpic,
  type Workspace,
} from '@todo-list/core';
import { EpicFormSchema, type EpicFormValues } from '@/lib/forms/schemas';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';
import { supabase } from '@/lib/supabase/client';

type EpicFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  initial?: { id: string; categoryId: string; title: string; description?: string | null };
};

export function EpicFormModal({ open, onOpenChange, workspace, initial }: EpicFormModalProps) {
  const isEdit = !!initial;
  const { data: categories } = useCategories({ client: supabase, workspace });

  const form = useForm<EpicFormValues>({
    resolver: zodResolver(EpicFormSchema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      categoryId: initial?.categoryId ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        categoryId: initial?.categoryId ?? '',
      });
    }
  }, [open, initial, form]);

  const create = useCreateEpic({ client: supabase });
  const update = useUpdateEpic({ client: supabase });
  const submitting = form.formState.isSubmitting || create.isPending || update.isPending;

  const onSubmit = async (values: EpicFormValues) => {
    try {
      if (isEdit) {
        await update.mutateAsync({
          id: initial!.id,
          patch: {
            title: values.title,
            description: values.description ?? null,
            category_id: values.categoryId,
          },
        });
      } else {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userRes.user) {
          toast.error('로그인 세션이 만료되었어요. 다시 로그인 해주세요.');
          return;
        }
        await create.mutateAsync({
          user_id: userRes.user.id,
          category_id: values.categoryId,
          title: values.title,
          description: values.description ?? null,
        });
      }
      toast.success(isEdit ? 'Epic 이 수정되었어요' : 'Epic 이 생성되었어요');
      onOpenChange(false);
    } catch (err) {
      showFkOrDefaultError(err, 'Epic 저장에 실패했어요.');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black-900/40" />
        <Dialog.Content className="fixed inset-0 bg-white p-6 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg">
          <Dialog.Title className="text-lg font-semibold text-black-900">
            {isEdit ? 'Epic 수정' : 'Epic 추가'}
          </Dialog.Title>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-black-900">분류</span>
              <select
                {...form.register('categoryId')}
                className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500"
              >
                <option value="">분류를 선택해주세요</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.categoryId && (
                <span className="text-xs text-red-500">
                  {form.formState.errors.categoryId.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-black-900">제목</span>
              <input
                type="text"
                {...form.register('title')}
                className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500"
                placeholder="Epic 제목"
              />
              {form.formState.errors.title && (
                <span className="text-xs text-red-500">{form.formState.errors.title.message}</span>
              )}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-black-900">설명 (선택)</span>
              <textarea
                {...form.register('description')}
                rows={3}
                className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500"
                placeholder="Epic 설명"
              />
            </label>
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
