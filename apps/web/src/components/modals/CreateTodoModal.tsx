'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import {
  useCategories,
  useCreateTodo,
  useEpics,
  type Workspace,
} from '@todo-list/core';
import { TodoFormSchema, type TodoFormValues } from '@/lib/forms/schemas';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';
import { supabase } from '@/lib/supabase/client';
import { Combobox } from '@/components/ui/Combobox';
import { PriorityRadioGroup } from '@/components/ui/PriorityRadioGroup';

type CreateTodoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  defaultDate: string;
};

const EMPTY_UUID = '' as unknown as string;

export function CreateTodoModal({
  open,
  onOpenChange,
  workspace,
  defaultDate,
}: CreateTodoModalProps) {
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(TodoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      categoryId: EMPTY_UUID,
      epicId: EMPTY_UUID,
      dueDate: defaultDate,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        description: '',
        priority: 'medium',
        categoryId: EMPTY_UUID,
        epicId: EMPTY_UUID,
        dueDate: defaultDate,
      });
    }
  }, [open, defaultDate, form]);

  const categoryId = form.watch('categoryId');

  const { data: categories } = useCategories({ client: supabase, workspace });
  const { data: epics } = useEpics(
    categoryId ? { client: supabase, categoryId } : { client: supabase, workspace },
  );

  const prevCategoryRef = useRef(categoryId);
  useEffect(() => {
    if (prevCategoryRef.current !== categoryId) {
      form.setValue('epicId', EMPTY_UUID);
      prevCategoryRef.current = categoryId;
    }
  }, [categoryId, form]);

  const create = useCreateTodo({ client: supabase });
  const submitting = form.formState.isSubmitting || create.isPending;

  const onSubmit = async (values: TodoFormValues) => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        toast.error('로그인 세션이 만료되었어요. 다시 로그인 해주세요.');
        return;
      }
      await create.mutateAsync({
        user_id: userRes.user.id,
        epic_id: values.epicId,
        title: values.title,
        description: values.description ?? null,
        priority: values.priority,
        due_date: values.dueDate,
      });
      toast.success('할 일이 생성되었어요');
      onOpenChange(false);
    } catch (err) {
      showFkOrDefaultError(err, '할 일 저장에 실패했어요.');
    }
  };

  const epicSelectDisabled = !categoryId;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black-900/40" />
        <Dialog.Content className="fixed inset-0 bg-white p-6 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg">
          <Dialog.Title className="text-lg font-semibold text-black-900">새 할 일</Dialog.Title>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-black-900">제목</span>
              <input
                type="text"
                {...form.register('title')}
                className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500"
                placeholder="할 일 제목"
                autoFocus
              />
              {form.formState.errors.title && (
                <span className="text-xs text-red-500">{form.formState.errors.title.message}</span>
              )}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-black-900">설명 (선택)</span>
              <textarea
                {...form.register('description')}
                rows={2}
                className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500"
              />
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-black-900">우선순위</span>
              <PriorityRadioGroup
                value={form.watch('priority')}
                onChange={(p) => form.setValue('priority', p, { shouldDirty: true })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-black-900">분류</span>
              <Combobox
                ariaLabel="분류"
                options={categories ?? []}
                value={(categories ?? []).find((c) => c.id === categoryId) ?? null}
                onChange={(c) =>
                  form.setValue('categoryId', c ? c.id : EMPTY_UUID, { shouldDirty: true })
                }
                getId={(c) => c.id}
                getLabel={(c) => c.name}
                placeholder="분류를 선택해주세요"
              />
              {form.formState.errors.categoryId && (
                <span className="text-xs text-red-500">
                  {form.formState.errors.categoryId.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-black-900">Epic</span>
              {epicSelectDisabled ? (
                <p className="rounded-md border border-lavender-gray-300 bg-gray-50 px-3 py-2 text-sm text-lavender-gray-300">
                  먼저 분류를 선택해주세요
                </p>
              ) : (
                <Combobox
                  ariaLabel="Epic"
                  options={epics ?? []}
                  value={(epics ?? []).find((e) => e.id === form.watch('epicId')) ?? null}
                  onChange={(e) =>
                    form.setValue('epicId', e ? e.id : EMPTY_UUID, { shouldDirty: true })
                  }
                  getId={(e) => e.id}
                  getLabel={(e) => e.title}
                  placeholder="Epic 을 선택해주세요"
                />
              )}
              {form.formState.errors.epicId && (
                <span className="text-xs text-red-500">
                  {form.formState.errors.epicId.message}
                </span>
              )}
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-black-900">등록일</span>
              <input
                type="date"
                {...form.register('dueDate')}
                className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 outline-none focus:border-purple-500"
              />
              {form.formState.errors.dueDate && (
                <span className="text-xs text-red-500">
                  {form.formState.errors.dueDate.message}
                </span>
              )}
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
