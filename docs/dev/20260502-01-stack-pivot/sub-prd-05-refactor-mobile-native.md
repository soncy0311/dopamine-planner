# SUB-PRD: `모바일 재구성`

## 작업 정보

- **작업명**: `모바일 재구성`
- **작업 유형**: `refactor` (구조 변경)
- **시작일**: 2026-05-04
- **종료일**: 2026-05-04
- **최신 업데이트**: 2026-05-04
- **상태**: 코드 작성 완료 (사용자 환경 검증 대기 — `pnpm install` / iOS 시뮬레이터 / OAuth / 다중 디바이스 sync)

## 배경 및 목적

기존 WebView 래퍼 (`apps/mobile/src/app/index.tsx` 가 react-native-webview 1개) 구조를 RN 네이티브로 전면 재구성한다. expo-router 기반 화면, Nativewind v4 토큰 매핑, expo-auth-session OAuth, Realtime 구독, EAS Build 를 도입하여 main PRD §2 (모바일 네이티브 전환) 결정을 코드로 실현한다. 본 단계 종료 시 다중 디바이스 sync 검증 (웹 + iOS 시뮬레이터 동시 접속) 을 통과한다.

## 의존성

- **Sub-02 산출물 필수**: `@todo-list/core` 패키지 (services / hooks / realtime — Sub-04 에서 실 구현 완료된 상태), `packages/config/tailwind.config.js`, `apps/mobile/tailwind.config.js` 골격
- **Sub-03 산출물 필수**: `packages/shared/src/database.ts`, Supabase Dashboard `dopamine-planner://auth/callback` 화이트리스트 + Google Provider
- **Sub-04 산출물 필수**: `packages/core` services / hooks / realtime 실 구현 (모바일에서 동일 헬퍼 재사용)

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Expo SDK 52 |
| 라우팅 | expo-router 4 |
| RN | React Native 0.76 |
| 스타일 | Nativewind v4 + Tailwind v3 (`packages/config/tailwind.config.js` 공유) |
| 인증 | `expo-auth-session` + custom URI scheme `dopamine-planner://` |
| 스토리지 | `@react-native-async-storage/async-storage` |
| 비즈니스 로직 | `@todo-list/core` |
| 빌드 | EAS Build (preview / production) |

## 핵심 요구 사항

### 1. 의존성 정리

Sub-02 에서 일부 처리됨. 본 단계에서 마무리.

| 추가 | 제거 |
|---|---|
| `expo-auth-session`, `expo-web-browser` | `react-native-webview` (Sub-02 처리분 확인) |
| `nativewind@^4.0.0`, `tailwindcss@^3.4.0` (Sub-02 처리분 확인) | — |
| `@react-native-async-storage/async-storage` | — |

### 2. Nativewind v4 셋업

- `apps/mobile/babel.config.js` — Nativewind babel plugin 등록
  ```js
  module.exports = function(api) {
    api.cache(true);
    return {
      presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    };
  };
  ```
- `apps/mobile/metro.config.js` — Nativewind metro 설정 (`withNativeWind`)
- `apps/mobile/tailwind.config.js` content paths 채움:
  ```js
  const shared = require('@todo-list/config/tailwind.config.js');
  module.exports = { ...shared, content: ['./src/**/*.{ts,tsx}'], presets: [require('nativewind/preset')] };
  ```
- `apps/mobile/src/global.css` — `@tailwind base/components/utilities;` (Nativewind v4 가 RN 으로 변환)

### 3. 앱 스킴 변경

`apps/mobile/app.json` 에서 `"scheme": "todo-list"` → `"scheme": "dopamine-planner"` (결정 #7).

### 4. expo-router 그룹 구조 도입

기존 `apps/mobile/src/app/index.tsx` 폐기. 신규 구조:

```
apps/mobile/src/app/
├── _layout.tsx                # 루트 layout (QueryClientProvider, supabase context)
├── (auth)/
│   └── login.tsx              # Google OAuth (expo-auth-session)
└── (main)/
    ├── _layout.tsx            # Tab navigator (Life/Work/Settings) + 인증 가드
    ├── life/index.tsx         # Life 일자 뷰 stub + Realtime 구독
    ├── work/index.tsx         # Work 일자 뷰 stub
    └── settings/index.tsx     # 설정 stub
```

### 5. 컴포넌트 배치 (결정 #2)

- `apps/mobile/src/components/` 에 RN 컴포넌트 직접 둠 — `Button.tsx`, `TodoItem.tsx` stub 등
- `packages/ui-mobile` MVP 미신설 — 재사용 누적 시 추출

### 6. supabase 클라이언트 — `apps/mobile/src/lib/supabase.ts`

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@todo-list/core/supabase/createClient';

export const supabase = createClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  storage: AsyncStorage,
});
```

### 7. OAuth 흐름 — `(auth)/login.tsx`

- `expo-auth-session` 으로 외부 브라우저 기동
- Redirect URI: `dopamine-planner://auth/callback`
- 콜백 deep link 수신 후 `supabase.auth.exchangeCodeForSession(code)` 호출
- 성공 시 `(main)/life` 로 router.replace

### 8. Realtime 구독

`(main)/life/index.tsx` 마운트 시 `@todo-list/core/realtime/subscribeTodos` 훅 재사용 — Sub-04 의 web 구현과 동일 헬퍼. RN 의 WebSocket 폴리필은 Expo 가 기본 제공.

### 9. EAS Build 설정 — `apps/mobile/eas.json`

```json
{
  "cli": { "version": ">=5.0.0" },
  "build": {
    "preview": { "distribution": "internal", "ios": { "simulator": true } },
    "production": { "autoIncrement": true }
  }
}
```

`expo-auth-session` 은 dev client 또는 EAS build 필요 — Expo Go 에서는 custom URI scheme 미동작.

## 핵심 구현 로직

### Tab Navigator 와 인증 가드

```tsx
// apps/mobile/src/app/(main)/_layout.tsx
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
  return <Tabs>{/* life/work/settings */}</Tabs>;
}
```

### expo-auth-session OAuth

```tsx
import * as AuthSession from 'expo-auth-session';
import { supabase } from '@/lib/supabase';

const redirectUri = AuthSession.makeRedirectUri({ scheme: 'dopamine-planner', path: 'auth/callback' });
const { data } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: redirectUri, skipBrowserRedirect: true },
});
const result = await AuthSession.startAsync({ authUrl: data.url! });
if (result.type === 'success' && result.params.code) {
  await supabase.auth.exchangeCodeForSession(result.params.code);
}
```

### iOS 시뮬레이터 deep link 테스트

```bash
xcrun simctl openurl booted "dopamine-planner://auth/callback?code=test"
```

## 구현 시 주의사항

1. **Nativewind v4 babel plugin 필수** — `apps/mobile/babel.config.js` 에 plugin 등록 누락 시 className 이 무시되어 스타일이 적용되지 않음
2. **Expo Go 비호환** — `expo-auth-session` + custom URI scheme 은 dev client / EAS build 에서만 동작. `expo start --dev-client` 또는 `eas build --profile preview` 사용
3. **AsyncStorage 비동기** — Supabase storage adapter 인터페이스에 맞게 `AsyncStorage` 의 `getItem/setItem/removeItem` 시그니처 그대로 전달 가능 (이미 Promise 반환)
4. **WebSocket 폴리필** — `packages/core/src/realtime/subscribeTodos.ts` 가 web/mobile 양쪽에서 동일하게 동작해야. Expo SDK 52 의 RN WebSocket 으로 충분
5. **scheme 변경 후 재빌드** — `app.json` 의 scheme 변경은 prebuild 또는 EAS build 재실행 필요. dev 서버 재시작만으로는 반영되지 않음
6. **environment 변수** — `EXPO_PUBLIC_` 접두사만 클라이언트 번들에 노출. Sub-03 의 `env/.env.mobile.example` 갱신 결과를 사용
7. **Tab navigator 의 Realtime 구독 lifecycle** — 화면 unmount 시 `unsubscribe` 호출 보장 (useEffect cleanup)

## 작업

- [x] `apps/mobile/package.json` 에서 `react-native-webview` 제거 (Sub-02 처리됐다면 확인만)
- [x] `apps/mobile/package.json` 에 `expo-auth-session`, `expo-web-browser`, `@react-native-async-storage/async-storage` 추가
- [x] `apps/mobile/package.json` 에 `nativewind`, `tailwindcss` 확인 (Sub-02 처리분)
- [x] `apps/mobile/babel.config.js` Nativewind plugin 등록
- [x] `apps/mobile/metro.config.js` Nativewind metro 설정 (`withNativeWind`)
- [x] `apps/mobile/tailwind.config.js` content paths 채움 + Nativewind preset
- [x] `apps/mobile/src/global.css` 신설 (Tailwind directive)
- [x] `apps/mobile/app.json` `scheme` 을 `todo-list` → `dopamine-planner` 변경
- [x] `apps/mobile/src/app/index.tsx` 를 redirect stub 으로 갱신 (`<Redirect href="/(main)/life" />` — 단순 삭제 시 root path 진입 라우트 부재)
- [x] `apps/mobile/src/app/_layout.tsx` 신설 (QueryClientProvider, `../global.css` import)
- [x] `apps/mobile/src/app/(auth)/login.tsx` Google OAuth (expo-auth-session)
- [x] `apps/mobile/src/app/(main)/_layout.tsx` Tab navigator + 인증 가드
- [x] `apps/mobile/src/app/(main)/life/index.tsx` stub + Realtime 구독 훅
- [x] `apps/mobile/src/app/(main)/work/index.tsx` stub
- [x] `apps/mobile/src/app/(main)/settings/index.tsx` stub
- [x] `apps/mobile/src/components/Button.tsx`, `TodoItem.tsx` stub
- [x] `apps/mobile/src/lib/supabase.ts` (core 팩토리 + AsyncStorage)
- [x] `apps/mobile/eas.json` 신설 (preview / production profile)
- [ ] `pnpm --filter @todo-list/mobile dev` (`expo start --dev-client`) iOS 시뮬레이터 부팅 검증 *(사용자 환경)*
- [ ] iOS 시뮬레이터에서 `(auth)/login` → Google OAuth → `(main)/life` 진입 검증 *(사용자 환경)*
- [ ] **검증 게이트**: 웹 `/life` + iOS `(main)/life` 동시 접속 → todo 추가 시 양쪽 즉시 반영 *(사용자 환경)*

## 검증 기준

- [ ] `pnpm --filter @todo-list/mobile dev` (`expo start --dev-client`) iOS 시뮬레이터 부팅 성공 *(사용자 환경)*
- [ ] `(auth)/login` 에서 Google OAuth 버튼 클릭 → 외부 브라우저 → 동의 → `dopamine-planner://auth/callback` 수신 → `(main)/life` 진입 *(사용자 환경)*
- [ ] `(main)/life` 에서 Nativewind className 정상 매핑 (디자인 토큰 색상/간격이 web `/life` 와 시각적으로 일치) *(사용자 환경)*
- [ ] **다중 디바이스 Realtime sync (검증 게이트)**: 웹 `/life` + iOS 시뮬레이터 `(main)/life` 동시 접속 → 한쪽에서 sub_issue INSERT 시 양쪽 화면 즉시 반영 *(사용자 환경)*
- [x] `grep -RIn "react-native-webview" apps/mobile/` 결과 0건
- [x] `grep -n '"scheme"' apps/mobile/app.json` 결과가 `"scheme": "dopamine-planner"`
- [x] `apps/mobile/eas.json` 존재 + `preview`, `production` profile 정의
- [ ] `xcrun simctl openurl booted "dopamine-planner://auth/callback?code=test"` 실행 시 앱이 deep link 수신 (로그 또는 화면 전환 확인) *(사용자 환경)*
- [x] `apps/mobile/babel.config.js` 에 `nativewind/babel` plugin 명시

---

*이 문서는 `스택 전환` 프로젝트의 Sub-PRD 입니다. 전체 범위는 `main-prd-stack-pivot.md` 를 참조하세요.*
