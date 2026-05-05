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
import { EpicAccordionCard } from './EpicAccordionCard';
import { EmptyState } from './EmptyState';
import { Spinner } from './Spinner';

type Props = { workspace: Workspace };

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
    (epicId: string) => {
      setExpand((prev) => {
        const next = { ...prev, [epicId]: !prev[epicId] };
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

  const handleCascadeToggle = useCallback(
    async (epic: EpicIssue, subs: SubIssueWithJoins[]) => {
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

  const grouped = useMemo(
    () => groupByEpic([...todoList, ...doneList], epics),
    [todoList, doneList, epics],
  );

  const epicSections = useMemo(() => {
    const todoSec: { epic: EpicIssue; subs: SubIssueWithJoins[] }[] = [];
    const doneSec: { epic: EpicIssue; subs: SubIssueWithJoins[] }[] = [];
    for (const entry of grouped.epics) {
      if (entry.epic.progress >= 1) doneSec.push(entry);
      else todoSec.push(entry);
    }
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
    const cat = categoryById.get(entry.epic.categoryId);
    return {
      type: 'epic',
      key: `e-${entry.epic.id}`,
      epic: entry.epic,
      subs: entry.subs,
      category: cat ? { name: cat.name, color: cat.color } : undefined,
    };
  };

  const todoCount = epicSections.todo.length + standaloneTodo.length;
  const doneCount = epicSections.done.length + standaloneDone.length;
  const isEmpty = !isLoading && todoCount === 0 && doneCount === 0;

  const handleCreate = useCallback(() => {
    router.push(`/create-todo?workspace=${workspace}&date=${date}`);
  }, [router, workspace, date]);

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
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <Spinner variant="inline" size="md" />
          </View>
        ) : isEmpty ? (
          <View className="flex-1 items-center justify-center">
            <EmptyState
              title="아직 할 일이 없어요"
              description="새 투두를 만들어 시작해보세요"
              action={{ label: '새 투두 만들기', onClick: handleCreate }}
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
                const progressPercent =
                  total > 0
                    ? Math.round((done / total) * 100)
                    : Math.round(
                        Math.max(0, Math.min(1, item.epic.progress)) * 100,
                      );
                const mainStatus: 'todo' | 'done' =
                  item.epic.progress >= 1 ? 'done' : 'todo';
                return (
                  <EpicAccordionCard
                    epicId={item.epic.id}
                    title={item.epic.title}
                    progressPercent={progressPercent}
                    segments={item.subs.map((s) => ({ filled: s.status === 'done' }))}
                    category={item.category}
                    expanded={!!expand[item.epic.id]}
                    onToggleExpand={() => handleToggleExpand(item.epic.id)}
                    onMainToggle={() => void handleCascadeToggle(item.epic, item.subs)}
                    mainStatus={mainStatus}
                    subIssues={item.subs}
                    onSubToggle={handleToggle}
                    onSubPress={handlePress}
                  />
                );
              }
              return (
                <TodoItem todo={item.todo} onToggle={handleToggle} onPress={handlePress} />
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
