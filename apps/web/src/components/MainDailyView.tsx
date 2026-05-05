'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  cascadeToggleEpic,
  groupByEpic,
  queryKeys,
  subscribeTodos,
  useCategories,
  useEpics,
  useTodos,
  useToggleTodo,
  type EpicIssue,
  type SubIssueWithJoins,
  type Workspace,
} from '@todo-list/core';
import { DateNavigator, EpicAccordionCard, FAB, TodoItem } from '@todo-list/ui';
import { supabase } from '@/lib/supabase/client';
import { useDateQuery } from '@/hooks/useDateQuery';
import { CategoryFilterChips } from './CategoryFilterChips';
import { CreateTodoModal } from './modals/CreateTodoModal';
import { TodoDetailModal } from './modals/TodoDetailModal';

export type MainDailyViewProps = {
  workspace: Workspace;
};

const EXPAND_STORAGE_PREFIX = 'epic-accordion-expand:';

function readExpandState(workspace: Workspace): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(`${EXPAND_STORAGE_PREFIX}${workspace}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, boolean>)
      : {};
  } catch {
    return {};
  }
}

function writeExpandState(workspace: Workspace, state: Record<string, boolean>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      `${EXPAND_STORAGE_PREFIX}${workspace}`,
      JSON.stringify(state),
    );
  } catch {
    /* quota / disabled storage — silently ignore */
  }
}

export function MainDailyView({ workspace }: MainDailyViewProps) {
  const qc = useQueryClient();
  const [date, setDate] = useDateQuery();

  useEffect(() => subscribeTodos(supabase, qc), [qc]);

  const { data, isLoading } = useTodos({ client: supabase, workspace, date });
  const { data: categories = [] } = useCategories({ client: supabase, workspace });
  const { data: epics = [] } = useEpics({ client: supabase, workspace });
  const toggle = useToggleTodo(supabase);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailTodoId, setDetailTodoId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [expand, setExpand] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpand(readExpandState(workspace));
  }, [workspace]);

  const filterByCategory = useCallback(
    (items: SubIssueWithJoins[]) =>
      selectedCategoryId === null
        ? items
        : items.filter((t) => t.category?.id === selectedCategoryId),
    [selectedCategoryId],
  );

  const todoItems = useMemo(
    () => filterByCategory(data?.todo ?? []),
    [data?.todo, filterByCategory],
  );
  const doneItems = useMemo(
    () => filterByCategory(data?.done ?? []),
    [data?.done, filterByCategory],
  );

  const allItems = useMemo(
    () => [...todoItems, ...doneItems],
    [todoItems, doneItems],
  );

  const grouped = useMemo(() => groupByEpic(allItems, epics), [allItems, epics]);

  const epicsByDoneSection = useMemo(() => {
    const todoSection: typeof grouped.epics = [];
    const doneSection: typeof grouped.epics = [];
    for (const entry of grouped.epics) {
      if (entry.epic.progress >= 1) doneSection.push(entry);
      else todoSection.push(entry);
    }
    return { todo: todoSection, done: doneSection };
  }, [grouped.epics]);

  const standaloneTodo = useMemo(
    () => grouped.standalone.filter((s) => s.status === 'todo'),
    [grouped.standalone],
  );
  const standaloneDone = useMemo(
    () => grouped.standalone.filter((s) => s.status === 'done'),
    [grouped.standalone],
  );

  const categoryById = useMemo(() => {
    const m = new Map<string, { id: string; name: string; color: string }>();
    for (const c of categories) m.set(c.id, { id: c.id, name: c.name, color: c.color });
    return m;
  }, [categories]);

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

  const handleToggleExpand = (epicId: string) => {
    setExpand((prev) => {
      const next = { ...prev, [epicId]: !prev[epicId] };
      writeExpandState(workspace, next);
      return next;
    });
  };

  const handleCascadeToggle = async (epic: EpicIssue, subs: SubIssueWithJoins[]) => {
    const allDone = subs.length > 0 && subs.every((s) => s.status === 'done');
    const target: 'todo' | 'done' = allDone ? 'todo' : 'done';
    try {
      await cascadeToggleEpic(
        supabase,
        { id: epic.id },
        subs.map((s) => ({ id: s.id, status: s.status })),
        target,
      );
    } finally {
      qc.invalidateQueries({ queryKey: queryKeys.todos(workspace, date) });
      qc.invalidateQueries({ queryKey: queryKeys.epics(workspace) });
    }
  };

  const renderEpicCard = (entry: { epic: EpicIssue; subs: SubIssueWithJoins[] }) => {
    const { epic, subs } = entry;
    const cat = categoryById.get(epic.categoryId);
    const total = subs.length;
    const doneCount = subs.filter((s) => s.status === 'done').length;
    const progressPercent =
      total > 0
        ? Math.round((doneCount / total) * 100)
        : Math.round(Math.max(0, Math.min(1, epic.progress)) * 100);
    const mainStatus: 'todo' | 'done' = epic.progress >= 1 ? 'done' : 'todo';

    return (
      <EpicAccordionCard
        key={epic.id}
        epicId={epic.id}
        title={epic.title}
        progressPercent={progressPercent}
        segments={subs.map((s) => ({ filled: s.status === 'done' }))}
        category={cat ? { name: cat.name, color: cat.color } : undefined}
        expanded={!!expand[epic.id]}
        onToggleExpand={() => handleToggleExpand(epic.id)}
        onMainToggle={() => void handleCascadeToggle(epic, subs)}
        mainStatus={mainStatus}
        subIssues={subs.map((s) => ({
          id: s.id,
          title: s.title,
          status: s.status,
          priority: s.priority,
          carryOverCount: s.carryOverCount,
          category: s.category
            ? { name: s.category.name, color: s.category.color }
            : undefined,
          onToggle: () => handleToggle(s),
          onPress: () => handlePress(s),
        }))}
      />
    );
  };

  const todoSectionEmpty =
    epicsByDoneSection.todo.length === 0 && standaloneTodo.length === 0;
  const doneSectionEmpty =
    epicsByDoneSection.done.length === 0 && standaloneDone.length === 0;

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4">
      <DateNavigator date={date} onChange={setDate} />
      <CategoryFilterChips
        categories={categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />
      {isLoading ? (
        <p className="px-2 text-sm text-periwinkle-300">불러오는 중…</p>
      ) : (
        <div className="flex flex-1 flex-col gap-6">
          <section className="flex flex-col gap-2">
            <header className="flex items-center justify-between px-2">
              <h3 className="text-sm font-semibold text-black-900">
                진행 중 (
                {epicsByDoneSection.todo.length + standaloneTodo.length})
              </h3>
            </header>
            {todoSectionEmpty ? (
              <p className="px-2 py-3 text-sm text-periwinkle-300">진행 중인 일이 없어요</p>
            ) : (
              <div className="flex flex-col gap-2">
                {epicsByDoneSection.todo.map(renderEpicCard)}
                {standaloneTodo.length > 0 ? (
                  <ul className="flex flex-col">
                    {standaloneTodo.map((item) => (
                      <li key={item.id}>
                        <TodoItem
                          id={item.id}
                          title={item.title}
                          status="todo"
                          priority={item.priority}
                          carryOverCount={item.carryOverCount}
                          category={
                            item.category
                              ? { name: item.category.name, color: item.category.color }
                              : undefined
                          }
                          onToggle={() => handleToggle(item)}
                          onPress={() => handlePress(item)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-2 opacity-50">
            <header className="flex items-center justify-between px-2">
              <h3 className="text-sm font-semibold text-black-900">
                완료 (
                {epicsByDoneSection.done.length + standaloneDone.length})
              </h3>
            </header>
            {doneSectionEmpty ? (
              <p className="px-2 py-3 text-sm text-periwinkle-300">완료된 일이 없어요</p>
            ) : (
              <div className="flex flex-col gap-2">
                {epicsByDoneSection.done.map(renderEpicCard)}
                {standaloneDone.length > 0 ? (
                  <ul className="flex flex-col">
                    {standaloneDone.map((item) => (
                      <li key={item.id}>
                        <TodoItem
                          id={item.id}
                          title={item.title}
                          status="done"
                          priority={item.priority}
                          carryOverCount={item.carryOverCount}
                          category={
                            item.category
                              ? { name: item.category.name, color: item.category.color }
                              : undefined
                          }
                          onToggle={() => handleToggle(item)}
                          onPress={() => handlePress(item)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </section>
        </div>
      )}
      <FAB onClick={handleCreate} ariaLabel="새 일 추가" className="!bottom-24 md:!bottom-6" />
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
