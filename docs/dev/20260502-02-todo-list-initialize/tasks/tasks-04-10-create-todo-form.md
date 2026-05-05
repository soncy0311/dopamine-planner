# TASK-04-10: `components/forms/TodoForm.tsx` + Zod schemas 신설 (RHF + datetimepicker + cascading)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 10
- **상태**: 대기중
- **의존성**: 01 (deps), Sub-01 task 08·09·11 (`useCategories`/`useEpics`/`useCreateTodo`/`useUpdateTodo`)

## 작업 목표

Sub-04 §7 의 투두 생성·수정 폼 컴포넌트를 신설한다. RHF + Zod 기반 (web 의 Sub-03 task 02 와 동일 패턴), `@react-native-community/datetimepicker` 로 due_date 입력, 분류 → Epic cascading (선택된 분류에 속한 Epic 만 노출). 폼 schemas 도 함께 신설 (`lib/forms/schemas.ts`) — sub-prd §작업 체크리스트에 누락되었지만 RHF + Zod 사용의 전제이므로 본 task 에 흡수.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/lib/forms/schemas.ts` | 신설 | `todoSchema` (Zod) + 타입 export |
| `apps/mobile/src/components/forms/TodoForm.tsx` | 신설 | `<TodoForm mode="create"\|"edit" defaultValues onSubmit />` |

### Zod 스키마

```ts
// apps/mobile/src/lib/forms/schemas.ts
import { z } from 'zod';

export const todoSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해 주세요').max(200, '200자 이내'),
  description: z.string().trim().max(1000, '1000자 이내').optional().or(z.literal('')),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  category_id: z.string().uuid().nullable().optional(),
  epic_id: z.string().uuid().nullable().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식').nullable().optional(),
});

export type TodoFormValues = z.infer<typeof todoSchema>;
```

### TodoForm 컴포넌트

```tsx
// apps/mobile/src/components/forms/TodoForm.tsx
import { useState, useMemo } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCategories, useEpics } from '@todo-list/core';
import { todoSchema, type TodoFormValues } from '@/lib/forms/schemas';

type Props = {
  mode: 'create' | 'edit';
  workspace: 'life' | 'work';
  defaultValues?: Partial<TodoFormValues>;
  onSubmit: (values: TodoFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
};

export function TodoForm({ mode, workspace, defaultValues, onSubmit, onCancel, submitting }: Props) {
  const { data: categories = [] } = useCategories(workspace);
  const { data: epics = [] } = useEpics(workspace);
  const [showDate, setShowDate] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'normal',
      category_id: null,
      epic_id: null,
      due_date: null,
      ...defaultValues,
    },
  });

  const selectedCategoryId = watch('category_id');
  const filteredEpics = useMemo(
    () => epics.filter((e) => !selectedCategoryId || e.category_id === selectedCategoryId),
    [epics, selectedCategoryId],
  );

  return (
    <ScrollView className="flex-1 bg-background p-4" keyboardShouldPersistTaps="handled">
      {/* 제목 */}
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

      {/* 설명 */}
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

      {/* 우선순위 */}
      <Text className="mb-1 mt-3 text-sm text-muted-foreground">우선순위</Text>
      <Controller
        control={control}
        name="priority"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row gap-2">
            {(['low', 'normal', 'high'] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => onChange(p)}
                className={`flex-1 items-center rounded-md border px-3 py-2 ${
                  value === p ? 'border-primary bg-primary' : 'border-border'
                }`}
                accessibilityRole="radio"
                accessibilityState={{ selected: value === p }}
              >
                <Text className={value === p ? 'text-primary-foreground' : 'text-foreground'}>
                  {p === 'low' ? '낮음' : p === 'normal' ? '보통' : '높음'}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />

      {/* 분류 (cascading source) */}
      <Text className="mb-1 mt-3 text-sm text-muted-foreground">분류</Text>
      <Controller
        control={control}
        name="category_id"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => {
                onChange(null);
                setValue('epic_id', null); // cascading reset
              }}
              className={`rounded-full border px-3 py-1 ${value == null ? 'border-primary bg-primary' : 'border-border'}`}
            >
              <Text className={value == null ? 'text-primary-foreground' : 'text-foreground'}>
                없음
              </Text>
            </Pressable>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  onChange(c.id);
                  setValue('epic_id', null); // cascading reset
                }}
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

      {/* Epic (cascading dependent) */}
      <Text className="mb-1 mt-3 text-sm text-muted-foreground">Epic</Text>
      <Controller
        control={control}
        name="epic_id"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => onChange(null)}
              className={`rounded-full border px-3 py-1 ${value == null ? 'border-primary bg-primary' : 'border-border'}`}
            >
              <Text className={value == null ? 'text-primary-foreground' : 'text-foreground'}>
                없음
              </Text>
            </Pressable>
            {filteredEpics.map((e) => (
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
            ))}
          </View>
        )}
      />

      {/* 마감일 */}
      <Text className="mb-1 mt-3 text-sm text-muted-foreground">마감일</Text>
      <Controller
        control={control}
        name="due_date"
        render={({ field: { value, onChange } }) => (
          <View>
            <Pressable
              onPress={() => setShowDate(true)}
              className="rounded-md border border-border px-3 py-3"
              accessibilityRole="button"
              accessibilityLabel="마감일 선택"
            >
              <Text className="text-foreground">{value ?? '(선택)'}</Text>
            </Pressable>
            {showDate && (
              <DateTimePicker
                value={value ? new Date(value + 'T00:00:00') : new Date()}
                mode="date"
                display="default"
                onChange={(_, picked) => {
                  setShowDate(false);
                  if (picked) {
                    const yyyy = picked.getFullYear();
                    const mm = String(picked.getMonth() + 1).padStart(2, '0');
                    const dd = String(picked.getDate()).padStart(2, '0');
                    onChange(`${yyyy}-${mm}-${dd}`);
                  }
                }}
              />
            )}
            {value && (
              <Pressable onPress={() => onChange(null)} className="mt-1">
                <Text className="text-xs text-muted-foreground">마감일 제거</Text>
              </Pressable>
            )}
          </View>
        )}
      />

      {/* 액션 */}
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
```

### 핵심 포인트

- RHF `Controller` 패턴 (RN TextInput / Pressable 은 controlled)
- Zod resolver 로 검증
- 분류 → Epic cascading: 분류 변경 시 `setValue('epic_id', null)` + `filteredEpics` 로 dropdown 좁힘
- `@react-native-community/datetimepicker` 는 iOS/Android 모두 지원
- `keyboardShouldPersistTaps="handled"` — TextInput focus 시 다른 Pressable 탭 가능
- `mode` 별 라벨 ("추가" / "저장")
- 호출 측이 `onSubmit` 에서 `useCreateTodo` / `useUpdateTodo` mutation 호출

## 검증 과정

- [ ] `lib/forms/schemas.ts` 에 `todoSchema` + `TodoFormValues` export
- [ ] `forms/TodoForm.tsx` 에 RHF + zodResolver 사용
- [ ] 분류 변경 시 epic_id 자동 reset (cascading)
- [ ] DateTimePicker 진입 → 선택 시 due_date 갱신, "마감일 제거" 동작
- [ ] 우선순위 3 옵션 (낮음/보통/높음) Pressable
- [ ] 빈 제목 시 Zod 에러 메시지 노출
- [ ] `pnpm --filter @todo-list/mobile typecheck` 통과
- [ ] iOS 시뮬레이터에서 폼 입력 → 제출 정상

## 주의사항

1. **DateTimePicker iOS / Android 차이** — iOS 는 inline picker, Android 는 native dialog. `display="default"` 로 플랫폼별 표준 사용. 둘 다 한 번 선택 후 dismiss 처리 의무.
2. **Cascading reset 의무** — 분류 변경 시 epic_id null reset. 안 하면 변경 전 분류의 Epic 이 남아 invalid 상태로 제출 가능.
3. **`null` vs `undefined` 정합** — Zod `.nullable().optional()` 로 둘 다 허용. DB 컬럼이 nullable 이라면 null 로 통일 권장.
4. **MVP scope** — 반복 일정, 알림, 첨부 등은 범위 외.
5. **호출 측 책임** — mutation 실패 시 alert 노출 / 성공 시 `router.back()` 은 호출 측 (task 12) 에서 처리. 본 컴포넌트는 폼 책임만.
6. **Nativewind 미지원 속성** — `gap-2` 는 RN 0.71+ 부터 native 지원 (sub-prd §주의사항 3). 혹 미동작 시 `marginRight` 직접.
7. **`useCategories`/`useEpics` 시그니처** — Sub-01 task 08/09 의 (workspace) 인자와 정합 확인.
8. **schemas.ts 흡수 정책** — sub-prd §작업 체크리스트엔 schemas.ts 누락. 본 task 에 흡수 (web 의 sub-prd-03 task 02 는 분리). 향후 web/mobile 공유 격상 가능 — 별도 plan.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §7 투두 생성 모달, §주의사항 3
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useCategories`/`useEpics`/`useCreateTodo`/`useUpdateTodo`
- `apps/web/src/lib/forms/schemas.ts` (Sub-03 task 02) — web 카운터파트
