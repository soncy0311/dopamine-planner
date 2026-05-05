import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateTodo, type Workspace } from '@todo-list/core';
import { supabase } from '@/lib/supabase';
import { TodoForm } from '@/components/forms/TodoForm';

export default function CreateTodoModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ workspace?: string; date?: string }>();
  const workspace = ((params.workspace as Workspace) ?? 'life') as Workspace;
  const defaultDate = (params.date as string | undefined) ?? '';
  const create = useCreateTodo({ client: supabase });

  return (
    <TodoForm
      mode="create"
      workspace={workspace}
      defaultValues={{ dueDate: defaultDate }}
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
            epic_id: values.epicId,
            title: values.title,
            description: values.description ?? null,
            priority: values.priority,
            due_date: values.dueDate,
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
