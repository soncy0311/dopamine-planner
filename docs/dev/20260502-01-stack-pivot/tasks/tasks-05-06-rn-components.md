# Task 05-06: RN 컴포넌트 stub (Button + TodoItem)

## 작업 정보

- **Sub-PRD**: `sub-prd-05-refactor-mobile-native.md`
- **의존성**: 05-02 완료 (Nativewind 동작)
- **대상 파일**:
  - `apps/mobile/src/components/Button.tsx` (신설)
  - `apps/mobile/src/components/TodoItem.tsx` (신설)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-05-refactor-mobile-native.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `apps/mobile/src/components/Button.tsx`, `TodoItem.tsx` stub

## 구현 세부사항

### 결정 #2 배치 정책

- `apps/mobile/src/components/` 에 RN 컴포넌트 직접 둠
- `packages/ui-mobile` MVP 미신설 — 재사용 누적 시 추출 (본 단계 범위 밖)
- `packages/ui` (web shadcn) 와 분리 — RN 호환 layer 미존재

### 1. `apps/mobile/src/components/Button.tsx` 신설

Pressable + className stub.

```tsx
import { Pressable, Text, type PressableProps } from 'react-native';

type Props = PressableProps & {
  label: string;
};

export function Button({ label, ...rest }: Props) {
  return (
    <Pressable className="rounded-md bg-primary px-4 py-2 active:opacity-80" {...rest}>
      <Text className="text-center text-primary-foreground">{label}</Text>
    </Pressable>
  );
}
```

### 2. `apps/mobile/src/components/TodoItem.tsx` 신설

View + Text + Pressable, todo row UI stub. 본 단계는 시그니처/마크업 stub 만 — 실제 toggle / drag handler 는 후속 sprint 에서 구현.

```tsx
import { View, Text, Pressable } from 'react-native';

type Props = {
  title: string;
  done?: boolean;
  onToggle?: () => void;
};

export function TodoItem({ title, done = false, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-3 border-b border-border px-4 py-3"
    >
      <View
        className={`h-5 w-5 rounded border ${done ? 'border-primary bg-primary' : 'border-border'}`}
      />
      <Text className={`flex-1 text-foreground ${done ? 'line-through opacity-60' : ''}`}>
        {title}
      </Text>
    </Pressable>
  );
}
```

## 주의사항

1. **`packages/ui` 미참조** — web 의 shadcn/Radix 컴포넌트는 RN 호환 불가. import 시 번들 깨짐
2. **`packages/ui-mobile` 미신설** — 결정 #2. 재사용 누적 시 추출 (본 단계 범위 밖)
3. **className 매핑 검증은 05-07 에서 수행** — 본 task 는 파일 작성만
4. **stub 수준 유지** — 본 task 는 시그니처/마크업 stub. 실제 인터랙션/접근성/애니메이션은 후속 sprint 에서 구현

## 검증 체크리스트

- [ ] `ls apps/mobile/src/components/Button.tsx apps/mobile/src/components/TodoItem.tsx` 양쪽 존재
- [ ] `grep -n "className" apps/mobile/src/components/Button.tsx` 1건 이상
- [ ] `grep -n "className" apps/mobile/src/components/TodoItem.tsx` 1건 이상
- [ ] `grep -n "Pressable" apps/mobile/src/components/Button.tsx` 1건
- [ ] `grep -RIn "from '@todo-list/ui'" apps/mobile/src/components/` 0건 (web ui 미참조)
- [ ] `grep -RIn "from 'react-dom'" apps/mobile/src/components/` 0건
