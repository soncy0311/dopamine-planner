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
import {
  DateNavigator,
  EmptyState,
  IssueCardAccordion,
  FAB,
  Spinner,
  TodoItem,
} from '@todo-list/ui';
import { supabase } from '@/lib/supabase/client';
import { useDateQuery } from '@/hooks/useDateQuery';
import { CategoryFilterChips } from './CategoryFilterChips';
import { EpicFormModal } from './modals/EpicFormModal';
import { EpicDetailModal } from './modals/EpicDetailModal';
import { SubIssueFormModal } from './modals/SubIssueFormModal';
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

  const [epicFormOpen, setEpicFormOpen] = useState(false);
  const [subFormEpic, setSubFormEpic] = useState<{ id: string; title: string } | null>(null);
  const [detailTodoId, setDetailTodoId] = useState<string | null>(null);
  const [detailEpicId, setDetailEpicId] = useState<string | null>(null);
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
      // sub 상태 기반 즉시 판정 (서버 progress 갱신 RPC 대기 회피).
      // sub 가 0개인 경우 epic.status 자체를 기준으로 분류 (수동 완료 지원).
      const total = entry.subs.length;
      const doneCount = entry.subs.filter((s) => s.status === 'done').length;
      const isAllDone =
        total > 0 ? doneCount === total : entry.epic.status === 'completed';
      if (isAllDone) doneSection.push(entry);
      else todoSection.push(entry);
    }
    // 우선순위 정렬 (high → medium → low). 동일 priority 내 입력 순서 유지 (stable sort).
    const PRIORITY_ORDER: Record<'high' | 'medium' | 'low', number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    const byPriority = (
      a: { epic: EpicIssue },
      b: { epic: EpicIssue },
    ): number => PRIORITY_ORDER[a.epic.priority] - PRIORITY_ORDER[b.epic.priority];
    todoSection.sort(byPriority);
    doneSection.sort(byPriority);
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

  // 필터 칩에는 현재 워크스페이스의 Epic 이 실제로 참조하는 분류만 노출 (빈 분류 숨김).
  const visibleCategories = useMemo(() => {
    const used = new Set(epics.map((e) => e.categoryId));
    return categories.filter((c) => used.has(c.id));
  }, [categories, epics]);

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
    setEpicFormOpen(true);
  };

  const handleAddSubIssue = (epic: EpicIssue) => {
    setSubFormEpic({ id: epic.id, title: epic.title });
  };

  const handleToggleExpand = (epicId: string) => {
    setExpand((prev) => {
      const next = { ...prev, [epicId]: !prev[epicId] };
      writeExpandState(workspace, next);
      return next;
    });
  };

  const handleCascadeToggle = async (epic: EpicIssue, subs: SubIssueWithJoins[]) => {
    // sub 가 0개일 땐 epic.status 자체로 토글 방향 결정.
    const target: 'todo' | 'done' =
      subs.length === 0
        ? epic.status === 'completed'
          ? 'todo'
          : 'done'
        : subs.every((s) => s.status === 'done')
          ? 'todo'
          : 'done';
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
    // mainStatus 도 sub 상태 기반 (optimistic update 즉시 반영).
    // sub 0개일 땐 epic.status 자체를 기준으로 ('completed' → 'done').
    const mainStatus: 'todo' | 'done' =
      total > 0
        ? doneCount === total
          ? 'done'
          : 'todo'
        : epic.status === 'completed'
          ? 'done'
          : 'todo';

    return (
      <IssueCardAccordion
        key={epic.id}
        epicId={epic.id}
        title={epic.title}
        progressPercent={progressPercent}
        segments={subs.map((s) => ({ filled: s.status === 'done' }))}
        category={cat ? { name: cat.name, color: cat.color } : undefined}
        priority={epic.priority}
        expanded={!!expand[epic.id]}
        onToggleExpand={() => handleToggleExpand(epic.id)}
        onMainToggle={() => void handleCascadeToggle(epic, subs)}
        mainStatus={mainStatus}
        onAddSubIssue={() => handleAddSubIssue(epic)}
        onTitlePress={() => setDetailEpicId(epic.id)}
        subIssues={subs.map((s) => ({
          id: s.id,
          title: s.title,
          status: s.status,
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <CategoryFilterChips
            categories={visibleCategories.map((c) => ({ id: c.id, name: c.name }))}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="hidden h-9 shrink-0 items-center rounded-md bg-purple-500 px-4 text-sm font-medium text-white transition-colors hover:bg-purple-600 md:inline-flex"
        >
          + 추가
        </button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner variant="inline" size="md" />
        </div>
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
              <EmptyState
                title="아직 할 일이 없어요"
                description="할 일을 등록해보세요"
                action={{ label: '+ 추가', onClick: handleCreate }}
              />
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
              <EmptyState title="완료된 일이 없어요" />
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
      <FAB
        onClick={handleCreate}
        ariaLabel="새 일 추가"
        className="!bottom-24 md:!hidden"
      />
      <EpicFormModal
        open={epicFormOpen}
        onOpenChange={setEpicFormOpen}
        workspace={workspace}
        defaultRegisteredDate={date}
      />
      {subFormEpic && (
        <SubIssueFormModal
          open
          onOpenChange={(o) => {
            if (!o) setSubFormEpic(null);
          }}
          epicId={subFormEpic.id}
          epicTitle={subFormEpic.title}
          defaultRegisteredDate={date}
        />
      )}
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
      {detailEpicId && (
        <EpicDetailModal
          open
          onOpenChange={(o) => {
            if (!o) setDetailEpicId(null);
          }}
          workspace={workspace}
          epicId={detailEpicId}
        />
      )}
    </div>
  );
}
