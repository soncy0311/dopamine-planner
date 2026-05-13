# Todo List — Mobile (Expo / React Native 네이티브)

## 개요

Expo 52 (React Native 0.76) 기반 **네이티브** 모바일 앱. expo-router 기반 라우팅, Supabase 직접 호출 + Postgres RPC, Nativewind v4 스타일, `@todo-list/core` 도메인 로직 공유. UI/도메인 로직은 web 과 동일한 SoT 를 사용한다.

## 기술 스택

- Expo 52 (SDK)
- React Native 0.76
- Expo Router 4 (파일 기반 라우팅)
- react-native-safe-area-context (SafeArea 처리)
- expo-auth-session (Google OAuth 네이티브 플로우)
- nativewind v4 (Tailwind 스타일링 — `packages/config/tailwind.config.js` 공유)
- `@todo-list/core` (Supabase 클라이언트·도메인 서비스·Realtime 훅 — web 과 공유)
- `@supabase/supabase-js` (core 패키지 경유)

## 디렉토리 구조

```
apps/mobile/src/app/         # expo-router (그룹 라우팅)
├── _layout.tsx              # Root 레이아웃 (QueryClientProvider, global.css)
├── index.tsx                # `/` → (main)/life redirect stub
├── (auth)/
│   └── login.tsx            # Google OAuth (expo-auth-session) — 콜백도 동일 화면에서 처리
└── (main)/
    ├── _layout.tsx          # Tab navigator + 인증 가드
    ├── life/
    ├── work/
    └── settings/
```

- `(auth)` 그룹: 비로그인 접근 가능 라우트
- `(main)` 그룹: 인증 필요 — life / work / settings 의 3개 탭

## 코드 규칙

- 경로 alias: `@/*` → `./src/*`
- 도메인 로직(Supabase 호출, RPC, Realtime 구독) 은 `@todo-list/core` 에서 가져온다 — **모바일에서 도메인 로직 중복 작성 금지**
- 공유 타입은 `@todo-list/shared`, 공유 UI 는 `@todo-list/ui` (RN 호환 컴포넌트는 추후 검토)
- 스타일은 `className` prop 으로 Tailwind 유틸리티 사용 (Nativewind v4)

## OAuth (expo-auth-session)

- Google OAuth 는 `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } })` 로 인증 URL 만 받고, `AuthSession.startAsync({ authUrl })` 로 외부 브라우저 기동
- 콜백 deep link 수신 후 `supabase.auth.exchangeCodeForSession(code)` 으로 세션 교환
- 별도 `(auth)/callback.tsx` 파일 미신설 — `(auth)/login.tsx` 안에서 startAsync 결과를 그대로 처리
- 앱 스킴: `dopamine-planner://` (`app.json` `scheme` 필드) — Supabase Dashboard 의 redirect URI 화이트리스트와 정확히 일치

## Nativewind v4 설정

- `apps/mobile/babel.config.js` — `babel-preset-expo` (`{ jsxImportSource: 'nativewind' }`) + `nativewind/babel` preset
- `apps/mobile/metro.config.js` — `withNativeWind(getDefaultConfig(__dirname), { input: './src/global.css' })`
- `apps/mobile/tailwind.config.js` — 공유 config (`@todo-list/config/tailwind.config.js`) 를 spread + `presets: [require('nativewind/preset')]`
- `apps/mobile/src/global.css` — `@tailwind base/components/utilities;` (루트 `_layout.tsx` 에서 `import '../global.css'`)
- 컴포넌트는 `className` prop 으로 Tailwind 유틸리티 사용 (web 과 동일 토큰)

## 앱 설정 (app.json)

| 항목 | 값 |
|------|---|
| Bundle ID (iOS) | `com.soncy0311.dopamineplanner` |
| Package (Android) | `com.soncy0311.dopamineplanner` |
| Scheme | `dopamine-planner` |
| Orientation | portrait |
| UI Style | automatic (시스템 테마) |

## 환경 변수

`env/.env.mobile.local`에서 관리한다. `dev` 스크립트가 `dotenv-cli`로 자동 로드한다. 변수 목록은 `env/.env.mobile.example` 참조.

> Expo에서는 `EXPO_PUBLIC_` 접두사가 붙은 변수만 클라이언트에서 접근 가능하다.

## 실행 명령어

루트 `Makefile` 을 단일 진입점으로 사용한다. Expo metro / 시뮬레이터는 호스트 macOS 의존이라 docker 미사용.

```bash
make mobile-dev       # Expo 개발 서버
make mobile-ios       # iOS 시뮬레이터
make mobile-android   # Android 에뮬레이터
make mobile-build     # 프로덕션 빌드 안내 (eas build)
```

> Supabase 가 필요하면 사전에 `make sb-start` (또는 `make up`) 로 기동.

## 주의사항

- 프로덕션 빌드는 EAS Build를 사용한다 (`eas build`)
- 도메인 로직 변경은 `packages/core` 에서 수행한다 (web/mobile 공유 SoT)
- 네이티브 기능(푸시 알림, 카메라 등) 추가 시 Expo 플러그인을 `app.json`에 등록한다
- Supabase 직접 호출 / RPC 는 `@todo-list/core` services 를 경유한다 — 모바일에서 SDK 직접 import 지양
