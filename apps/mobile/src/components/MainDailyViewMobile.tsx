import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  subscribeTodos,
  useTodos,
  useToggleTodo,
  type SubIssueWithJoins,
  type Workspace,
} from '@todo-list/core';
import { supabase } from '@/lib/supabase';
import { DateHeaderMobile } from './DateHeaderMobile';
import { TodoItem } from './TodoItem';

type Props = { workspace: Workspace };

type Row =
  | { type: 'header'; key: string; label: string }
  | { type: 'item'; key: string; todo: SubIssueWithJoins };

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

  useEffect(() => {
    const unsub = subscribeTodos(supabase, qc);
    return () => unsub();
  }, [qc]);

  const { data, isLoading } = useTodos({ client: supabase, workspace, date });
  const toggle = useToggleTodo(supabase);

  const handleToggle = (item: SubIssueWithJoins) => {
    toggle.mutate({
      id: item.id,
      epicId: item.epicId,
      nextStatus: item.status === 'done' ? 'todo' : 'done',
    });
  };

  const handlePress = (item: SubIssueWithJoins) => {
    router.push(`/todo/${item.id}?workspace=${workspace}`);
  };

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

  const rows: Row[] = [
    { type: 'header', key: 'h-todo', label: `진행 중 (${todoList.length})` },
    ...todoList.map<Row>((t) => ({ type: 'item', key: `t-${t.id}`, todo: t })),
    { type: 'header', key: 'h-done', label: `완료 (${doneList.length})` },
    ...doneList.map<Row>((t) => ({ type: 'item', key: `d-${t.id}`, todo: t })),
  ];

  return (
    <GestureDetector gesture={swipe}>
      <View className="flex-1 bg-background">
        <DateHeaderMobile date={date} onDateChange={setDate} />
        {isLoading ? (
          <Text className="px-4 py-3 text-sm text-muted-foreground">불러오는 중…</Text>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(row) => row.key}
            renderItem={({ item }) =>
              item.type === 'header' ? (
                <Text className="bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
                  {item.label}
                </Text>
              ) : (
                <TodoItem todo={item.todo} onToggle={handleToggle} onPress={handlePress} />
              )
            }
          />
        )}
        <Pressable
          onPress={() =>
            router.push(`/create-todo?workspace=${workspace}&date=${date}`)
          }
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
