# TASK-04-12: `app/create-todo.tsx` + `app/todo/[id].tsx` 신설 (modal route + TodoForm 재사용)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 12
- **상태**: 완료
- **의존성**: 10 (TodoForm), Sub-01 task 11 (`useCreateTodo`/`useUpdateTodo`/`useDeleteTodo`)

## 작업 목표

투두 생성·상세 두 개의 풀스크린 modal route 를 신설한다. 둘 다 `<TodoForm>` 재사용 — 차이는 mode (create/edit), defaultValues 로딩 (상세는 단일 fetch), 삭제 버튼 노출 (상세만). expo-router v4 의 modal preset 으로 풀스크린 단일 정책.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/_layout.tsx` | 수정 (`Stack.Screen` 등록) | `create-todo`, `todo/[id]` modal preset |
| `apps/mobile/src/app/create-todo.tsx` | 신설 | TodoForm + useCreateTodo |
| `apps/mobile/src/app/todo/[id].tsx` | 신설 | TodoForm + useUpdateTodo + useDeleteTodo + confirm |

### Step 1: `_layout.tsx` 의 Slot 을 Stack 으로 (modal preset 등록)

> 현재 `_layout.tsx` 는 `<Slot />`. Stack 으로 바꾸면서 (auth)·(main) 그룹 + modal route 를 함께 등록한다.

```tsx
// apps/mobile/src/app/_layout.tsx 본문 일부 (task 02 결과 + 본 task 보강)
import { Stack } from 'expo-router';

// ... root setup ...

return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-todo"
          options={{ presentation: 'modal', title: '새 투두' }}
        />
        <Stack.Screen
          name="todo/[id]"
          options={{ presentation: 'modal', title: '투두 수정' }}
        />
        <Stack.Screen name="categories" options={{ title: '분류 관리' }} />
        <Stack.Screen name="epics" options={{ title: 'Epic 관리' }} />
      </Stack>
    </QueryClientProvider>
  </GestureHandlerRootView>
);
```

### Step 2: `app/create-todo.tsx`

```tsx
// apps/mobile/src/app/create-todo.tsx
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateTodo } from '@todo-list/core';
import { TodoForm } from '@/components/forms/TodoForm';

export default function CreateTodoModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ workspace?: string; date?: string }>();
  const workspace = (params.workspace ?? 'life') as 'life' | 'work';
  const defaultDate = params.date as string | undefined;
  const { mutateAsync, isPending } = useCreateTodo();

  return (
    <TodoForm
      mode="create"
      workspace={workspace}
      defaultValues={{ due_date: defaultDate ?? null }}
      submitting={isPending}
      onCancel={() => router.back()}
      onSubmit={async (values) => {
        try {
          await mutateAsync({ ...values, workspace });
          router.back();
        } catch (e: any) {
          Alert.alert('저장 실패', e?.message ?? '다시 시도해 주세요.');
        }
      }}
    />
  );
}
```

### Step 3: `app/todo/[id].tsx`

```tsx
// apps/mobile/src/app/todo/[id].tsx
import { Alert, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTodo, useUpdateTodo, useDeleteTodo } from '@todo-list/core';
import { TodoForm } from '@/components/forms/TodoForm';

export default function TodoDetailModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: todo, isLoading } = useTodo(id);
  const { mutateAsync: update, isPending: updating } = useUpdateTodo();
  const { mutateAsync: remove, isPending: removing } = useDeleteTodo();

  if (isLoading || !todo) return null;

  const confirmDelete = () => {
    Alert.alert('삭제', `"${todo.title}" 을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(id);
            router.back();
          } catch (e: any) {
            Alert.alert('삭제 실패', e?.message ?? '다시 시도해 주세요.');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <TodoForm
        mode="edit"
        workspace={todo.workspace}
        defaultValues={{
          title: todo.title,
          description: todo.description ?? '',
          priority: todo.priority,
          category_id: todo.category_id,
          epic_id: todo.epic_id,
          due_date: todo.due_date,
        }}
        submitting={updating}
        onCancel={() => router.back()}
        onSubmit={async (values) => {
          try {
            await update({ id, ...values });
            router.back();
          } catch (e: any) {
            Alert.alert('저장 실패', e?.message ?? '다시 시도해 주세요.');
          }
        }}
      />
      <Pressable
        onPress={confirmDelete}
        disabled={removing}
        className="mx-4 mb-6 items-center rounded-md border border-red-600 py-3"
        accessibilityRole="button"
        accessibilityLabel="투두 삭제"
      >
        <Text className="text-red-600">삭제</Text>
      </Pressable>
    </View>
  );
}
```

### 핵심 포인트

- 두 화면 모두 `<TodoForm>` 재사용 — DRY
- `presentation: 'modal'` — iOS/Android 모두 풀스크린 modal (sub-prd §주의사항: 풀스크린 단일 정책)
- 상세 진입 시 `useTodo(id)` 로 단일 fetch → defaultValues 채움
- 삭제는 `Alert.alert` confirm dialog (web 의 sonner confirm 과 다름 — RN 표준)
- 성공/실패 모두 사용자 피드백

## 검증 과정

- [x] `_layout.tsx` 가 Stack 으로 변경 + Stack.Screen 등록 (`(auth)`, `(main)`, `create-todo`, `todo/[id]`, `categories`, `epics`, `index`)
- [x] `app/create-todo.tsx` 파일 존재 — TodoForm + `useCreateTodo({client})`
- [x] query param `workspace`, `date` 로 defaultValues 정합
- [x] `app/todo/[id].tsx` 파일 존재 — TodoForm + `useQuery(fetchTodoDetail)` (단건 hook 부재로 web 패턴 정합) + `useUpdateTodo` + `useDeleteTodo`
- [x] 삭제 버튼 → Alert confirm → 실행
- [x] 성공 시 `router.back()` (모달 닫힘)
- [x] 실패 시 Alert
- [x] `pnpm --filter @todo-list/mobile typecheck` 통과 — 본 task 신규 에러 0건
- [ ] 시뮬레이터에서 FAB → create modal → 입력 → 저장 → 목록 갱신 — **수동 확인 필요**
- [ ] 목록 항목 탭 → detail modal → 수정/삭제 동작 — **수동 확인 필요**

## 주의사항

1. **`Slot` → `Stack` 전환 회귀 위험** — task 02 의 Slot 기반 구현이 Stack 으로 바뀌므로 (auth)/(main) 그룹 진입에 회귀 없는지 검증. `headerShown: false` 로 그룹 화면은 자체 layout 사용.
2. **modal preset 풀스크린 단일 정책** — iOS sheet vs Android dialog 차이 가능. MVP 는 둘 다 풀스크린. `presentation: 'modal'` 또는 `'fullScreenModal'` 중 후자 명시 검토.
3. **`useTodo` 시그니처** — Sub-01 에 단건 조회 훅이 있는지 확인. 없으면 useTodos 전체에서 find 또는 별도 훅 추가 필요 — Sub-01 task 보강 plan 분리.
4. **`workspace` prop 정합** — todo 객체에 workspace 컬럼이 있어야 detail 에서 정확한 분류·Epic 목록 노출. Sub-01 의 todo 매퍼 검증.
5. **삭제 confirm 위치** — `Alert.alert` 사용 (RN 표준). 디자인 시스템에 confirm dialog 컴포넌트가 정의되면 정정.
6. **modal back navigation** — `router.back()` 으로 닫기. iOS swipe-down 도 자동 dismiss — onSubmit 미호출 시 데이터 잃을 가능성, MVP 는 무시.
7. **categories/epics 의 `presentation` 미지정** — 풀스크린 push (sub-prd §8 "풀스크린 라우트"). modal 아님. task 13 와 일관.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §7 투두 생성, §주의사항 5
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — todo mutation 훅
- `apps/web/src/app/(main)/page.tsx` — web 의 modal wiring (Sub-03 task 13)
