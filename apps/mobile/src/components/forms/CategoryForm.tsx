import { Pressable, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CategoryFormSchema,
  PALETTE,
  type CategoryFormValues,
} from '@/lib/forms/schemas';

type Props = {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CategoryFormValues>;
  onSubmit: (v: CategoryFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
};

export function CategoryForm({ mode, defaultValues, onSubmit, onCancel, submitting }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: { name: '', color: PALETTE[0], ...defaultValues },
  });

  return (
    <View className="bg-background p-4">
      <Text className="mb-1 text-sm text-muted-foreground">이름 *</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="분류 이름"
            className="mb-1 rounded-md border border-border px-3 py-3 text-foreground"
            accessibilityLabel="이름"
          />
        )}
      />
      {errors.name && <Text className="mb-2 text-xs text-red-600">{errors.name.message}</Text>}

      <Text className="mb-1 mt-3 text-sm text-muted-foreground">색상</Text>
      <Controller
        control={control}
        name="color"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row flex-wrap gap-3">
            {PALETTE.map((c) => (
              <Pressable
                key={c}
                onPress={() => onChange(c)}
                className={`h-10 w-10 rounded-full border-2 ${
                  value.toLowerCase() === c.toLowerCase()
                    ? 'border-foreground'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                accessibilityRole="radio"
                accessibilityState={{ selected: value.toLowerCase() === c.toLowerCase() }}
                accessibilityLabel={`색 ${c}`}
              />
            ))}
          </View>
        )}
      />
      {errors.color && <Text className="mt-1 text-xs text-red-600">{errors.color.message}</Text>}

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
