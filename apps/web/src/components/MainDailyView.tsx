'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  subscribeTodos,
  useTodos,
  useToggleTodo,
  type SubIssueWithJoins,
  type Workspace,
} from '@todo-list/core';
import { DateNavigator, FAB } from '@todo-list/ui';
import { supabase } from '@/lib/supabase/client';
import { useDateQuery } from '@/hooks/useDateQuery';
import { TodoSection } from './TodoSection';
import { CreateTodoModal } from './modals/CreateTodoModal';
import { TodoDetailModal } from './modals/TodoDetailModal';

export type MainDailyViewProps = {
  workspace: Workspace;
};

export function MainDailyView({ workspace }: MainDailyViewProps) {
  const qc = useQueryClient();
  const [date, setDate] = useDateQuery();

  useEffect(() => subscribeTodos(supabase, qc), [qc]);

  const { data, isLoading } = useTodos({ client: supabase, workspace, date });
  const toggle = useToggleTodo(supabase);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailTodoId, setDetailTodoId] = useState<string | null>(null);

  const handleToggle = (item: SubIssueWithJoins) => {
    toggle.mutate({
      id: item.id,
      epicId: item.epicId,
      nextStatus: item.status === 'done' ? 'todo' : 'done',
    });
  };

  const handlePress = (item: SubIssueWithJoins) => {
    setDetailTodoId(item.id);
  };

  const handleCreate = () => {
    setCreateOpen(true);
  };

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4">
      <DateNavigator date={date} onChange={setDate} />
      {isLoading ? (
        <p className="px-2 text-sm text-periwinkle-300">불러오는 중…</p>
      ) : (
        <div className="flex flex-1 flex-col gap-6">
          <TodoSection
            title="진행 중"
            status="todo"
            items={data?.todo ?? []}
            onToggle={handleToggle}
            onPress={handlePress}
          />
          <TodoSection
            title="완료"
            status="done"
            items={data?.done ?? []}
            onToggle={handleToggle}
            onPress={handlePress}
          />
        </div>
      )}
      <FAB
        onClick={handleCreate}
        ariaLabel="새 일 추가"
        className="md:hidden !bottom-24"
      />
      <CreateTodoModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspace={workspace}
        defaultDate={date}
      />
      {detailTodoId && (
        <TodoDetailModal
          open
          onOpenChange={(o) => {
            if (!o) setDetailTodoId(null);
          }}
          workspace={workspace}
          todoId={detailTodoId}
        />
      )}
    </div>
  );
}
