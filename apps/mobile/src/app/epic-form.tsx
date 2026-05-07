import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateEpic, type Workspace } from '@todo-list/core';
import { supabase } from '@/lib/supabase';
import { EpicForm } from '@/components/forms/EpicForm';

export default function EpicFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ workspace?: string; registeredDate?: string }>();
  const workspace = ((params.workspace as Workspace) ?? 'life') as Workspace;
  const create = useCreateEpic({ client: supabase });

  return (
    <EpicForm
      mode="create"
      workspace={workspace}
      submitting={create.isPending}
      onCancel={() => router.back()}
      onSubmit={async (values) => {
        try {
          const { data: userRes, error: userErr } = await supabase.auth.getUser();
          if (userErr || !userRes.user) {
            Alert.alert('세션 만료', '다시 로그인해 주세요.');
            return;
          }
          await create.mutateAsync({
            user_id: userRes.user.id,
            category_id: values.categoryId,
            title: values.title,
            description: values.description ?? null,
          });
          router.back();
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : '다시 시도해 주세요.';
          Alert.alert('저장 실패', msg);
        }
      }}
    />
  );
}
