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
├── _layout.tsx              # Root 레이아웃 (인증 게이트)
├── (auth)/
│   ├── login.tsx
│   └── callback.tsx         # OAuth 콜백 (expo-auth-session)
└── (main)/
    ├── _layout.tsx          # 하단 탭 바
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

- Google OAuth 는 `expo-auth-session/providers/google` 사용
- 콜백 처리 후 Supabase 세션을 `setSession({ access_token, refresh_token })` 으로 주입
- `WebBrowser.maybeCompleteAuthSession()` 호출 누락 금지 (앱 진입 시 1회)
- 앱 스킴: `dopamine-planner://` (`app.json` `scheme` 필드)

## Nativewind v4 설정

- `nativewind` v4 설치 후 `tailwind.config.ts` 의 `presets: [require('nativewind/preset')]`
- `babel.config.js` 의 `plugins: ['nativewind/babel']`
- 글로벌 CSS: `app/global.css` 에 Tailwind base / components / utilities 임포트
- 컴포넌트는 `className` prop 으로 Tailwind 유틸리티 사용 (web 과 동일 토큰)

## 앱 설정 (app.json)

| 항목 | 값 |
|------|---|
| Bundle ID (iOS) | `com.daon.todolist` |
| Package (Android) | `com.daon.todolist` |
| Scheme | `dopamine-planner` |
| Orientation | portrait |
| UI Style | automatic (시스템 테마) |

## 환경 변수

`env/.env.mobile.local`에서 관리한다. `dev` 스크립트가 `dotenv-cli`로 자동 로드한다. 변수 목록은 `env/.env.mobile.example` 참조.

> Expo에서는 `EXPO_PUBLIC_` 접두사가 붙은 변수만 클라이언트에서 접근 가능하다.

## 실행 명령어

```bash
pnpm --filter @todo-list/mobile dev       # Expo 개발 서버
pnpm --filter @todo-list/mobile ios       # iOS 시뮬레이터 실행
pnpm --filter @todo-list/mobile android   # Android 에뮬레이터 실행
```

## 주의사항

- 프로덕션 빌드는 EAS Build를 사용한다 (`eas build`)
- 도메인 로직 변경은 `packages/core` 에서 수행한다 (web/mobile 공유 SoT)
- 네이티브 기능(푸시 알림, 카메라 등) 추가 시 Expo 플러그인을 `app.json`에 등록한다
- Supabase 직접 호출 / RPC 는 `@todo-list/core` services 를 경유한다 — 모바일에서 SDK 직접 import 지양
