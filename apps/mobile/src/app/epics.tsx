import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import {
  useCreateEpic,
  useDeleteEpic,
  useEpics,
  useUpdateEpic,
  type Workspace,
} from '@todo-list/core';
import { supabase } from '@/lib/supabase';
import { EpicForm } from '@/components/forms/EpicForm';
import type { EpicFormValues } from '@/lib/forms/schemas';

type Editing = { id?: string; values?: Partial<EpicFormValues> } | null;

function fkFriendly(e: unknown, fallback: string): string {
  const err = e as { code?: string; message?: string } | undefined;
  if (err?.code === '23503' || (err?.message && /foreign key/i.test(err.message))) {
    return '이 Epic 을 사용 중인 투두가 있어 삭제할 수 없습니다. 먼저 이동·삭제해 주세요.';
  }
  return err?.message ?? fallback;
}

export default function EpicsPage() {
  const [workspace, setWorkspace] = useState<Workspace>('life');
  const [editing, setEditing] = useState<Editing>(null);

  const { data: epics = [] } = useEpics({ client: supabase, workspace });
  const create = useCreateEpic({ client: supabase });
  const update = useUpdateEpic({ client: supabase });
  const remove = useDeleteEpic({ client: supabase });

  const handleSubmit = async (values: EpicFormValues) => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        Alert.alert('세션 만료', '다시 로그인해 주세요.');
        return;
      }
      if (editing?.id) {
        await update.mutateAsync({
          id: editing.id,
          patch: {
            title: values.title,
            description: values.description ?? null,
            category_id: values.categoryId,
          },
        });
      } else {
        await create.mutateAsync({
          user_id: userRes.user.id,
          category_id: values.categoryId,
          title: values.title,
          description: values.description ?? null,
        });
      }
      setEditing(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '다시 시도해 주세요.';
      Alert.alert('저장 실패', msg);
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('삭제', `"${title}" 을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove.mutateAsync({ id });
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
        <EpicForm
          mode={editing.id ? 'edit' : 'create'}
          workspace={workspace}
          defaultValues={editing.values}
          submitting={create.isPending || update.isPending}
          onCancel={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      ) : (
        <FlatList
          data={epics}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center border-b border-border px-4 py-3">
              <Pressable
                className="flex-1"
                onPress={() =>
                  setEditing({
                    id: item.id,
                    values: {
                      title: item.title,
                      description: item.description ?? '',
                      categoryId: item.categoryId,
                    },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`${item.title} 편집`}
              >
                <Text className="text-base text-foreground">{item.title}</Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  진행 {item.progress ?? 0}%
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleDelete(item.id, item.title)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${item.title} 삭제`}
              >
                <Text className="text-sm text-red-600">삭제</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text className="p-6 text-center text-muted-foreground">Epic 이 없습니다.</Text>
          }
        />
      )}

      {!editing && (
        <Pressable
          onPress={() => setEditing({})}
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
          accessibilityRole="button"
          accessibilityLabel="Epic 추가"
        >
          <Text className="text-2xl text-primary-foreground">+</Text>
        </Pressable>
      )}
    </View>
  );
}
