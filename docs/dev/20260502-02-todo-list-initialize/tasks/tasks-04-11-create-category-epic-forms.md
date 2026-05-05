# TASK-04-11: `components/forms/{CategoryForm,EpicForm}.tsx` 신설 (8색 팔레트 / 분류 cascading)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 11
- **상태**: 대기중
- **의존성**: 01 (deps), 10 (schemas.ts), Sub-01 task 08·09 (`useCategories`/mutations)

## 작업 목표

분류·Epic 관리 화면 (task 13) 에서 사용할 두 폼 컴포넌트를 신설한다. CategoryForm 은 8색 팔레트에서 색 선택, EpicForm 은 분류 선택 (cascading). 둘 다 RHF + Zod 패턴 (TodoForm 과 동일). 책임이 작아 묶음.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/lib/forms/schemas.ts` | 수정 (확장) | `categorySchema`, `epicSchema` 추가 |
| `apps/mobile/src/components/forms/CategoryForm.tsx` | 신설 | `<CategoryForm mode defaultValues onSubmit onCancel />` |
| `apps/mobile/src/components/forms/EpicForm.tsx` | 신설 | `<EpicForm mode workspace defaultValues onSubmit onCancel />` |

### 스키마 확장

```ts
// apps/mobile/src/lib/forms/schemas.ts (task 10 에서 신설된 파일에 추가)
export const PALETTE = [
  '#EF4444', '#F59E0B', '#FACC15', '#10B981',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
] as const;

export const categorySchema = z.object({
  name: z.string().trim().min(1, '이름을 입력해 주세요').max(50, '50자 이내'),
  color: z.enum(PALETTE),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const epicSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해 주세요').max(100, '100자 이내'),
  category_id: z.string().uuid({ message: '분류를 선택해 주세요' }),
});
export type EpicFormValues = z.infer<typeof epicSchema>;
```

### CategoryForm

```tsx
// apps/mobile/src/components/forms/CategoryForm.tsx
import { Pressable, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  categorySchema,
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
    resolver: zodResolver(categorySchema),
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
                className={`h-10 w-10 items-center justify-center rounded-full border-2 ${
                  value === c ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                accessibilityRole="radio"
                accessibilityState={{ selected: value === c }}
                accessibilityLabel={`색 ${c}`}
              />
            ))}
          </View>
        )}
      />

      <View className="mt-6 flex-row gap-2">
        <Pressable
          onPress={onCancel}
          className="flex-1 items-center rounded-md border border-border py-3"
        >
          <Text className="text-foreground">취소</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
          className={`flex-1 items-center rounded-md py-3 ${submitting ? 'bg-muted' : 'bg-primary'}`}
        >
          <Text className="text-primary-foreground">
            {submitting ? '저장 중...' : mode === 'create' ? '추가' : '저장'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

### EpicForm

```tsx
// apps/mobile/src/components/forms/EpicForm.tsx
import { Pressable, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategories } from '@todo-list/core';
import { epicSchema, type EpicFormValues } from '@/lib/forms/schemas';

type Props = {
  mode: 'create' | 'edit';
  workspace: 'life' | 'work';
  defaultValues?: Partial<EpicFormValues>;
  onSubmit: (v: EpicFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
};

export function EpicForm({ mode, workspace, defaultValues, onSubmit, onCancel, submitting }: Props) {
  const { data: categories = [] } = useCategories(workspace);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EpicFormValues>({
    resolver: zodResolver(epicSchema),
    defaultValues: { title: '', category_id: '', ...defaultValues },
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
          />
        )}
      />
      {errors.title && <Text className="mb-2 text-xs text-red-600">{errors.title.message}</Text>}

      <Text className="mb-1 mt-3 text-sm text-muted-foreground">분류 *</Text>
      <Controller
        control={control}
        name="category_id"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row flex-wrap gap-2">
            {categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => onChange(c.id)}
                className={`flex-row items-center rounded-full border px-3 py-1 ${
                  value === c.id ? 'border-primary bg-primary' : 'border-border'
                }`}
              >
                <View
                  className="mr-1 h-2 w-2 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <Text className={value === c.id ? 'text-primary-foreground' : 'text-foreground'}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />
      {errors.category_id && (
        <Text className="mt-1 text-xs text-red-600">{errors.category_id.message}</Text>
      )}

      <View className="mt-6 flex-row gap-2">
        <Pressable
          onPress={onCancel}
          className="flex-1 items-center rounded-md border border-border py-3"
        >
          <Text className="text-foreground">취소</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
          className={`flex-1 items-center rounded-md py-3 ${submitting ? 'bg-muted' : 'bg-primary'}`}
        >
          <Text className="text-primary-foreground">
            {submitting ? '저장 중...' : mode === 'create' ? '추가' : '저장'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

## 검증 과정

- [ ] `lib/forms/schemas.ts` 에 `categorySchema` / `epicSchema` / `PALETTE` export
- [ ] `CategoryForm.tsx` 8색 팔레트 시각 + 선택 표시
- [ ] `EpicForm.tsx` 분류 chip 선택 — 분류 미선택 시 Zod 에러
- [ ] 빈 이름 / 빈 제목 Zod 에러 메시지 노출
- [ ] `pnpm --filter @todo-list/mobile typecheck` 통과
- [ ] 시뮬레이터에서 두 폼 입력 → 제출 정상

## 주의사항

1. **8색 팔레트** — 디자인 시스템 (`docs/base/design-system/tokens.md`) 의 카테고리 색 팔레트와 일치 검증 필요. 현재는 임의 hex — 디자인 토큰 확정 시 PALETTE 정정.
2. **Cascading 차이** — TodoForm 은 분류 → Epic cascading (분류 변경 시 epic reset). EpicForm 은 단방향 (분류 선택만).
3. **분류 0 개 케이스** — `categories.length === 0` 일 때 EpicForm 의 분류 선택지가 없음. 호출 측 (task 13) 에서 "먼저 분류 추가" 안내 노출 책임.
4. **호출 측 mutation** — `useCreateCategory`/`useUpdateCategory`/`useCreateEpic`/`useUpdateEpic` 호출은 본 task 가 아니라 task 13 (관리 페이지) 책임.
5. **dynamic backgroundColor** — 팔레트 색은 DB 가 아닌 const 지만 RN/Nativewind dynamic className 우회 위해 `style={{ backgroundColor }}` 직접.
6. **gap-3 미동작 케이스** — RN 0.76 에서도 `gap` 일부 미지원 가능 (sub-prd §주의사항 3). 발견 시 marginRight 직접 fallback.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §8 관리 화면, §주의사항 3
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useCategories`/mutation 훅들
- `docs/base/design-system/tokens.md` — 카테고리 색 팔레트 SoT
