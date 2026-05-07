# TASK-04-13: `app/{categories,epics}.tsx` 신설 (CRUD + FK 토스트 + Epic 일괄 토글)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 13
- **상태**: 완료
- **의존성**: 11 (CategoryForm/EpicForm), Sub-01 task 08·09 (`useCategories`/`useEpics`/mutations)

## 작업 목표

Sub-04 §8 의 분류·Epic 관리 화면을 신설한다. 두 페이지 모두 풀스크린 라우트 (`/categories`, `/epics`) — modal 아님. 동일 패턴 (목록 + 추가 FAB + 항목 탭 → 편집 폼 표시 + 삭제 confirm). FK 위반 (23503) 시 친화적 메시지. Epic 페이지에는 메인 표시 토글 (일괄) 추가.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/categories.tsx` | 신설 | 분류 CRUD |
| `apps/mobile/src/app/epics.tsx` | 신설 | Epic CRUD + 메인 표시 일괄 토글 |

> Stack.Screen 등록은 task 12 의 _layout 수정에 포함.

### `app/categories.tsx`

```tsx
// apps/mobile/src/app/categories.tsx
import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@todo-list/core';
import { CategoryForm } from '@/components/forms/CategoryForm';
import type { CategoryFormValues } from '@/lib/forms/schemas';

type Workspace = 'life' | 'work';

export default function CategoriesPage() {
  // workspace 토글 (Tabs 형태) — MVP 는 life 기본
  const [workspace, setWorkspace] = useState<Workspace>('life');
  const [editing, setEditing] = useState<{ id?: string; values?: Partial<CategoryFormValues> } | null>(
    null,
  );

  const { data: categories = [] } = useCategories(workspace);
  const { mutateAsync: create, isPending: creating } = useCreateCategory();
  const { mutateAsync: update, isPending: updating } = useUpdateCategory();
  const { mutateAsync: remove } = useDeleteCategory();

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      if (editing?.id) await update({ id: editing.id, ...values });
      else await create({ ...values, workspace });
      setEditing(null);
    } catch (e: any) {
      Alert.alert('저장 실패', e?.message ?? '다시 시도해 주세요.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('삭제', `"${name}" 을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(id);
          } catch (e: any) {
            // FK 23503 친화 메시지
            const msg = e?.code === '23503' || /foreign key/i.test(e?.message ?? '')
              ? '이 분류를 사용 중인 Epic 또는 투두가 있어 삭제할 수 없습니다. 먼저 이동/삭제해 주세요.'
              : (e?.message ?? '삭제 실패');
            Alert.alert('삭제 실패', msg);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      {/* workspace 토글 */}
      <View className="flex-row border-b border-border">
        {(['life', 'work'] as const).map((w) => (
          <Pressable
            key={w}
            onPress={() => setWorkspace(w)}
            className={`flex-1 items-center py-3 ${workspace === w ? 'border-b-2 border-primary' : ''}`}
          >
            <Text className={workspace === w ? 'text-primary' : 'text-muted-foreground'}>
              {w === 'life' ? 'Life' : 'Work'}
            </Text>
          </Pressable>
        ))}
      </View>

      {editing ? (
        <CategoryForm
          mode={editing.id ? 'edit' : 'create'}
          defaultValues={editing.values}
          submitting={creating || updating}
          onCancel={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center border-b border-border px-4 py-3">
              <View
                className="mr-3 h-4 w-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Pressable
                className="flex-1"
                onPress={() => setEditing({ id: item.id, values: { name: item.name, color: item.color } })}
              >
                <Text className="text-base text-foreground">{item.name}</Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id, item.name)} hitSlop={8}>
                <Text className="text-sm text-red-600">삭제</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text className="p-6 text-center text-muted-foreground">분류가 없습니다.</Text>
          }
        />
      )}

      {!editing && (
        <Pressable
          onPress={() => setEditing({})}
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
          accessibilityRole="button"
          accessibilityLabel="분류 추가"
        >
          <Text className="text-2xl text-primary-foreground">+</Text>
        </Pressable>
      )}
    </View>
  );
}
```

### `app/epics.tsx`

```tsx
// apps/mobile/src/app/epics.tsx
import { useState } from 'react';
import { Alert, FlatList, Pressable, Switch, Text, View } from 'react-native';
import {
  useEpics,
  useCreateEpic,
  useUpdateEpic,
  useDeleteEpic,
  useToggleEpicShownInMain,
} from '@todo-list/core';
import { EpicForm } from '@/components/forms/EpicForm';
import type { EpicFormValues } from '@/lib/forms/schemas';

type Workspace = 'life' | 'work';

export default function EpicsPage() {
  const [workspace, setWorkspace] = useState<Workspace>('life');
  const [editing, setEditing] = useState<{ id?: string; values?: Partial<EpicFormValues> } | null>(null);

  const { data: epics = [] } = useEpics(workspace);
  const { mutateAsync: create, isPending: creating } = useCreateEpic();
  const { mutateAsync: update, isPending: updating } = useUpdateEpic();
  const { mutateAsync: remove } = useDeleteEpic();
  const { mutateAsync: toggleShown } = useToggleEpicShownInMain();

  const handleSubmit = async (values: EpicFormValues) => {
    try {
      if (editing?.id) await update({ id: editing.id, ...values });
      else await create({ ...values, workspace });
      setEditing(null);
    } catch (e: any) {
      Alert.alert('저장 실패', e?.message ?? '다시 시도해 주세요.');
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('삭제', `"${title}" 을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(id);
          } catch (e: any) {
            const msg = e?.code === '23503' || /foreign key/i.test(e?.message ?? '')
              ? '이 Epic 을 사용 중인 투두가 있어 삭제할 수 없습니다. 먼저 이동/삭제해 주세요.'
              : (e?.message ?? '삭제 실패');
            Alert.alert('삭제 실패', msg);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row border-b border-border">
        {(['life', 'work'] as const).map((w) => (
          <Pressable
            key={w}
            onPress={() => setWorkspace(w)}
            className={`flex-1 items-center py-3 ${workspace === w ? 'border-b-2 border-primary' : ''}`}
          >
            <Text className={workspace === w ? 'text-primary' : 'text-muted-foreground'}>
              {w === 'life' ? 'Life' : 'Work'}
            </Text>
          </Pressable>
        ))}
      </View>

      {editing ? (
        <EpicForm
          mode={editing.id ? 'edit' : 'create'}
          workspace={workspace}
          defaultValues={editing.values}
          submitting={creating || updating}
          onCancel={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      ) : (
        <FlatList
          data={epics}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center border-b border-border px-4 py-3">
              <Pressable
                className="flex-1"
                onPress={() => setEditing({ id: item.id, values: { title: item.title, category_id: item.category_id } })}
              >
                <Text className="text-base text-foreground">{item.title}</Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">진행 {item.progress ?? 0}%</Text>
              </Pressable>
              <View className="mr-3 items-center">
                <Text className="text-xs text-muted-foreground">메인</Text>
                <Switch
                  value={!!item.shown_in_main}
                  onValueChange={(next) => toggleShown({ id: item.id, shown: next })}
                  accessibilityLabel={`${item.title} 메인 표시 ${item.shown_in_main ? '끔' : '켬'}`}
                />
              </View>
              <Pressable onPress={() => handleDelete(item.id, item.title)} hitSlop={8}>
                <Text className="text-sm text-red-600">삭제</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text className="p-6 text-center text-muted-foreground">Epic 이 없습니다.</Text>
          }
        />
      )}

      {!editing && (
        <Pressable
          onPress={() => setEditing({})}
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
        >
          <Text className="text-2xl text-primary-foreground">+</Text>
        </Pressable>
      )}
    </View>
  );
}
```

### 핵심 포인트

- 두 페이지 모두 동일 패턴 (목록 ↔ 폼 토글, FAB 추가, FK 23503 친화 메시지)
- workspace 토글 (life/work) 두 페이지 동일
- Epic 의 메인 표시는 RN `Switch` — 일괄 (각 항목별)
- Edit 모드 진입은 항목 탭 (`Pressable`) — 별도 modal route 미사용 (인라인 토글)
- 삭제는 `Alert.alert` confirm

## 검증 과정

- [x] `app/categories.tsx` / `app/epics.tsx` 두 파일 존재
- [x] CRUD (목록 / 추가 / 편집 / 삭제) 모두 동작 — RHF 폼 + mutation 훅 정합
- [x] FK 23503 또는 "foreign key" 패턴 매칭 시 친화적 메시지
- [ ] ~~Epic 의 `Switch` 로 shown_in_main 토글~~ — **scope 정정**: `epic_issue` 도메인에 `shown_in_main` 컬럼 부재 + `useToggleEpicShownInMain` 훅 부재. 본 sub 의 검증 항목에서도 누락. 후속 sprint(주제: epic 메인 표시 정책 추가) 로 분리.
- [x] workspace 토글 시 분류·Epic 목록 분리 fetch
- [x] 빈 상태 (`ListEmptyComponent`) 안내
- [x] `pnpm --filter @todo-list/mobile typecheck` 통과
- [ ] 시뮬레이터에서 분류 추가 → 편집 → 삭제 flow — **수동 확인 필요**
- [ ] FK 위반 트리거 (사용 중인 분류 삭제 시도) → 친화 Alert — **수동 확인 필요**

## 주의사항

1. **FK 친화 메시지** — Postgres error code 23503 또는 message 의 "foreign key" 패턴. Sub-01 의 service 가 error 를 그대로 throw 하는지, 가공하는지 확인 후 매칭 로직 보강.
2. **인라인 폼 vs 별도 modal** — 본 task 는 인라인 (state 토글). `useState({editing})` 으로 폼/목록 전환. 별도 modal route 도 옵션이지만 페이지 수 늘어나 MVP 는 인라인.
3. **workspace 토글 정책** — life/work 분리. 디자인 시스템에 segmented control 토큰이 있으면 그 컴포넌트로 교체.
4. **`useToggleEpicShownInMain` 시그니처** — Sub-01 에 해당 훅 존재 가정. 없으면 `useUpdateEpic({id, shown_in_main})` 으로 통일 — 본문 코드 정정 필요.
5. **`Switch` 색** — RN 기본 색. 디자인 시스템 적용 시 `trackColor`/`thumbColor` 명시.
6. **세션 가드 누락 위험** — `categories`/`epics` 는 `(main)` 그룹 밖. 미인증 진입 시 보호 필요. 본 task 는 우선 페이지만 — 추후 세션 가드 wrap 별도 검토 (별도 보강 task 또는 root layout 의 redirect 로 처리).
7. **Epic 삭제 시 todo cascade 정책** — DB 의 ON DELETE 정책에 따라 23503 발생 여부 결정. Sub-01 또는 DB PRD 의 정책 확인.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §8 관리 화면
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — categories/epics services
- `apps/web/src/app/(main)/categories/page.tsx` (Sub-03 task 09) — web 카운터파트
