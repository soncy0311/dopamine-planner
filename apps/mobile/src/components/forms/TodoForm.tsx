import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCategories, useEpics, type Workspace } from '@todo-list/core';
import { supabase } from '@/lib/supabase';
import { TodoFormSchema, type TodoFormValues } from '@/lib/forms/schemas';

type Props = {
  mode: 'create' | 'edit';
  workspace: Workspace;
  defaultValues?: Partial<TodoFormValues>;
  onSubmit: (values: TodoFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
};

const EMPTY_UUID = '' as unknown as string;

export function TodoForm({
  mode,
  workspace,
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: Props) {
  const [showDate, setShowDate] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(TodoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: EMPTY_UUID,
      epicId: EMPTY_UUID,
      registeredDate: defaultValues?.registeredDate ?? '',
      ...defaultValues,
    },
  });

  const categoryId = watch('categoryId');
  const registeredDate = watch('registeredDate');

  const { data: categories = [] } = useCategories({ client: supabase, workspace });
  const { data: epics = [] } = useEpics(
    categoryId ? { client: supabase, categoryId } : { client: supabase, workspace },
  );

  const prevCategoryRef = useRef(categoryId);
  useEffect(() => {
    if (prevCategoryRef.current !== categoryId) {
      setValue('epicId', EMPTY_UUID);
      prevCategoryRef.current = categoryId;
    }
  }, [categoryId, setValue]);

  return (
    <ScrollView className="flex-1 bg-background p-4" keyboardShouldPersistTaps="handled">
      <Text className="mb-1 text-sm text-muted-foreground">제목 *</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="할 일을 입력하세요"
            className="mb-1 rounded-md border border-border px-3 py-3 text-foreground"
            accessibilityLabel="제목"
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
            accessibilityLabel="설명"
          />
        )}
      />

      <Text className="mb-1 mt-3 text-sm text-muted-foreground">분류 *</Text>
      <Controller
        control={control}
        name="categoryId"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row flex-wrap gap-2">
            {categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  onChange(c.id);
                  setValue('epicId', EMPTY_UUID);
                }}
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
            ))}
          </View>
        )}
      />
      {errors.categoryId && (
        <Text className="mt-1 text-xs text-red-600">{errors.categoryId.message}</Text>
      )}

      <Text className="mb-1 mt-3 text-sm text-muted-foreground">Epic *</Text>
      <Controller
        control={control}
        name="epicId"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row flex-wrap gap-2">
            {!categoryId ? (
              <Text className="text-xs text-muted-foreground">먼저 분류를 선택하세요</Text>
            ) : (
              epics.map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => onChange(e.id)}
                  className={`rounded-full border px-3 py-1 ${
                    value === e.id ? 'border-primary bg-primary' : 'border-border'
                  }`}
                >
                  <Text className={value === e.id ? 'text-primary-foreground' : 'text-foreground'}>
                    {e.title}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      />
      {errors.epicId && (
        <Text className="mt-1 text-xs text-red-600">{errors.epicId.message}</Text>
      )}

      <Text className="mb-1 mt-3 text-sm text-muted-foreground">마감일 *</Text>
      <Pressable
        onPress={() => setShowDate(true)}
        className="rounded-md border border-border px-3 py-3"
        accessibilityRole="button"
        accessibilityLabel="마감일 선택"
      >
        <Text className="text-foreground">{registeredDate || '(선택)'}</Text>
      </Pressable>
      {showDate && (
        <DateTimePicker
          value={registeredDate ? new Date(registeredDate + 'T00:00:00') : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_e, picked) => {
            setShowDate(Platform.OS === 'ios');
            if (picked) {
              const y = picked.getFullYear();
              const m = String(picked.getMonth() + 1).padStart(2, '0');
              const d = String(picked.getDate()).padStart(2, '0');
              setValue('registeredDate', `${y}-${m}-${d}`);
            }
          }}
        />
      )}
      {errors.registeredDate && (
        <Text className="mt-1 text-xs text-red-600">{errors.registeredDate.message}</Text>
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
    </ScrollView>
  );
}
