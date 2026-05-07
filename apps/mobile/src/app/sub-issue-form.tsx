import { useState } from 'react';
import { Alert, Platform, Pressable, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateTodo } from '@todo-list/core';
import { supabase } from '@/lib/supabase';

const SubIssueFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내'),
  priority: z.enum(['high', 'medium', 'low']),
  registeredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '유효한 날짜가 아닙니다'),
});
type SubIssueFormValues = z.infer<typeof SubIssueFormSchema>;

export default function SubIssueFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    epicId?: string;
    epicTitle?: string;
    registeredDate?: string;
  }>();
  const epicId = (params.epicId as string | undefined) ?? '';
  const epicTitle = (params.epicTitle as string | undefined) ?? '';
  const defaultRegistered = (params.registeredDate as string | undefined) ?? '';

  const create = useCreateTodo({ client: supabase });
  const [pickerOpen, setPickerOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SubIssueFormValues>({
    resolver: zodResolver(SubIssueFormSchema),
    defaultValues: { title: '', priority: 'medium', registeredDate: defaultRegistered },
  });

  const registeredDate = watch('registeredDate');

  if (!epicId) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-foreground">잘못된 진입점입니다.</Text>
      </View>
    );
  }

  const onSubmit = async (values: SubIssueFormValues) => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        Alert.alert('세션 만료', '다시 로그인해 주세요.');
        return;
      }
      await create.mutateAsync({
        user_id: userRes.user.id,
        epic_id: epicId,
        title: values.title,
        priority: values.priority,
        registered_date: values.registeredDate,
      });
      router.back();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '다시 시도해 주세요.';
      Alert.alert('저장 실패', msg);
    }
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-base font-semibold text-foreground">서브 이슈 추가</Text>
      {epicTitle ? (
        <Text className="mt-1 text-xs text-muted-foreground">Epic: {epicTitle}</Text>
      ) : null}

      <Text className="mb-1 mt-4 text-sm text-muted-foreground">제목 *</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="서브 이슈 제목"
            className="mb-1 rounded-md border border-border px-3 py-3 text-foreground"
            accessibilityLabel="서브 이슈 제목"
          />
        )}
      />
      {errors.title && <Text className="mb-2 text-xs text-red-600">{errors.title.message}</Text>}

      <Text className="mb-1 mt-3 text-sm text-muted-foreground">우선순위</Text>
      <Controller
        control={control}
        name="priority"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row gap-2">
            {(['high', 'medium', 'low'] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => onChange(p)}
                className={`flex-1 items-center rounded-md border px-3 py-2 ${
                  value === p ? 'border-primary bg-primary' : 'border-border'
                }`}
              >
                <Text
                  className={value === p ? 'text-primary-foreground' : 'text-foreground'}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />

      <Text className="mb-1 mt-3 text-sm text-muted-foreground">등록일</Text>
      <Pressable
        onPress={() => setPickerOpen(true)}
        className="rounded-md border border-border px-3 py-3"
      >
        <Text className="text-foreground">{registeredDate || '(선택)'}</Text>
      </Pressable>
      {pickerOpen ? (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          value={registeredDate ? new Date(registeredDate + 'T00:00:00') : new Date()}
          onChange={(_, selected) => {
            setPickerOpen(Platform.OS === 'ios');
            if (selected) {
              const y = selected.getFullYear();
              const m = String(selected.getMonth() + 1).padStart(2, '0');
              const d = String(selected.getDate()).padStart(2, '0');
              setValue('registeredDate', `${y}-${m}-${d}`, { shouldDirty: true, shouldValidate: true });
            }
          }}
        />
      ) : null}
      {errors.registeredDate && (
        <Text className="mt-1 text-xs text-red-600">{errors.registeredDate.message}</Text>
      )}

      <View className="mt-6 flex-row gap-2">
        <Pressable
          onPress={() => router.back()}
          className="flex-1 items-center rounded-md border border-border py-3"
          accessibilityRole="button"
          accessibilityLabel="취소"
        >
          <Text className="text-foreground">취소</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={create.isPending}
          className={`flex-1 items-center rounded-md py-3 ${
            create.isPending ? 'bg-muted' : 'bg-primary'
          }`}
          accessibilityRole="button"
          accessibilityLabel="저장"
        >
          <Text className="text-primary-foreground">
            {create.isPending ? '저장 중...' : '저장'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
