'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCreateTodo } from '@todo-list/core';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';
import { supabase } from '@/lib/supabase/client';

const SubIssueFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내'),
  description: z.string().max(2000, '설명은 2000자 이내').optional(),
  registeredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '유효한 날짜가 아닙니다'),
});
type SubIssueFormValues = z.infer<typeof SubIssueFormSchema>;

type SubIssueFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epicId: string;
  epicTitle?: string;
  defaultRegisteredDate: string;
};

export function SubIssueFormModal({
  open,
  onOpenChange,
  epicId,
  epicTitle,
  defaultRegisteredDate,
}: SubIssueFormModalProps) {
  const form = useForm<SubIssueFormValues>({
    resolver: zodResolver(SubIssueFormSchema),
    defaultValues: {
      title: '',
      description: '',
      registeredDate: defaultRegisteredDate,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        description: '',
        registeredDate: defaultRegisteredDate,
      });
    }
  }, [open, defaultRegisteredDate, form]);

  const create = useCreateTodo({ client: supabase });
  const submitting = form.formState.isSubmitting || create.isPending;

  const onSubmit = async (values: SubIssueFormValues) => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        toast.error('로그인 세션이 만료되었어요. 다시 로그인 해주세요.');
        return;
      }
      await create.mutateAsync({
        user_id: userRes.user.id,
        epic_id: epicId,
        title: values.title,
        description: values.description?.trim() ? values.description.trim() : null,
        registered_date: values.registeredDate,
      });
      toast.success('서브 이슈가 생성되었어요');
      onOpenChange(false);
    } catch (err) {
      showFkOrDefaultError(err, '서브 이슈 저장에 실패했어요.');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black-900/40" />
        <Dialog.Content className="fixed inset-0 flex flex-col gap-4 bg-white p-6 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[480px] sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <header className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-black-900">
              서브 이슈 추가
            </Dialog.Title>
            <Dialog.Close
              type="button"
              aria-label="닫기"
              className="flex h-9 w-9 items-center justify-center rounded-md text-periwinkle-400 hover:bg-periwinkle-100"
            >
              ✕
            </Dialog.Close>
          </header>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="sub-epic" className="text-sm font-medium text-black-900">
                상위 Epic
              </label>
              <input
                id="sub-epic"
                type="text"
                value={epicTitle ?? ''}
                readOnly
                aria-readonly="true"
                className="rounded-md border border-periwinkle-200 bg-periwinkle-100 px-3 py-3 text-sm text-periwinkle-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="sub-title" className="text-sm font-medium text-black-900">
                제목 *
              </label>
              <input
                id="sub-title"
                type="text"
                {...form.register('title')}
                className="rounded-md border border-periwinkle-200 bg-white px-3 py-3 text-sm text-black-900 outline-none focus:border-purple-500 focus:border-2"
                placeholder="서브 이슈 제목을 입력하세요"
                autoFocus
              />
              {form.formState.errors.title && (
                <span className="text-xs text-red-500">{form.formState.errors.title.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="sub-desc" className="text-sm font-medium text-black-900">
                설명
              </label>
              <textarea
                id="sub-desc"
                {...form.register('description')}
                rows={3}
                className="rounded-md border border-periwinkle-200 bg-white px-3 py-3 text-sm text-black-900 outline-none focus:border-purple-500 focus:border-2"
                placeholder="설명을 입력하세요 (선택)"
              />
              {form.formState.errors.description && (
                <span className="text-xs text-red-500">
                  {form.formState.errors.description.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="sub-date" className="text-sm font-medium text-black-900">
                등록일
              </label>
              <input
                id="sub-date"
                type="date"
                {...form.register('registeredDate')}
                className="rounded-md border border-periwinkle-200 bg-white px-3 py-3 text-sm text-black-900 outline-none focus:border-purple-500 focus:border-2"
              />
              {form.formState.errors.registeredDate && (
                <span className="text-xs text-red-500">
                  {form.formState.errors.registeredDate.message}
                </span>
              )}
            </div>
            <button
              type="submit"
              className="mt-2 h-11 w-full rounded-md bg-purple-500 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? '저장 중…' : '저장하기'}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
