import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  type Workspace,
} from '@todo-list/core';
import { supabase } from '@/lib/supabase';
import { CategoryForm } from '@/components/forms/CategoryForm';
import type { CategoryFormValues } from '@/lib/forms/schemas';

type Editing = { id?: string; values?: Partial<CategoryFormValues> } | null;

function fkFriendly(e: unknown, fallback: string): string {
  const err = e as { code?: string; message?: string } | undefined;
  if (err?.code === '23503' || (err?.message && /foreign key/i.test(err.message))) {
    return '이 분류를 사용 중인 Epic 또는 투두가 있어 삭제할 수 없습니다. 먼저 이동·삭제해 주세요.';
  }
  return err?.message ?? fallback;
}

export default function CategoriesPage() {
  const [workspace, setWorkspace] = useState<Workspace>('life');
  const [editing, setEditing] = useState<Editing>(null);

  const { data: categories = [] } = useCategories({ client: supabase, workspace });
  const create = useCreateCategory({ client: supabase });
  const update = useUpdateCategory({ client: supabase });
  const remove = useDeleteCategory({ client: supabase });

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        Alert.alert('세션 만료', '다시 로그인해 주세요.');
        return;
      }
      if (editing?.id) {
        await update.mutateAsync({
          id: editing.id,
          patch: { name: values.name, color: values.color },
        });
      } else {
        await create.mutateAsync({
          user_id: userRes.user.id,
          workspace,
          name: values.name,
          color: values.color,
        });
      }
      setEditing(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '다시 시도해 주세요.';
      Alert.alert('저장 실패', msg);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('삭제', `"${name}" 을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove.mutateAsync({ id, workspace });
          } catch (e: unknown) {
            Alert.alert('삭제 실패', fkFriendly(e, '삭제에 실패했습니다.'));
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row border-b border-border">
        {(['life', 'work'] as const).map((w) => (
          <Pressable
            key={w}
            onPress={() => setWorkspace(w)}
            className={`flex-1 items-center py-3 ${
              workspace === w ? 'border-b-2 border-primary' : ''
            }`}
            accessibilityRole="button"
            accessibilityLabel={w === 'life' ? 'Life 탭' : 'Work 탭'}
          >
            <Text className={workspace === w ? 'text-primary' : 'text-muted-foreground'}>
              {w === 'life' ? 'Life' : 'Work'}
            </Text>
          </Pressable>
        ))}
      </View>

      {editing ? (
        <CategoryForm
          mode={editing.id ? 'edit' : 'create'}
          defaultValues={editing.values}
          submitting={create.isPending || update.isPending}
          onCancel={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center border-b border-border px-4 py-3">
              <View
                className="mr-3 h-4 w-4 rounded-full"
                style={{ backgroundColor: item.color || '#9ca3af' }}
              />
              <Pressable
                className="flex-1"
                onPress={() =>
                  setEditing({
                    id: item.id,
                    values: { name: item.name, color: item.color || '#3B82F6' },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`${item.name} 편집`}
              >
                <Text className="text-base text-foreground">{item.name}</Text>
              </Pressable>
              <Pressable
                onPress={() => handleDelete(item.id, item.name)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${item.name} 삭제`}
              >
                <Text className="text-sm text-red-600">삭제</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text className="p-6 text-center text-muted-foreground">분류가 없습니다.</Text>
          }
        />
      )}

      {!editing && (
        <Pressable
          onPress={() => setEditing({})}
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
          accessibilityRole="button"
          accessibilityLabel="분류 추가"
        >
          <Text className="text-2xl text-primary-foreground">+</Text>
        </Pressable>
      )}
    </View>
  );
}
