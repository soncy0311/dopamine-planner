# TASK-04-08: `components/MainDailyViewMobile.tsx` 신설 (`useTodos` + Realtime + 좌우 스와이프 + FAB)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 08
- **상태**: 완료
- **의존성**: 06 (DateHeaderMobile), 07 (TodoItem), Sub-01 task 10·12·13 (`useTodos`/`useToggleTodo`/`subscribeTodos`)

## 작업 목표

Sub-04 §5 의 메인 일자 뷰 RN 컴포넌트를 신설한다. 동일 데이터 흐름 (`useTodos(workspace, date) + subscribeTodos`), 두 섹션 (완료 / 진행 중) `FlatList` 렌더, 좌우 스와이프 (`Gesture.Pan`) 일자 이동, FAB → 투두 생성 modal route 진입까지 단일 컴포넌트로 묶는다. life/work 페이지는 본 컴포넌트의 얇은 wrapper (task 09).

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/components/MainDailyViewMobile.tsx` | 신설 | `<MainDailyViewMobile workspace="life" \| "work" />` |

### Props

```ts
type Props = { workspace: 'life' | 'work' };
```

### 구현 세부사항

```tsx
// apps/mobile/src/components/MainDailyViewMobile.tsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useTodos, useToggleTodo, subscribeTodos } from '@todo-list/core';
import { DateHeaderMobile } from './DateHeaderMobile';
import { TodoItem } from './TodoItem';

type Props = { workspace: 'life' | 'work' };

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function todayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function MainDailyViewMobile({ workspace }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(() => todayIso());
  const { data: todos = [] } = useTodos(workspace, date);
  const { mutate: toggle } = useToggleTodo();

  // Realtime cleanup 의무 (sub-prd §주의사항 6)
  useEffect(() => {
    const unsubscribe = subscribeTodos(workspace, date);
    return () => unsubscribe();
  }, [workspace, date]);

  const swipe = useMemo(
    () =>
      Gesture.Pan().onEnd((e) => {
        'worklet';
        if (e.translationX > 80) {
          // 우측 스와이프 → 이전 일자
          // setDate 는 JS 컨텍스트라 runOnJS 필요 — RN reanimated 패턴
        }
      }),
    [],
  );

  // worklet → JS 콘텍스트 전환을 위해 별도 핸들러
  const onSwipeEnd = useCallback(
    (translationX: number) => {
      if (translationX > 80) setDate((d) => shiftDate(d, -1));
      else if (translationX < -80) setDate((d) => shiftDate(d, 1));
    },
    [],
  );

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20]) // 수평 의도 명확할 때만 활성화 (FlatList scroll 충돌 방지)
        .onEnd((e) => {
          // runOnJS 로 JS 컨텍스트 전환
          // import { runOnJS } from 'react-native-reanimated';
          // runOnJS(onSwipeEnd)(e.translationX);
        }),
    [onSwipeEnd],
  );

  const inProgress = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <GestureDetector gesture={swipeGesture}>
      <View className="flex-1 bg-background">
        <DateHeaderMobile date={date} onDateChange={setDate} />
        <FlatList
          data={[
            { type: 'header' as const, label: `진행 중 (${inProgress.length})` },
            ...inProgress.map((t) => ({ type: 'item' as const, todo: t })),
            { type: 'header' as const, label: `완료 (${done.length})` },
            ...done.map((t) => ({ type: 'item' as const, todo: t })),
          ]}
          keyExtractor={(row, idx) =>
            row.type === 'header' ? `h-${idx}` : `t-${(row as any).todo.id}`
          }
          renderItem={({ item }) =>
            item.type === 'header' ? (
              <Text className="bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
                {item.label}
              </Text>
            ) : (
              <TodoItem
                todo={item.todo}
                onToggle={(id, next) => toggle({ id, done: next })}
                onPress={(id) => router.push(`/todo/${id}`)}
              />
            )
          }
        />
        {/* FAB */}
        <Pressable
          onPress={() => router.push(`/create-todo?workspace=${workspace}&date=${date}`)}
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
          accessibilityRole="button"
          accessibilityLabel="새 투두 추가"
        >
          <Text className="text-2xl text-primary-foreground">+</Text>
        </Pressable>
      </View>
    </GestureDetector>
  );
}
```

### 핵심 포인트

- `useTodos(workspace, date)` + `useToggleTodo()` + `subscribeTodos(workspace, date)` — Sub-01 의 훅 의존
- `useEffect` cleanup 으로 Realtime unsubscribe (sub-prd §주의사항 6)
- `Gesture.Pan` 으로 좌우 스와이프 — `activeOffsetX([-20, 20])` 로 FlatList 수직 scroll 과 분리
- worklet → JS 컨텍스트 전환은 `runOnJS` (reanimated) — 호출부 import 필수
- 두 섹션 (진행 중 / 완료) 단일 `FlatList` + 헤더 row 로 구현 (`SectionList` 도 OK)
- FAB 는 `absolute` position + `bottom-6 right-6` — Tab bar 위
- Modal route 진입 — `/create-todo?workspace=...&date=...` query 전달

## 검증 과정

- [x] `MainDailyViewMobile.tsx` 파일 존재
- [x] `useTodos({client, workspace, date})` + `useToggleTodo(client)` 사용 — 실제 hook 시그니처 정합
- [x] `useEffect` 에서 `subscribeTodos(supabase, qc)` 구독 + cleanup 으로 unsubscribe
- [x] `Gesture.Pan` + `runOnJS` 로 좌우 스와이프 (translationX > 80 / < -80)
- [x] `activeOffsetX([-20, 20])` 로 수평 의도 명확화
- [x] 두 섹션 (진행 중 / 완료) + 카운트 헤더 — TodoDailyView 의 `data.todo` / `data.done` 그대로 활용
- [x] FAB 탭 → `router.push('/create-todo?workspace=...&date=...')`
- [x] TodoItem onPress → `/todo/{id}` navigate
- [x] `pnpm --filter @todo-list/mobile typecheck` 통과 — 본 task 신규 에러 0건
- [ ] 시뮬레이터에서 좌우 스와이프 → 일자 변경 동작 — **수동 확인 필요**
- [ ] 화면 unmount 시 Realtime 채널 해제 (콘솔 누수 경고 없음) — **수동 확인 필요**

## 주의사항

1. **Realtime cleanup 의무** — `useEffect` cleanup 에서 unsubscribe 필수 (sub-prd §주의사항 6). RN 백그라운드 시 채널 누수 위험. workspace 또는 date 변경 시에도 재구독.
2. **worklet → JS 컨텍스트 전환** — `Gesture.Pan().onEnd` 콜백은 worklet (UI thread) 에서 실행. `setDate` 같은 JS 함수 호출 시 `runOnJS` 래핑 의무 (reanimated 가이드).
3. **`activeOffsetX` 의무** — FlatList 수직 스크롤과 충돌 방지. `[-20, 20]` 으로 수평 20px 이상 움직일 때만 gesture 활성화.
4. **GestureHandlerRootView 의존** — task 02 가 root 에서 `<GestureHandlerRootView>` 로 감싸야 본 컴포넌트의 gesture 동작.
5. **subscribeTodos 시그니처** — Sub-01 task 13 의 export 시그니처와 정합 확인. (workspace, date) 인자 + 반환값이 unsubscribe 함수.
6. **카운트 표기** — "진행 중 (3)" / "완료 (5)" — sub-prd §검증 기준 "두 섹션 (완료/진행 중) + 카운트" 충족.
7. **Tab bar 와의 겹침** — FAB `bottom-6` 은 Tab bar 위. Tab bar 높이 변경 시 안전 영역 (`useSafeAreaInsets`) 고려.
8. **today 기준 timezone** — `new Date()` 는 디바이스 로컬 timezone. 멀티 timezone 사용자 케이스는 MVP 범위 외.
9. **분류 라벨 데이터 포함** — `useTodos` 가 todo + category join 결과 반환해야 TodoItem 의 category prop 채울 수 있음. Sub-01 task 10 의 select 절 확인.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §5 메인 일자 뷰, §핵심 구현 로직 "좌우 스와이프", §주의사항 6
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useTodos`/`useToggleTodo`/`subscribeTodos`
- `apps/web/src/components/MainDailyView.tsx` (Sub-02 task 08) — 웹 카운터파트
