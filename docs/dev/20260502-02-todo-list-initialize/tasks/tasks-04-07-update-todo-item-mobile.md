# TASK-04-07: `components/TodoItem.tsx` 보강 (분류 라벨 + 우선순위 + 상세 진입 + hit area)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 07
- **상태**: 완료
- **의존성**: 01 (deps), Sub-01 task 12 (`useToggleTodo`)

## 작업 목표

stack-pivot Sub-05 가 머지한 `apps/mobile/src/components/TodoItem.tsx` 는 `title/done/onToggle` 만 받는 stub 상태이다. Sub-04 §6 요구를 충족하도록 (a) 분류 라벨 + 색 점, (b) 우선순위 표시, (c) `onPress` 분리 (체크박스 토글 vs 본문 → 상세 modal), (d) 최소 hit area 44x44 까지 보강한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/components/TodoItem.tsx` | 수정 (전면 보강) | 새 Props 시그니처 + UI |

### 새 Props

```ts
type Props = {
  todo: {
    id: string;
    title: string;
    done: boolean;
    priority?: 'low' | 'normal' | 'high';
    category?: { id: string; name: string; color: string };
  };
  onToggle: (id: string, next: boolean) => void;
  onPress: (id: string) => void; // 본문 탭 → 상세 modal
};
```

### 구현 세부사항

```tsx
// apps/mobile/src/components/TodoItem.tsx
import { Pressable, Text, View } from 'react-native';

type Todo = {
  id: string;
  title: string;
  done: boolean;
  priority?: 'low' | 'normal' | 'high';
  category?: { id: string; name: string; color: string };
};

type Props = {
  todo: Todo;
  onToggle: (id: string, next: boolean) => void;
  onPress: (id: string) => void;
};

const PRIORITY_LABEL: Record<NonNullable<Todo['priority']>, string> = {
  low: '낮음',
  normal: '보통',
  high: '높음',
};

export function TodoItem({ todo, onToggle, onPress }: Props) {
  return (
    <View className="flex-row items-center border-b border-border bg-background">
      {/* 체크박스 — 분리된 hit area */}
      <Pressable
        onPress={() => onToggle(todo.id, !todo.done)}
        className="min-h-11 min-w-11 items-center justify-center px-4 py-3"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.done }}
        accessibilityLabel={`${todo.title} ${todo.done ? '완료 해제' : '완료'}`}
        hitSlop={8}
      >
        <View
          className={`h-6 w-6 items-center justify-center rounded border ${
            todo.done ? 'border-primary bg-primary' : 'border-border'
          }`}
        >
          {todo.done && <Text className="text-xs text-primary-foreground">✓</Text>}
        </View>
      </Pressable>

      {/* 본문 — 상세 modal 진입 */}
      <Pressable
        onPress={() => onPress(todo.id)}
        className="min-h-11 flex-1 py-3 pr-4"
        accessibilityRole="button"
        accessibilityLabel={`${todo.title} 상세 보기`}
      >
        <View className="flex-row items-center">
          {todo.category && (
            <View className="mr-2 flex-row items-center">
              <View
                className="mr-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: todo.category.color }}
              />
              <Text className="text-xs text-muted-foreground">{todo.category.name}</Text>
            </View>
          )}
          {todo.priority === 'high' && (
            <Text className="mr-2 text-xs font-semibold text-red-600">높음</Text>
          )}
        </View>
        <Text
          className={`text-base ${
            todo.done ? 'text-muted-foreground line-through' : 'text-foreground'
          }`}
          numberOfLines={1}
        >
          {todo.title}
        </Text>
      </Pressable>
    </View>
  );
}
```

### 핵심 포인트

- 체크박스 / 본문 두 개의 `Pressable` — onPress 분리 (sub-prd §6)
- 각 Pressable `min-h-11` (44px) + `hitSlop` — 최소 hit area 44x44 충족
- 분류 색은 `style={{ backgroundColor }}` 직접 (Nativewind 가 dynamic className 미지원)
- 우선순위는 high 만 강조 (low/normal 은 라벨 노출 X — MVP)
- `numberOfLines={1}` — 긴 제목 ellipsis
- `accessibilityRole="checkbox"` + `accessibilityState={{ checked }}` — 스크린리더

## 검증 과정

- [x] `TodoItem.tsx` 새 Props 시그니처 (`todo`, `onToggle`, `onPress`) — `SubIssueWithJoins` 도메인 그대로 사용 (카멜케이스 정합)
- [x] 체크박스와 본문 Pressable 분리 — onPress 별도
- [x] 각 Pressable `min-h-11` (44px) + hitSlop
- [x] 분류 라벨 + 색 점 렌더 (category 존재 시)
- [x] 우선순위 high 시각 강조
- [x] 완료 시 line-through + muted color
- [x] `accessibilityRole`, `accessibilityState`, `accessibilityLabel`
- [x] `pnpm --filter @todo-list/mobile typecheck` 통과 — 본 task 신규 에러 0건
- [ ] 시뮬레이터에서 체크박스 탭과 본문 탭이 별도 동작 — **수동 확인 필요**

## 주의사항

1. **stub 시그니처 호환 깨짐** — 기존 `title/done/onToggle` 사용처가 있으면 호출부 수정 필요. 본 plan 시점엔 `(main)/life/index.tsx` 등 stub 만 존재하므로 영향 없음.
2. **Nativewind dynamic className 미지원** — 분류 색은 DB 값이라 `bg-{color}` 같은 className 생성 불가. `style={{ backgroundColor: color }}` 직접 사용.
3. **`hitSlop` 의무** — 시각 박스가 작아도 터치 영역 확장. iOS HIG / Material 가이드 모두 44px 권장.
4. **`onToggle(id, next)` 시그니처** — `useToggleTodo` (Sub-01 task 12) 가 받는 시그니처와 정합. `next` 가 명시적이라 optimistic mutation 처리 일관.
5. **상세 modal 진입은 호출 측 책임** — 본 컴포넌트는 `onPress(id)` 콜백만. 실제 navigation 은 호출 측 (task 08 의 MainDailyViewMobile) 에서 `router.push(`/todo/${id}`)`.
6. **우선순위 색 — Nativewind 미지원 주의** — `text-red-600` 은 표준 Tailwind 토큰 (RN 호환). 디자인 시스템 별도 토큰 (예: `text-priority-high`) 도입 시 정정.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §6 TodoItemMobile, §주의사항 3
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useToggleTodo` 시그니처
- `apps/web/src/components/ui/TodoItem.tsx` (Sub-02 task 03) — 웹 카운터파트
