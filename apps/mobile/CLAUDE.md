# Todo List — Mobile (Expo + WebView)

## 개요

Expo 52 (React Native 0.76) 기반 모바일 앱. **WebView 래퍼**로 Next.js 웹 앱을 로드하는 구조.
UI 로직은 웹(`apps/web`)에서 처리하고, 네이티브 앱은 WebView 컨테이너 역할만 담당한다.

## 기술 스택

- Expo 52 (SDK)
- React Native 0.76
- Expo Router 4 (파일 기반 라우팅)
- react-native-webview 13
- react-native-safe-area-context (SafeArea 처리)

## 디렉토리 구조

```
apps/mobile/
├── src/
│   └── app/              # Expo Router (파일 기반 라우팅)
│       ├── _layout.tsx   # Root 레이아웃 (Stack)
│       └── index.tsx     # 홈 — WebView 로드
├── app.json              # Expo 설정
├── tsconfig.json
└── package.json
```

## 핵심 동작

- `index.tsx`에서 `EXPO_PUBLIC_WEBVIEW_URL` 환경 변수로 WebView URL을 설정한다
- 기본값: `http://localhost:3000` (개발 시 로컬 Next.js 서버)
- SafeAreaView로 노치/하단 영역을 처리한다
- StatusBar 스타일은 `auto` (시스템 테마 연동)

## 코드 규칙

- 경로 alias: `@/*` → `./src/*`
- 공유 타입은 `packages/shared`에서 가져온다 (`@todo-list/shared`)
- WebView 관련 네이티브 브릿지 로직만 이 앱에 작성한다
- UI 변경은 `apps/web`에서 한다 (WebView로 렌더링되므로)

## 앱 설정 (app.json)

| 항목 | 값 |
|------|---|
| Bundle ID (iOS) | `com.daon.todolist` |
| Package (Android) | `com.daon.todolist` |
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
- WebView 앱이므로 UI/디자인 시스템 변경은 `apps/web`에서 수행한다
- 네이티브 기능(푸시 알림, 카메라 등) 추가 시 Expo 플러그인을 `app.json`에 등록한다
- 백엔드(Supabase)와의 통신은 모두 웹 앱(`apps/web`)을 통해 처리된다 — 모바일 앱에서 별도 API 연동 불필요
