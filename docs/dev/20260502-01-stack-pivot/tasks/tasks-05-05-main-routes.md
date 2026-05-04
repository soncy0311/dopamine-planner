# Task 05-05: 메인 라우트 (Tab navigator + life/work/settings stub)

## 작업 정보

- **Sub-PRD**: `sub-prd-05-refactor-mobile-native.md`
- **의존성**:
  - 05-03 완료 (`apps/mobile/src/lib/supabase.ts`)
  - 05-04 완료 (루트 `_layout.tsx`)
  - Sub-04 완료 (`subscribeTodos` 본문 — `packages/core/src/realtime/subscribeTodos.ts`)
- **대상 파일**:
  - `apps/mobile/src/app/(main)/_layout.tsx` (신설)
  - `apps/mobile/src/app/(main)/life/index.tsx` (신설)
  - `apps/mobile/src/app/(main)/work/index.tsx` (신설)
  - `apps/mobile/src/app/(main)/settings/index.tsx` (신설)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-05-refactor-mobile-native.md`, `sub-prd-04-feat-web-spa.md`, `sub-prd-02-feat-core-package.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `apps/mobile/src/app/(main)/_layout.tsx` Tab navigator + 인증 가드
- [ ] `apps/mobile/src/app/(main)/life/index.tsx` stub + Realtime 구독 훅
- [ ] `apps/mobile/src/app/(main)/work/index.tsx` stub
- [ ] `apps/mobile/src/app/(main)/settings/index.tsx` stub

## 구현 세부사항

### 1. `(main)/_layout.tsx` — Tab navigator + 인증 가드

Sub-PRD §핵심 구현 로직 코드 그대로. middleware 가드 불가 → client-side 가드.

```tsx
import { Tabs, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MainLayout() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (authed === null) return null;
  if (!authed) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs>
      <Tabs.Screen name="life/index" options={{ title: 'Life' }} />
      <Tabs.Screen name="work/index" options={{ title: 'Work' }} />
      <Tabs.Screen name="settings/index" options={{ title: '설정' }} />
    </Tabs>
  );
}
```

### 2. `(main)/life/index.tsx` — Realtime 구독 훅

Sub-04 의 web 구현과 동일 헬퍼 (`@todo-list/core/realtime/subscribeTodos`) 재사용. `useEffect` cleanup 필수.

```tsx
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeTodos } from '@todo-list/core/realtime/subscribeTodos';
import { supabase } from '@/lib/supabase';

export default function LifeScreen() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeTodos(supabase, 'life', () =>
      qc.invalidateQueries({ queryKey: ['todos', { workspace: 'life' }] }),
    );
    return () => unsubscribe();
  }, [qc]);

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-foreground">Life 일자 뷰 (stub)</Text>
    </View>
  );
}
```

### 3. `(main)/work/index.tsx` — stub

```tsx
import { View, Text } from 'react-native';

export default function WorkScreen() {
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-foreground">Work 일자 뷰 (stub)</Text>
    </View>
  );
}
```

### 4. `(main)/settings/index.tsx` — stub

```tsx
import { View, Text } from 'react-native';

export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-foreground">설정 (stub)</Text>
    </View>
  );
}
```

## 주의사항

1. **middleware 가드 불가** — RN 에선 client-side 만 (Sub-PRD §핵심 구현 로직). 가드 로딩 중 (`authed === null`) 에는 null 반환으로 깜빡임 방지
2. **Realtime 구독 lifecycle** — Sub-PRD §주의사항 7. Tab unmount/remount 시 `unsubscribe` 호출 보장. `useEffect` cleanup 누락 시 메모리 누수 + 중복 구독
3. **`subscribeTodos` 시그니처 의존** — Sub-04 task 04-06 의 `(client, workspace, callback) => unsubscribe` 시그니처에 맞춤. Sub-04 미완료 시 import 경로 깨짐
4. **Tab.Screen name 정합** — `name="life/index"` 처럼 폴더+파일명을 슬래시로 결합한다 (expo-router 4 규약)
5. **WebSocket 폴리필** — Expo SDK 52 의 RN WebSocket 으로 충분 (Sub-PRD §주의사항 4)

## 검증 체크리스트

- [ ] `ls apps/mobile/src/app/\(main\)/_layout.tsx apps/mobile/src/app/\(main\)/life/index.tsx apps/mobile/src/app/\(main\)/work/index.tsx apps/mobile/src/app/\(main\)/settings/index.tsx` 4건 모두 존재
- [ ] `grep -n "Tabs" apps/mobile/src/app/\(main\)/_layout.tsx` 1건 이상
- [ ] `grep -n "Redirect" apps/mobile/src/app/\(main\)/_layout.tsx` 1건
- [ ] `grep -n "onAuthStateChange" apps/mobile/src/app/\(main\)/_layout.tsx` 1건
- [ ] `grep -n "subscribeTodos" apps/mobile/src/app/\(main\)/life/index.tsx` 1건
- [ ] `grep -n "invalidateQueries" apps/mobile/src/app/\(main\)/life/index.tsx` 1건
- [ ] `grep -n "useEffect" apps/mobile/src/app/\(main\)/life/index.tsx` 1건
