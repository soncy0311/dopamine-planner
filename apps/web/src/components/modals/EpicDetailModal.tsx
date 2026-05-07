'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { useDeleteEpic, useUpdateEpic, type Workspace } from '@todo-list/core';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';
import { supabase } from '@/lib/supabase/client';
import {
  CategoryComboboxCreate,
  type CategoryComboboxValue,
} from '@/components/ui/CategoryComboboxCreate';
import { PriorityRadioGroup } from '@/components/ui/PriorityRadioGroup';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

const EpicEditSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내'),
  description: z.string().max(2000, '설명은 2000자 이내').optional(),
  priority: z.enum(['high', 'medium', 'low']),
  categoryId: z.string().min(1, '분류를 선택해주세요'),
  registeredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '유효한 날짜가 아닙니다'),
});
type EpicEditValues = z.infer<typeof EpicEditSchema>;

type EpicDetailFetch = {
  id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  category_id: string;
  registered_date: string | null;
  category: { id: string; name: string; color: string | null } | null;
};

async function fetchEpicDetail(epicId: string): Promise<EpicDetailFetch> {
  const { data, error } = await supabase
    .from('epic_issue')
    .select(
      'id, title, description, priority, category_id, registered_date, category:category(id, name, color)',
    )
    .eq('id', epicId)
    .single();
  if (error) throw error;
  return data as unknown as EpicDetailFetch;
}

type EpicDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  epicId: string;
};

export function EpicDetailModal({ open, onOpenChange, workspace, epicId }: EpicDetailModalProps) {
  const { data: detail } = useQuery({
    queryKey: ['epicDetail', epicId],
    queryFn: () => fetchEpicDetail(epicId),
    enabled: open && !!epicId,
  });

  const [category, setCategory] = useState<CategoryComboboxValue | null>(null);

  const form = useForm<EpicEditValues>({
    resolver: zodResolver(EpicEditSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      categoryId: '',
      registeredDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (!detail) return;
    form.reset({
      title: detail.title,
      description: detail.description ?? '',
      priority: detail.priority,
      categoryId: detail.category_id,
      registeredDate:
        detail.registered_date ?? new Date().toISOString().slice(0, 10),
    });
    setCategory(
      detail.category
        ? {
            id: detail.category.id,
            name: detail.category.name,
            color: detail.category.color ?? undefined,
          }
        : null,
    );
  }, [detail, form]);

  useEffect(() => {
    form.setValue('categoryId', category?.id ?? '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [category, form]);

  const update = useUpdateEpic({ client: supabase });
  const remove = useDeleteEpic({ client: supabase });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submitting = form.formState.isSubmitting || update.isPending;

  const onSubmit = async (values: EpicEditValues) => {
    try {
      await update.mutateAsync({
        id: epicId,
        patch: {
          title: values.title,
          description: values.description?.trim() ? values.description.trim() : null,
          priority: values.priority,
          category_id: values.categoryId,
          registered_date: values.registeredDate,
        },
      });
      toast.success('Epic 이 수정되었어요');
      onOpenChange(false);
    } catch (err) {
      showFkOrDefaultError(err, 'Epic 저장에 실패했어요.');
    }
  };

  const onConfirmDelete = async () => {
    try {
      await remove.mutateAsync({ id: epicId });
      toast.success('삭제되었어요');
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (err) {
      showFkOrDefaultError(err, '삭제에 실패했어요.');
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black-900/40" />
          <Dialog.Content className="fixed inset-0 flex flex-col gap-4 bg-white p-6 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[480px] sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <header className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-black-900">
                Epic 수정
              </Dialog.Title>
              <Dialog.Close
                type="button"
                aria-label="닫기"
                className="flex h-9 w-9 items-center justify-center rounded-md text-periwinkle-400 hover:bg-periwinkle-100"
              >
                ✕
              </Dialog.Close>
            </header>
            {!detail ? (
              <p className="text-sm text-periwinkle-300">불러오는 중…</p>
            ) : (
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1">
                  <label htmlFor="epic-edit-title" className="text-sm font-medium text-black-900">
                    제목 *
                  </label>
                  <input
                    id="epic-edit-title"
                    type="text"
                    {...form.register('title')}
                    className="rounded-md border border-periwinkle-200 bg-white px-3 py-3 text-sm text-black-900 outline-none focus:border-2 focus:border-purple-500"
                    placeholder="Epic 제목을 입력하세요"
                  />
                  {form.formState.errors.title && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.title.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="epic-edit-desc" className="text-sm font-medium text-black-900">
                    설명
                  </label>
                  <textarea
                    id="epic-edit-desc"
                    {...form.register('description')}
                    rows={3}
                    className="rounded-md border border-periwinkle-200 bg-white px-3 py-3 text-sm text-black-900 outline-none focus:border-2 focus:border-purple-500"
                    placeholder="설명을 입력하세요 (선택)"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-black-900">우선순위</span>
                  <PriorityRadioGroup
                    value={form.watch('priority')}
                    onChange={(p) => form.setValue('priority', p, { shouldDirty: true })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-black-900">분류</span>
                  <CategoryComboboxCreate
                    workspace={workspace}
                    value={category}
                    onChange={setCategory}
                    placeholder="분류를 검색하세요"
                  />
                  {form.formState.errors.categoryId && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.categoryId.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="epic-edit-date" className="text-sm font-medium text-black-900">
                    등록일
                  </label>
                  <input
                    id="epic-edit-date"
                    type="date"
                    {...form.register('registeredDate')}
                    className="rounded-md border border-periwinkle-200 bg-white px-3 py-3 text-sm text-black-900 outline-none focus:border-2 focus:border-purple-500"
                  />
                  {form.formState.errors.registeredDate && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.registeredDate.message}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white"
                  >
                    삭제
                  </button>
                  <div className="flex gap-2">
                    <Dialog.Close
                      type="button"
                      className="rounded-md border border-periwinkle-300 px-4 py-2 text-sm font-medium text-periwinkle-500"
                    >
                      취소
                    </Dialog.Close>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-md bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50"
                    >
                      {submitting ? '저장 중…' : '저장'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="이 Epic 을 삭제할까요?"
        description="Epic 의 모든 서브 이슈도 함께 삭제돼요."
        onConfirm={onConfirmDelete}
        loading={remove.isPending}
      />
    </>
  );
}
