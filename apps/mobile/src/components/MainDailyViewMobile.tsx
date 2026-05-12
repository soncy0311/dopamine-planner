import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { supabase } from '@/lib/supabase';
import { DateHeaderMobile } from './DateHeaderMobile';
import { TodoItem } from './TodoItem';
import { IssueCardAccordion } from './IssueCardAccordion';
import { EmptyState } from './EmptyState';
import { Spinner } from './Spinner';

type Props = { workspace: Workspace };

type CategoryFilterValue =
  | { kind: 'all' }
  | { kind: 'uncategorized' }
  | { kind: 'category'; id: string };

type Row =
  | { type: 'header'; key: string; label: string }
  | { type: 'item'; key: string; todo: SubIssueWithJoins }
  | {
      type: 'epic';
      key: string;
      epic: EpicIssue;
      subs: SubIssueWithJoins[];
      category?: { name: string; color: string };
    };

const EXPAND_STORAGE_PREFIX = 'epic-accordion-expand:';

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function MainDailyViewMobile({ workspace }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const [date, setDate] = useState<string>(() => todayIso());
  const [expand, setExpand] = useState<Record<string, boolean>>({});
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>({
    kind: 'all',
  });

  useEffect(() => {
    const unsub = subscribeTodos(supabase, qc);
    return () => unsub();
  }, [qc]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(`${EXPAND_STORAGE_PREFIX}${workspace}`)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          const parsed = JSON.parse(raw) as unknown;
          if (parsed && typeof parsed === 'object') {
            setExpand(parsed as Record<string, boolean>);
          }
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, [workspace]);

  const { data, isLoading } = useTodos({ client: supabase, workspace, date });
  const { data: categories = [] } = useCategories({ client: supabase, workspace });
  const { data: epics = [] } = useEpics({ client: supabase, workspace });
  const toggle = useToggleTodo(supabase);

  const handleToggle = useCallback(
    (item: SubIssueWithJoins) => {
      toggle.mutate({
        id: item.id,
        epicId: item.epicId,
        nextStatus: item.status === 'done' ? 'todo' : 'done',
      });
    },
    [toggle],
  );

  const handlePress = useCallback(
    (item: SubIssueWithJoins) => {
      router.push(`/todo/${item.id}?workspace=${workspace}`);
    },
    [router, workspace],
  );

  const handleToggleExpand = useCallback(
    (epicId: string, currentExpanded: boolean) => {
      setExpand((prev) => {
        const next = { ...prev, [epicId]: !currentExpanded };
        AsyncStorage.setItem(
          `${EXPAND_STORAGE_PREFIX}${workspace}`,
          JSON.stringify(next),
        ).catch(() => {
          /* ignore */
        });
        return next;
      });
    },
    [workspace],
  );

  const handleEditEpic = useCallback(
    (epic: EpicIssue) => {
      router.push(`/epic-form?id=${epic.id}&workspace=${workspace}`);
    },
    [router, workspace],
  );

  const handleCascadeToggle = useCallback(
    async (epic: EpicIssue, subs: SubIssueWithJoins[]) => {
      // sub 0개일 땐 epic.status 자체로 토글 방향 결정 (web 과 동일).
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
    },
    [qc, workspace, date],
  );

  const goPrev = () => setDate((d) => shiftDate(d, -1));
  const goNext = () => setDate((d) => shiftDate(d, 1));

  const swipe = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20])
        .onEnd((e) => {
          'worklet';
          if (e.translationX > 80) runOnJS(goPrev)();
          else if (e.translationX < -80) runOnJS(goNext)();
        }),
    [],
  );

  const todoList = data?.todo ?? [];
  const doneList = data?.done ?? [];

  const categoryById = useMemo(() => {
    const m = new Map<string, { id: string; name: string; color: string }>();
    for (const c of categories) m.set(c.id, { id: c.id, name: c.name, color: c.color });
    return m;
  }, [categories]);

  const visibleCategories = useMemo(() => {
    const used = new Set(epics.map((e) => e.categoryId));
    return categories.filter((c) => used.has(c.id));
  }, [categories, epics]);

  const hasUncategorizedEpics = useMemo(
    () => epics.some((e) => e.categoryId === null),
    [epics],
  );

  // 노출 정책: 진행 중 = 활성 Epic / 완료 = 본 일자 완료 Epic. (sub-prd-10 §일자 뷰 정합)
  const visibleEpics = useMemo(() => {
    return epics.filter((e) => {
      if (categoryFilter.kind === 'category' && e.categoryId !== categoryFilter.id) {
        return false;
      }
      if (categoryFilter.kind === 'uncategorized' && e.categoryId !== null) {
        return false;
      }
      if (e.status === 'active') return true;
      if (e.status === 'completed' && e.completedDate === date) return true;
      return false;
    });
  }, [epics, date, categoryFilter]);

  const grouped = useMemo(
    () => groupByEpic([...todoList, ...doneList], visibleEpics),
    [todoList, doneList, visibleEpics],
  );

  const epicSections = useMemo(() => {
    const todoSec: { epic: EpicIssue; subs: SubIssueWithJoins[] }[] = [];
    const doneSec: { epic: EpicIssue; subs: SubIssueWithJoins[] }[] = [];
    for (const entry of grouped.epics) {
      if (entry.epic.status === 'completed') doneSec.push(entry);
      else todoSec.push(entry);
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
    todoSec.sort(byPriority);
    doneSec.sort(byPriority);
    return { todo: todoSec, done: doneSec };
  }, [grouped.epics]);

  const standaloneTodo = useMemo(
    () => grouped.standalone.filter((s) => s.status === 'todo'),
    [grouped.standalone],
  );
  const standaloneDone = useMemo(
    () => grouped.standalone.filter((s) => s.status === 'done'),
    [grouped.standalone],
  );

  const buildEpicRow = (entry: { epic: EpicIssue; subs: SubIssueWithJoins[] }): Row => {
    const cat = entry.epic.categoryId ? categoryById.get(entry.epic.categoryId) : null;
    return {
      type: 'epic',
      key: `e-${entry.epic.id}`,
      epic: entry.epic,
      subs: entry.subs,
      category: cat
        ? { name: cat.name, color: cat.color }
        : { name: '분류 없음', color: '#9CA3AF' },
    };
  };

  const todoCount = epicSections.todo.length + standaloneTodo.length;
  const doneCount = epicSections.done.length + standaloneDone.length;
  const isEmpty = !isLoading && todoCount === 0 && doneCount === 0;

  const handleCreate = useCallback(() => {
    router.push(`/epic-form?workspace=${workspace}&registeredDate=${date}`);
  }, [router, workspace, date]);

  const handleAddSubIssue = useCallback(
    (epic: EpicIssue) => {
      router.push(
        `/sub-issue-form?epicId=${epic.id}&epicTitle=${encodeURIComponent(epic.title)}&registeredDate=${date}`,
      );
    },
    [router, date],
  );

  const rows: Row[] = [
    { type: 'header', key: 'h-todo', label: `진행 중 (${todoCount})` },
    ...epicSections.todo.map(buildEpicRow),
    ...standaloneTodo.map<Row>((t) => ({ type: 'item', key: `t-${t.id}`, todo: t })),
    { type: 'header', key: 'h-done', label: `완료 (${doneCount})` },
    ...epicSections.done.map(buildEpicRow),
    ...standaloneDone.map<Row>((t) => ({ type: 'item', key: `d-${t.id}`, todo: t })),
  ];

  return (
    <GestureDetector gesture={swipe}>
      <View className="flex-1 bg-background">
        <DateHeaderMobile date={date} onDateChange={setDate} />
        <View className="border-b border-border bg-background px-3 py-2">
          <FlatList
            horizontal
            data={[
              { kind: 'all' as const, label: '전체' },
              ...(hasUncategorizedEpics
                ? [{ kind: 'uncategorized' as const, label: '분류 없음' }]
                : []),
              ...visibleCategories.map((c) => ({
                kind: 'category' as const,
                id: c.id,
                label: c.name,
              })),
            ]}
            keyExtractor={(item) => (item.kind === 'category' ? item.id : item.kind)}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const active =
                item.kind === 'category'
                  ? categoryFilter.kind === 'category' && categoryFilter.id === item.id
                  : categoryFilter.kind === item.kind;
              return (
                <Pressable
                  onPress={() =>
                    setCategoryFilter(
                      item.kind === 'category'
                        ? { kind: 'category', id: item.id }
                        : { kind: item.kind },
                    )
                  }
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className={`mr-2 rounded-full border px-3 py-1.5 ${
                    active ? 'border-primary bg-primary' : 'border-border bg-background'
                  }`}
                >
                  <Text
                    className={active ? 'text-xs text-primary-foreground' : 'text-xs text-foreground'}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <Spinner variant="inline" size="md" />
          </View>
        ) : isEmpty ? (
          <View className="flex-1 items-center justify-center">
            <EmptyState
              title="아직 할 일이 없어요"
              description="할 일을 등록해보세요"
              action={{ label: '+ 추가', onClick: handleCreate }}
            />
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(row) => row.key}
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return (
                  <Text className="bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
                    {item.label}
                  </Text>
                );
              }
              if (item.type === 'epic') {
                const total = item.subs.length;
                const done = item.subs.filter((s) => s.status === 'done').length;
                // mainStatus 도 sub 상태 기반 (optimistic update 즉시 반영).
                // sub 0개일 땐 epic.status 자체를 기준 ('completed' → 'done').
                const mainStatus: 'todo' | 'done' =
                  total > 0
                    ? done === total
                      ? 'done'
                      : 'todo'
                    : item.epic.status === 'completed'
                      ? 'done'
                      : 'todo';
                const expanded = expand[item.epic.id] ?? item.epic.status !== 'completed';
                return (
                  <IssueCardAccordion
                    epicId={item.epic.id}
                    title={item.epic.title}
                    totalSubCount={total}
                    completedSubCount={done}
                    category={item.category}
                    priority={item.epic.priority}
                    expanded={expanded}
                    onToggleExpand={() => handleToggleExpand(item.epic.id, expanded)}
                    onMainToggle={() => void handleCascadeToggle(item.epic, item.subs)}
                    mainStatus={mainStatus}
                    subIssues={item.subs}
                    onSubToggle={handleToggle}
                    onSubPress={handlePress}
                    onAddSubIssue={() => handleAddSubIssue(item.epic)}
                    onTitlePress={() => handleEditEpic(item.epic)}
                  />
                );
              }
              return (
                <TodoItem
                  todo={item.todo}
                  category={
                    item.todo.category
                      ? { name: item.todo.category.name, color: item.todo.category.color }
                      : { name: '분류 없음', color: '#9CA3AF' }
                  }
                  carryOverCount={item.todo.carryOverCount}
                  onToggle={handleToggle}
                  onPress={handlePress}
                />
              );
            }}
          />
        )}
        <Pressable
          onPress={handleCreate}
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
          accessibilityRole="button"
          accessibilityLabel="새 투두 추가"
        >
          <Text className="text-2xl text-primary-foreground">+</Text>
        </Pressable>
      </View>
    </GestureDetector>
  );
}
