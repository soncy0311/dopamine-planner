'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useCategories,
  useDeleteEpic,
  useEpics,
  type Category,
  type EpicIssue,
  type Workspace,
} from '@todo-list/core';
import { EpicProgressBar } from '@todo-list/ui';
import { supabase } from '@/lib/supabase/client';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';
import { EpicFormModal } from './modals/EpicFormModal';
import { ConfirmDeleteDialog } from './modals/ConfirmDeleteDialog';

type EditingEpic = {
  id: string;
  categoryId: string;
  title: string;
  description?: string | null;
};

const WORKSPACE_LABEL: Record<Workspace, string> = {
  life: '라이프',
  work: '워크',
};

type EpicSubsCount = { total: number; done: number; subIds: string[] };

function useEpicSubs(epicIds: string[]) {
  return useQuery({
    queryKey: ['epicSubs', epicIds.slice().sort().join(',')],
    queryFn: async (): Promise<Record<string, EpicSubsCount>> => {
      if (epicIds.length === 0) return {};
      const { data, error } = await supabase
        .from('sub_issue')
        .select('id, epic_id, status')
        .in('epic_id', epicIds);
      if (error) throw error;
      const out: Record<string, EpicSubsCount> = {};
      for (const id of epicIds) out[id] = { total: 0, done: 0, subIds: [] };
      for (const row of data ?? []) {
        const r = row as { id: string; epic_id: string; status: string };
        const bucket = out[r.epic_id];
        if (!bucket) continue;
        bucket.total += 1;
        bucket.subIds.push(r.id);
        if (r.status === 'done') bucket.done += 1;
      }
      return out;
    },
    enabled: epicIds.length > 0,
  });
}

function useToggleEpicAllSubs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { subIds: string[]; nextStatus: 'todo' | 'done' }) => {
      if (input.subIds.length === 0) return;
      const completed_date =
        input.nextStatus === 'done' ? new Date().toISOString().slice(0, 10) : null;
      const { error } = await supabase
        .from('sub_issue')
        .update({ status: input.nextStatus, completed_date })
        .in('id', input.subIds);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['epics'] });
      qc.invalidateQueries({ queryKey: ['epicSubs'] });
    },
  });
}

export function EpicsView({ workspace }: { workspace: Workspace }) {
  const { data: categories } = useCategories({ client: supabase, workspace });
  const { data: epics, isLoading } = useEpics({ client: supabase, workspace });
  const remove = useDeleteEpic({ client: supabase });
  const toggleAll = useToggleEpicAllSubs();

  const epicIds = useMemo(() => (epics ?? []).map((e) => e.id), [epics]);
  const { data: subs } = useEpicSubs(epicIds);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EditingEpic | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, EpicIssue[]> = {};
    for (const e of epics ?? []) {
      const cid = e.categoryId;
      (map[cid] ??= []).push(e);
    }
    return map;
  }, [epics]);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (e: EpicIssue) => {
    setEditing({
      id: e.id,
      categoryId: e.categoryId,
      title: e.title,
      description: e.description,
    });
    setFormOpen(true);
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync({ id: deleteId });
      toast.success('Epic 이 삭제되었어요');
      setDeleteId(null);
    } catch (err) {
      showFkOrDefaultError(
        err,
        'Epic 에 하위 할 일이 있어 삭제할 수 없어요. 먼저 할 일을 정리해주세요.',
      );
    }
  };

  const onToggleAll = async (epicId: string) => {
    const bucket = subs?.[epicId];
    if (!bucket || bucket.total === 0) {
      toast.info('이 Epic 에 할 일이 없어요.');
      return;
    }
    const allDone = bucket.done === bucket.total;
    const nextStatus = allDone ? 'todo' : 'done';
    try {
      await toggleAll.mutateAsync({ subIds: bucket.subIds, nextStatus });
      toast.success(allDone ? '모두 진행 중으로 변경했어요' : '모두 완료했어요');
    } catch (err) {
      showFkOrDefaultError(err, '일괄 변경에 실패했어요.');
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-black-900">
          Epic 관리 ({WORKSPACE_LABEL[workspace]})
        </h1>
        <button
          type="button"
          className="rounded-md bg-purple-500 px-3 py-2 text-sm font-medium text-white"
          onClick={openCreate}
        >
          Epic 추가
        </button>
      </header>
      {isLoading ? (
        <p className="text-sm text-periwinkle-300">불러오는 중…</p>
      ) : !epics || epics.length === 0 ? (
        <p className="text-sm text-periwinkle-300">아직 Epic 이 없어요. 추가해보세요.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {(categories ?? []).map((c: Category) => {
            const list = grouped[c.id] ?? [];
            if (list.length === 0) return null;
            return (
              <section key={c.id} className="flex flex-col gap-2">
                <h2 className="flex items-center gap-2 text-sm font-medium text-black-900">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: c.color || '#94A3B8' }}
                    aria-hidden="true"
                  />
                  {c.name}
                </h2>
                <ul className="flex flex-col gap-2">
                  {list.map((e) => {
                    const bucket = subs?.[e.id];
                    const total = bucket?.total ?? 0;
                    const done = bucket?.done ?? 0;
                    const checked = total > 0 && done === total;
                    return (
                      <li
                        key={e.id}
                        className="flex items-center gap-3 rounded-md border border-lavender-gray-300 bg-white px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          ref={(el) => {
                            if (el) el.indeterminate = total > 0 && done > 0 && done < total;
                          }}
                          onChange={() => onToggleAll(e.id)}
                          aria-label={`${e.title} 전체 완료 토글`}
                          className="h-4 w-4 cursor-pointer"
                        />
                        <span className="flex-1 text-sm text-black-900">{e.title}</span>
                        <span className="w-32">
                          <EpicProgressBar total={total} done={done} />
                        </span>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-indigo-600 hover:bg-gray-50"
                          onClick={() => openEdit(e)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-gray-50"
                          onClick={() => setDeleteId(e.id)}
                        >
                          삭제
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
      <EpicFormModal
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
        title="이 Epic 을 삭제할까요?"
        description="이 Epic 에 연결된 할 일이 있으면 삭제할 수 없어요."
        onConfirm={onDelete}
        loading={remove.isPending}
      />
    </div>
  );
}
