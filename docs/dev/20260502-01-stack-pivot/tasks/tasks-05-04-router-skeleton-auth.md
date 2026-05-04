# Task 05-04: expo-router 골격 + 인증 화면 (index 폐기 + _layout + (auth)/login)

## 작업 정보

- **Sub-PRD**: `sub-prd-05-refactor-mobile-native.md`
- **의존성**:
  - 05-02 완료 (Nativewind 동작)
  - 05-03 완료 (`apps/mobile/src/lib/supabase.ts` 존재)
- **대상 파일**:
  - `apps/mobile/src/app/index.tsx` (redirect stub 으로 갱신 — 삭제 X)
  - `apps/mobile/src/app/_layout.tsx` (재작성)
  - `apps/mobile/src/app/(auth)/login.tsx` (신설)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-05-refactor-mobile-native.md`, `sub-prd-04-feat-web-spa.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `apps/mobile/src/app/index.tsx` 를 `<Redirect href="/(main)/life" />` stub 으로 갱신 (expo-router 그룹 구조의 진입점)
- [x] `apps/mobile/src/app/_layout.tsx` 신설 (QueryClientProvider, global.css import)
- [x] `apps/mobile/src/app/(auth)/login.tsx` Google OAuth (expo-auth-session)

## 구현 세부사항

### 1. `apps/mobile/src/app/index.tsx` redirect stub 으로 갱신 (삭제 X)

기존 12줄 SafeAreaView + WebView 래퍼를 폐기하고 다음 1줄 redirect stub 으로 갱신한다. expo-router 4 의 그룹 라우팅 (`(auth)` / `(main)`) 은 URL path 에서 그룹 폴더명이 무시되므로 root path `/` 진입을 직접 매칭하지 못한다. 따라서 `index.tsx` 가 단순 redirect 역할만 담당하게 한다.

```tsx
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(main)/life" />;
}
```

- 인증 상태이면 `(main)/_layout.tsx` 의 가드 통과 → `life` 진입
- 미인증이면 `(main)/_layout.tsx` 의 가드가 `<Redirect href="/(auth)/login" />` → 로그인 화면

### 2. `apps/mobile/src/app/_layout.tsx` 재작성

기존 12줄 Stack + StatusBar 코드를 폐기하고 다음 책임을 가진 layout 으로 재작성한다.

- `import './global.css'` (Nativewind 가 RN style 로 변환)
- `QueryClientProvider` 셋업 — `useState(() => new QueryClient())` 로 인스턴스 보존
- `Slot` 또는 `Stack` 으로 자식 라우트 렌더 (그룹 라우트 `(auth)` / `(main)` 자동 매칭)

권장 구조:

```tsx
import '../global.css';
import { useState } from 'react';
import { Slot } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
```

### 3. `apps/mobile/src/app/(auth)/login.tsx` 신설

Sub-PRD §핵심 구현 로직 (OAuth 흐름) 그대로 적용.

```tsx
import * as AuthSession from 'expo-auth-session';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async () => {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'dopamine-planner',
      path: 'auth/callback',
    });
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUri, skipBrowserRedirect: true },
    });
    const result = await AuthSession.startAsync({ authUrl: data.url! });
    if (result.type === 'success' && result.params.code) {
      await supabase.auth.exchangeCodeForSession(result.params.code);
      router.replace('/(main)/life');
    }
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Pressable onPress={handleLogin} className="rounded-md bg-primary px-4 py-2">
        <Text className="text-primary-foreground">Google 로그인</Text>
      </Pressable>
    </View>
  );
}
```

## 주의사항

1. **Expo Go 비호환** — Sub-PRD §주의사항 2. `expo-auth-session` + custom URI scheme 은 dev client / EAS build 에서만 동작. 검증은 05-07 에서 수행
2. **redirectUri 일치** — `expo-auth-session.makeRedirectUri` 결과가 Supabase Dashboard 화이트리스트 (`dopamine-planner://auth/callback`) 와 정확히 일치해야 함 (Sub-03 task 03-06 결과 의존)
3. **global.css import 위치** — 루트 `_layout.tsx` 1회만 import. RN 환경이므로 `'use client'` 불필요
4. **QueryClient 인스턴스 보존** — `useState` 또는 module-scope 로 보존. 매 렌더 시 새로 생성하면 캐시 초기화됨
5. **index.tsx 단순 삭제 시 root path `/` 매칭 부재** — expo-router 4 는 `(group)` 폴더명을 URL path 에서 무시하므로 `(main)/life/index.tsx` 만으로는 `/` 진입 시 매칭 실패. 따라서 `index.tsx` 는 `<Redirect href="/(main)/life" />` stub 으로 유지. `(main)/_layout.tsx` 의 인증 가드가 미인증 시 `<Redirect href="/(auth)/login" />` 으로 분기
6. **`expo-auth-session.startAsync` deprecation 가능성** — v5 에서 deprecated, v6+ 에서 제거 가능. 본 task md SoT 코드는 그대로 사용하되, 후속 sprint 에서 필요 시 `WebBrowser.openAuthSessionAsync` 패턴으로 마이그레이션

## 검증 체크리스트

- [x] `grep -RIn "react-native-webview" apps/mobile/src/` 0건 (WebView 본질 폐기 확인)
- [x] `grep -n "Redirect" apps/mobile/src/app/index.tsx` 1건 (redirect stub 갱신 확인)
- [x] `ls apps/mobile/src/app/_layout.tsx apps/mobile/src/app/\(auth\)/login.tsx` 양쪽 존재
- [x] `grep -n "QueryClientProvider" apps/mobile/src/app/_layout.tsx` 1건
- [x] `grep -n "global.css" apps/mobile/src/app/_layout.tsx` 1건
- [x] `grep -n "expo-auth-session" apps/mobile/src/app/\(auth\)/login.tsx` 1건
- [x] `grep -n "scheme: 'dopamine-planner'" apps/mobile/src/app/\(auth\)/login.tsx` 1건
- [x] `grep -n "exchangeCodeForSession" apps/mobile/src/app/\(auth\)/login.tsx` 1건
