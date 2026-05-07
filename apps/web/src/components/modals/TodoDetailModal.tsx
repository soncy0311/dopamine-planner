'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { useDeleteTodo, useUpdateTodo, type Workspace } from '@todo-list/core';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';
import { supabase } from '@/lib/supabase/client';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

const SubIssueEditSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내'),
  description: z.string().max(2000, '설명은 2000자 이내').optional(),
  registeredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '유효한 날짜가 아닙니다'),
});
type SubIssueEditValues = z.infer<typeof SubIssueEditSchema>;

type TodoDetailFetch = {
  id: string;
  title: string;
  description: string | null;
  registered_date: string | null;
  epic_id: string;
  epic: { id: string; title: string } | null;
};

async function fetchTodoDetail(todoId: string): Promise<TodoDetailFetch> {
  const { data, error } = await supabase
    .from('sub_issue')
    .select('id, title, description, registered_date, epic_id, epic:epic_issue(id, title)')
    .eq('id', todoId)
    .single();
  if (error) throw error;
  return data as unknown as TodoDetailFetch;
}

type TodoDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  todoId: string;
};

// workspace 는 현재 본 모달 흐름에선 직접 사용하지 않지만, 향후 epic 이동 등을
// 추가할 여지를 두고 prop 시그니처를 유지한다 (호출 측 연쇄 변경 회피).
export function TodoDetailModal({ open, onOpenChange, todoId }: TodoDetailModalProps) {
  const { data: detail } = useQuery({
    queryKey: ['todoDetail', todoId],
    queryFn: () => fetchTodoDetail(todoId),
    enabled: open && !!todoId,
  });

  const form = useForm<SubIssueEditValues>({
    resolver: zodResolver(SubIssueEditSchema),
    defaultValues: {
      title: '',
      description: '',
      registeredDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (!detail) return;
    form.reset({
      title: detail.title,
      description: detail.description ?? '',
      registeredDate:
        detail.registered_date ?? new Date().toISOString().slice(0, 10),
    });
  }, [detail, form]);

  const update = useUpdateTodo({ client: supabase });
  const remove = useDeleteTodo({ client: supabase });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submitting = form.formState.isSubmitting || update.isPending;

  const onSubmit = async (values: SubIssueEditValues) => {
    try {
      await update.mutateAsync({
        id: todoId,
        patch: {
          title: values.title,
          description: values.description?.trim() ? values.description.trim() : null,
          registered_date: values.registeredDate,
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

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black-900/40" />
          <Dialog.Content className="fixed inset-0 flex flex-col gap-4 bg-white p-6 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[480px] sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <header className="flex items-center justify-between">
              <div className="flex flex-col">
                <Dialog.Title className="text-lg font-semibold text-black-900">
                  서브 이슈 수정
                </Dialog.Title>
                {detail?.epic ? (
                  <Dialog.Description className="text-xs text-periwinkle-400">
                    Epic: {detail.epic.title}
                  </Dialog.Description>
                ) : null}
              </div>
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="sub-edit-title" className="text-sm font-medium text-black-900">
                    제목 *
                  </label>
                  <input
                    id="sub-edit-title"
                    type="text"
                    {...form.register('title')}
                    className="rounded-md border border-periwinkle-200 bg-white px-3 py-3 text-sm text-black-900 outline-none focus:border-2 focus:border-purple-500"
                    placeholder="서브 이슈 제목을 입력하세요"
                  />
                  {form.formState.errors.title && (
                    <span className="text-xs text-red-500">{form.formState.errors.title.message}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="sub-edit-desc" className="text-sm font-medium text-black-900">
                    설명
                  </label>
                  <textarea
                    id="sub-edit-desc"
                    {...form.register('description')}
                    rows={3}
                    className="rounded-md border border-periwinkle-200 bg-white px-3 py-3 text-sm text-black-900 outline-none focus:border-2 focus:border-purple-500"
                    placeholder="설명을 입력하세요 (선택)"
                  />
                  {form.formState.errors.description && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.description.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="sub-edit-date" className="text-sm font-medium text-black-900">
                    등록일
                  </label>
                  <input
                    id="sub-edit-date"
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
        title="이 서브 이슈를 삭제할까요?"
        description="이 작업은 되돌릴 수 없어요."
        onConfirm={onConfirmDelete}
        loading={remove.isPending}
      />
    </>
  );
}
