'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  useCategories,
  useDeleteCategory,
  type Category,
  type Workspace,
} from '@todo-list/core';
import { supabase } from '@/lib/supabase/client';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';
import { CategoryFormModal } from './modals/CategoryFormModal';
import { ConfirmDeleteDialog } from './modals/ConfirmDeleteDialog';

type EditingCategory = { id: string; name: string; color: string };

const WORKSPACE_LABEL: Record<Workspace, string> = {
  life: '라이프',
  work: '워크',
};

export function CategoriesView({ workspace }: { workspace: Workspace }) {
  const { data: categories, isLoading } = useCategories({ client: supabase, workspace });
  const remove = useDeleteCategory({ client: supabase });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EditingCategory | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing({ id: c.id, name: c.name, color: c.color });
    setFormOpen(true);
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync({ id: deleteId, workspace });
      toast.success('분류가 삭제되었어요');
      setDeleteId(null);
    } catch (err) {
      showFkOrDefaultError(
        err,
        '이 분류에 Epic 이 있어 삭제할 수 없어요. 먼저 Epic 을 정리해주세요.',
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-black-900">
          분류 관리 ({WORKSPACE_LABEL[workspace]})
        </h1>
        <button
          type="button"
          className="rounded-md bg-purple-500 px-3 py-2 text-sm font-medium text-white"
          onClick={openCreate}
        >
          분류 추가
        </button>
      </header>
      {isLoading ? (
        <p className="text-sm text-periwinkle-300">불러오는 중…</p>
      ) : !categories || categories.length === 0 ? (
        <p className="text-sm text-periwinkle-300">아직 분류가 없어요. 추가해보세요.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-md border border-lavender-gray-300 bg-white px-3 py-2"
            >
              <span className="flex items-center gap-3">
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: c.color || '#94A3B8' }}
                  aria-hidden="true"
                />
                <span className="text-sm text-black-900">{c.name}</span>
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-xs text-indigo-600 hover:bg-gray-50"
                  onClick={() => openEdit(c)}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-gray-50"
                  onClick={() => setDeleteId(c.id)}
                >
                  삭제
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <CategoryFormModal
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(undefined);
        }}
        workspace={workspace}
        initial={editing}
      />
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
        title="이 분류를 삭제할까요?"
        description="이 분류에 연결된 Epic 이 있으면 삭제할 수 없어요."
        onConfirm={onDelete}
        loading={remove.isPending}
      />
    </div>
  );
}
