import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  useCreateEpic,
  useDeleteEpic,
  useUpdateEpic,
  type Workspace,
} from '@todo-list/core';
import { supabase } from '@/lib/supabase';
import { EpicForm } from '@/components/forms/EpicForm';
import type { EpicFormValues } from '@/lib/forms/schemas';

type EpicEditFetch = {
  id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  category_id: string | null;
};

async function fetchEpicForEdit(id: string): Promise<EpicEditFetch> {
  const { data, error } = await supabase
    .from('epic_issue')
    .select('id, title, description, priority, category_id')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as EpicEditFetch;
}

export default function EpicFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    workspace?: string;
    registeredDate?: string;
    id?: string;
  }>();
  const workspace = ((params.workspace as Workspace) ?? 'life') as Workspace;
  const editId = typeof params.id === 'string' && params.id ? params.id : null;
  const isEdit = !!editId;

  const create = useCreateEpic({ client: supabase });
  const update = useUpdateEpic({ client: supabase });
  const remove = useDeleteEpic({ client: supabase });

  const { data: existing } = useQuery({
    queryKey: ['epicEdit', editId],
    queryFn: () => fetchEpicForEdit(editId as string),
    enabled: isEdit,
  });

  const [defaults, setDefaults] = useState<Partial<EpicFormValues> | undefined>(undefined);
  useEffect(() => {
    if (!isEdit) return;
    if (existing) {
      setDefaults({
        title: existing.title,
        description: existing.description ?? '',
        priority: existing.priority,
        categoryId: existing.category_id,
      });
    }
  }, [isEdit, existing]);

  const handleSubmit = async (values: EpicFormValues) => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        Alert.alert('세션 만료', '다시 로그인해 주세요.');
        return;
      }
      if (isEdit) {
        await update.mutateAsync({
          id: editId as string,
          patch: {
            title: values.title,
            description: values.description?.trim() ? values.description.trim() : null,
            priority: values.priority,
            category_id: values.categoryId,
          },
        });
      } else {
        await create.mutateAsync({
          user_id: userRes.user.id,
          category_id: values.categoryId,
          workspace,
          title: values.title,
          description: values.description ?? null,
          priority: values.priority,
          registered_date: params.registeredDate ?? new Date().toISOString().slice(0, 10),
        });
      }
      router.back();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '다시 시도해 주세요.';
      Alert.alert('저장 실패', msg);
    }
  };

  const handleDelete = () => {
    if (!isEdit) return;
    Alert.alert('Epic 삭제', '이 Epic 의 모든 서브 이슈도 함께 삭제돼요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove.mutateAsync({ id: editId as string });
            router.back();
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : '다시 시도해 주세요.';
            Alert.alert('삭제 실패', msg);
          }
        },
      },
    ]);
  };

  const submitting = create.isPending || update.isPending;

  // 편집 모드인데 아직 데이터 로드 전이면 빈 상태로 두지 않고 EpicForm 렌더 보류.
  if (isEdit && !defaults) return null;

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? 'Epic 수정' : 'Epic 추가' }} />
      <EpicForm
        mode={isEdit ? 'edit' : 'create'}
        workspace={workspace}
        defaultValues={defaults}
        submitting={submitting}
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
        onDelete={isEdit ? handleDelete : undefined}
      />
    </>
  );
}
