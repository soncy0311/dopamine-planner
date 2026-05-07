import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useDeleteTodo, useUpdateTodo, type Workspace } from '@todo-list/core';
import { supabase } from '@/lib/supabase';
import { TodoForm } from '@/components/forms/TodoForm';

type TodoDetailFetch = {
  id: string;
  title: string;
  description: string | null;
  registered_date: string | null;
  epic_id: string;
  epic: { id: string; category_id: string } | null;
};

async function fetchTodoDetail(id: string): Promise<TodoDetailFetch> {
  const { data, error } = await supabase
    .from('sub_issue')
    .select(
      'id, title, description, registered_date, epic_id, epic:epic_issue(id, category_id)',
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as TodoDetailFetch;
}

export default function TodoDetailModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; workspace?: string }>();
  const id = params.id as string;
  const workspace = ((params.workspace as Workspace) ?? 'life') as Workspace;
  const [removing, setRemoving] = useState(false);

  const { data: detail } = useQuery({
    queryKey: ['todoDetail', id],
    queryFn: () => fetchTodoDetail(id),
    enabled: !!id,
  });

  const update = useUpdateTodo({ client: supabase });
  const remove = useDeleteTodo({ client: supabase });

  if (!detail) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-sm text-muted-foreground">불러오는 중…</Text>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert('삭제', `"${detail.title}" 을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            setRemoving(true);
            await remove.mutateAsync({ id });
            router.back();
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : '다시 시도해 주세요.';
            Alert.alert('삭제 실패', msg);
          } finally {
            setRemoving(false);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <TodoForm
        mode="edit"
        workspace={workspace}
        defaultValues={{
          title: detail.title,
          description: detail.description ?? '',
          categoryId: detail.epic?.category_id ?? ('' as unknown as string),
          epicId: detail.epic_id,
          registeredDate: detail.registered_date ?? new Date().toISOString().slice(0, 10),
        }}
        submitting={update.isPending}
        onCancel={() => router.back()}
        onSubmit={async (values) => {
          try {
            await update.mutateAsync({
              id,
              patch: {
                title: values.title,
                description: values.description ?? null,
                registered_date: values.registeredDate,
                epic_id: values.epicId,
              },
            });
            router.back();
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : '다시 시도해 주세요.';
            Alert.alert('저장 실패', msg);
          }
        }}
      />
      <Pressable
        onPress={confirmDelete}
        disabled={removing}
        className="mx-4 mb-6 items-center rounded-md border border-red-600 py-3"
        accessibilityRole="button"
        accessibilityLabel="투두 삭제"
      >
        <Text className="text-red-600">{removing ? '삭제 중...' : '삭제'}</Text>
      </Pressable>
    </View>
  );
}
