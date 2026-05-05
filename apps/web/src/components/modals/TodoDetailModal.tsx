'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useCategories,
  useDeleteTodo,
  useEpics,
  useUpdateTodo,
  type Workspace,
} from '@todo-list/core';
import { TodoFormSchema, type TodoFormValues } from '@/lib/forms/schemas';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';
import { supabase } from '@/lib/supabase/client';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

type TodoDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  todoId: string;
};

type TodoDetailFetch = {
  id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  epic_id: string;
  epic: { id: string; category_id: string } | null;
};

async function fetchTodoDetail(todoId: string): Promise<TodoDetailFetch> {
  const { data, error } = await supabase
    .from('sub_issue')
    .select('id, title, description, priority, due_date, epic_id, epic:epic_issue(id, category_id)')
    .eq('id', todoId)
    .single();
  if (error) throw error;
  return data as unknown as TodoDetailFetch;
}

const EMPTY_UUID = '' as unknown as string;

export function TodoDetailModal({
  open,
  onOpenChange,
  workspace,
  todoId,
}: TodoDetailModalProps) {
  const { data: detail } = useQuery({
    queryKey: ['todoDetail', todoId],
    queryFn: () => fetchTodoDetail(todoId),
    enabled: open && !!todoId,
  });

  const detailValues = useMemo<TodoFormValues | undefined>(() => {
    if (!detail) return undefined;
    return {
      title: detail.title,
      description: detail.description ?? '',
      priority: detail.priority,
      categoryId: detail.epic?.category_id ?? EMPTY_UUID,
      epicId: detail.epic_id,
      dueDate: detail.due_date ?? new Date().toISOString().slice(0, 10),
    };
  }, [detail]);

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(TodoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      categoryId: EMPTY_UUID,
      epicId: EMPTY_UUID,
      dueDate: new Date().toISOString().slice(0, 10),
    },
    values: detailValues,
  });

  const categoryId = form.watch('categoryId');

  const { data: categories } = useCategories({ client: supabase, workspace });
  const { data: epics } = useEpics(
    categoryId ? { client: supabase, categoryId } : { client: supabase, workspace },
  );

  const initialCategoryRef = useRef<string | null>(null);
  useEffect(() => {
    if (detail) initialCategoryRef.current = detail.epic?.category_id ?? null;
  }, [detail]);

  const prevCategoryRef = useRef(categoryId);
  useEffect(() => {
    if (
      prevCategoryRef.current !== categoryId &&
      initialCategoryRef.current !== null &&
      categoryId !== initialCategoryRef.current
    ) {
      form.setValue('epicId', EMPTY_UUID);
    }
    prevCategoryRef.current = categoryId;
  }, [categoryId, form]);

  const update = useUpdateTodo({ client: supabase });
  const remove = useDeleteTodo({ client: supabase });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const submitting = form.formState.isSubmitting || update.isPending;

  const onSubmit = async (values: TodoFormValues) => {
    try {
      await update.mutateAsync({
        id: todoId,
        patch: {
          title: values.title,
          description: values.description ?? null,
          priority: values.priority,
          due_date: values.dueDate,
          epic_id: values.epicId,
        },
      });
      toast.success('수정되었어요');
      onOpenChange(false);
    } catch (err) {
      showFkOrDefaultError(err, '저장에 실패했어요.');
    }
  };

  const onConfirmDelete = async () => {
    try {
      await remove.mutateAsync({ id: todoId });
      toast.success('삭제되었어요');
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (err) {
      showFkOrDefaultError(err, '연결된 자료가 있어 삭제할 수 없어요.');
    }
  };

  const epicSelectDisabled = !categoryId;

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black-900/40" />
          <Dialog.Content className="fixed inset-0 bg-white p-6 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg">
            <Dialog.Title className="text-lg font-semibold text-black-900">할 일 상세</Dialog.Title>
            {!detail ? (
              <p className="mt-4 text-sm text-periwinkle-300">불러오는 중…</p>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-black-900">제목</span>
                  <input
                    type="text"
                    {...form.register('title')}
                    className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500"
                  />
                  {form.formState.errors.title && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.title.message}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-black-900">설명</span>
                  <textarea
                    {...form.register('description')}
                    rows={2}
                    className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-black-900">우선순위</span>
                  <select
                    {...form.register('priority')}
                    className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500"
                  >
                    <option value="high">높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </label>
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
                  <span className="text-sm text-black-900">Epic</span>
                  <select
                    {...form.register('epicId')}
                    disabled={epicSelectDisabled}
                    className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500 disabled:bg-gray-50 disabled:text-lavender-gray-300"
                  >
                    <option value="">
                      {epicSelectDisabled ? '먼저 분류를 선택해주세요' : 'Epic 을 선택해주세요'}
                    </option>
                    {!epicSelectDisabled &&
                      epics?.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                  </select>
                  {form.formState.errors.epicId && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.epicId.message}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-black-900">기한</span>
                  <input
                    type="date"
                    {...form.register('dueDate')}
                    className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500"
                  />
                </label>
                <div className="mt-2 flex justify-between gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white"
                    onClick={() => setConfirmOpen(true)}
                  >
                    삭제
                  </button>
                  <div className="flex gap-2">
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
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="이 할 일을 삭제할까요?"
        description="이 작업은 되돌릴 수 없어요."
        onConfirm={onConfirmDelete}
        loading={remove.isPending}
      />
    </>
  );
}
