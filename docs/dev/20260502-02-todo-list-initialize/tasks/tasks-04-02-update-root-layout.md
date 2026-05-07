# TASK-04-02: `app/_layout.tsx` 보강 (deep link handler + GestureHandlerRootView)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 02
- **상태**: 완료
- **의존성**: 01 (deps 설치 완료)

## 작업 목표

stack-pivot Sub-05 가 머지한 `apps/mobile/src/app/_layout.tsx` 는 QueryClientProvider 까지만 등록되어 있다. 본 task 는 sub-prd-04 §3 (OAuth deep link) 와 §주의사항 6 (Realtime cleanup) 을 위해 다음 두 가지를 추가 보강한다:

1. **deep link handler** — 앱이 백그라운드에서 deep link 로 깨어났을 때 `?code=` 추출 → `supabase.auth.exchangeCodeForSession` 폴백 처리 (login 화면이 아닌 곳에서 OAuth 콜백 도착하는 edge case)
2. **`GestureHandlerRootView`** — task 08 의 `Gesture.Pan` 좌우 스와이프 동작을 위해 root 에서 감싸야 함 (gesture-handler 의무)

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/_layout.tsx` | 수정 | deep link handler `useEffect` + `<GestureHandlerRootView style={{flex:1}}>` 래핑 |

### 구현 세부사항

```tsx
// apps/mobile/src/app/_layout.tsx
import '../global.css';
import 'react-native-gesture-handler'; // 반드시 entry 최상단
import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import * as Linking from 'expo-linking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const handleUrl = async (url: string) => {
      const parsed = Linking.parse(url);
      const code = parsed.queryParams?.code as string | undefined;
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    };

    // 콜드스타트 (앱이 닫힌 상태에서 link 로 launch)
    Linking.getInitialURL().then((url) => url && handleUrl(url));

    // 런타임 (앱이 background → foreground)
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

### 핵심 포인트

- `import 'react-native-gesture-handler'` 는 entry 파일 **최상단** 의무 (gesture-handler 공식 가이드)
- `GestureHandlerRootView` 는 `flex: 1` 로 화면 전체를 감싸야 child gesture 가 동작
- deep link handler 는 `(auth)/login.tsx` 의 `AuthSession.startAsync` 처리와 중복되지 않음 — login 화면에서 처리 못 한 edge case 폴백

## 검증 과정

- [x] `_layout.tsx` 에 `GestureHandlerRootView` 로 root 래핑
- [x] `_layout.tsx` 에 `Linking.getInitialURL()` + `Linking.addEventListener('url', ...)` 등록
- [x] cleanup 에서 `sub.remove()` 호출 (메모리 누수 방지)
- [x] `'react-native-gesture-handler'` import 가 entry 최상단
- [x] QueryClientProvider 는 그대로 유지 (회귀 없음)
- [x] `pnpm --filter @todo-list/mobile typecheck` 통과 — 본 task 신규 에러 0건. (기존 회귀는 후속 task 03·09 책임)
- [ ] iOS 시뮬레이터 부팅 + 로그인 화면 표시 (회귀 없음) — **수동 확인 필요**

## 주의사항

1. **`'react-native-gesture-handler'` 위치 의무** — entry 파일 최상단. 다른 import 보다 먼저. 위반 시 production 빌드에서 gesture 동작 불능 (cold start race condition).
2. **`GestureHandlerRootView` 의 `flex: 1`** — `style={{ flex: 1 }}` 누락 시 child 가 0 높이로 렌더되어 gesture 영역 0.
3. **deep link handler 중복 처리 방지** — `(auth)/login.tsx` 의 `startAsync` 가 정상 흐름. 본 handler 는 사용자가 로그인 화면을 떠난 상태에서 콜백 도착 시 폴백. `exchangeCodeForSession` 은 idempotent 가 아니므로 중복 호출 시 에러 가능 — 단순 무시.
4. **Realtime cleanup 은 화면 단위** — sub-prd §주의사항 6 의 Realtime cleanup 은 본 task 가 아니라 task 08 (MainDailyViewMobile) 의 `useEffect` 책임. 본 task 는 deep link 만.
5. **deep link scheme 단일** — `dopamine-planner://` 만 사용 (sub-prd §주의사항 4). `Linking.parse` 가 자동 처리.
6. **Query Provider 는 이미 존재** — sub-prd §작업 3 "Query Provider 추가" 는 이미 stack-pivot 머지. 회귀 없도록 보강만.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §3 OAuth deep link, §주의사항 4·6
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useTodos` / `subscribeTodos` (Realtime 책임 위치)
