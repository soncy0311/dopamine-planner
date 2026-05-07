import { Pressable, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategories, type Workspace } from '@todo-list/core';
import { supabase } from '@/lib/supabase';
import { EpicFormSchema, type EpicFormValues } from '@/lib/forms/schemas';

type Props = {
  mode: 'create' | 'edit';
  workspace: Workspace;
  defaultValues?: Partial<EpicFormValues>;
  onSubmit: (v: EpicFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
};

const EMPTY_UUID = '' as unknown as string;

export function EpicForm({
  mode,
  workspace,
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: Props) {
  const { data: categories = [] } = useCategories({ client: supabase, workspace });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EpicFormValues>({
    resolver: zodResolver(EpicFormSchema),
    defaultValues: { title: '', description: '', categoryId: EMPTY_UUID, ...defaultValues },
  });

  return (
    <View className="bg-background p-4">
      <Text className="mb-1 text-sm text-muted-foreground">제목 *</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Epic 제목"
            className="mb-1 rounded-md border border-border px-3 py-3 text-foreground"
            accessibilityLabel="Epic 제목"
          />
        )}
      />
      {errors.title && <Text className="mb-2 text-xs text-red-600">{errors.title.message}</Text>}

      <Text className="mb-1 mt-3 text-sm text-muted-foreground">설명</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            placeholder="(선택)"
            className="mb-1 min-h-20 rounded-md border border-border px-3 py-3 text-foreground"
            accessibilityLabel="Epic 설명"
          />
        )}
      />

      <Text className="mb-1 mt-3 text-sm text-muted-foreground">분류 *</Text>
      <Controller
        control={control}
        name="categoryId"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row flex-wrap gap-2">
            {categories.length === 0 ? (
              <Text className="text-xs text-muted-foreground">먼저 분류를 추가하세요</Text>
            ) : (
              categories.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => onChange(c.id)}
                  className={`flex-row items-center rounded-full border px-3 py-1 ${
                    value === c.id ? 'border-primary bg-primary' : 'border-border'
                  }`}
                >
                  <View
                    className="mr-1 h-2 w-2 rounded-full"
                    style={{ backgroundColor: c.color || '#9ca3af' }}
                  />
                  <Text className={value === c.id ? 'text-primary-foreground' : 'text-foreground'}>
                    {c.name}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      />
      {errors.categoryId && (
        <Text className="mt-1 text-xs text-red-600">{errors.categoryId.message}</Text>
      )}

      <View className="mt-6 flex-row gap-2">
        <Pressable
          onPress={onCancel}
          className="flex-1 items-center rounded-md border border-border py-3"
          accessibilityRole="button"
          accessibilityLabel="취소"
        >
          <Text className="text-foreground">취소</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
          className={`flex-1 items-center rounded-md py-3 ${submitting ? 'bg-muted' : 'bg-primary'}`}
          accessibilityRole="button"
          accessibilityLabel={mode === 'create' ? '추가' : '저장'}
        >
          <Text className="text-primary-foreground">
            {submitting ? '저장 중...' : mode === 'create' ? '추가' : '저장'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
