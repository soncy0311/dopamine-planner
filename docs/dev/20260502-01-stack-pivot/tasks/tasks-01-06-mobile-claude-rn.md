# Task 01-06: apps/mobile/CLAUDE.md RN 네이티브 정렬

## 작업 정보

- **Sub-PRD**: `sub-prd-01-docs-revamp.md`
- **의존성**: Task 01-03 (루트 CLAUDE.md 정합 확인 후)
- **대상 파일**: `apps/mobile/CLAUDE.md`
- **참조 파일**: `docs/dev/20260502-01-stack-pivot/main-prd-stack-pivot.md`, `detail-stack-pivot.md`, `docs/dev/20260502-01-stack-pivot/sub-prd-05-refactor-mobile-native.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `apps/mobile/CLAUDE.md` 라인 29~34 WebView 핵심 동작 블록 삭제
- [ ] `apps/mobile/CLAUDE.md` 라인 3~6 개요 갱신 (WebView 래퍼 → RN 네이티브)
- [ ] `apps/mobile/CLAUDE.md` 기술 스택에서 `react-native-webview` 제거, expo-auth-session / Nativewind v4 / @todo-list/core 추가
- [ ] `apps/mobile/CLAUDE.md` 디렉토리 구조 항목을 expo-router `(auth)/`, `(main)/{life,work,settings}/` 로 갱신
- [ ] `apps/mobile/CLAUDE.md` 신규 섹션 "OAuth (expo-auth-session)" 및 "Nativewind v4 설정" 추가

## 구현 세부사항

### 1. 라인 29~34 WebView 핵심 동작 블록 삭제

- WebView 컴포넌트 렌더 / 메시지 브릿지 / URL 라우팅 관련 핵심 동작 블록 일괄 삭제

### 2. 라인 3~6 개요 갱신

| 변경 전 | 변경 후 |
|---|---|
| Expo 52 모바일 앱. 웹 페이지를 WebView 로 로드하는 래퍼 클라이언트 | Expo 52 (React Native) 네이티브 클라이언트. expo-router 기반 / Supabase 직접 호출 / Nativewind v4 스타일 / `@todo-list/core` 도메인 로직 공유 |

### 3. 기술 스택 갱신

- 제거: `react-native-webview`
- 추가:
  - `expo-auth-session` (OAuth 네이티브 플로우)
  - `nativewind` v4 (Tailwind 스타일링)
  - `@todo-list/core` (web 과 공유되는 Supabase 클라이언트·도메인 로직)
  - `@supabase/supabase-js`, `@supabase/ssr` 호환 클라이언트 (core 패키지 경유)

### 4. 디렉토리 구조 (expo-router)

```
apps/mobile/src/app/
├── (auth)/
│   ├── login.tsx
│   └── callback.tsx
└── (main)/
    ├── life/
    ├── work/
    └── settings/
```

- expo-router 의 그룹 라우팅 사용
- `(auth)` 그룹: 비로그인 접근 가능 라우트
- `(main)` 그룹: 인증 필요. life / work / settings 의 3개 탭

### 5. 신규 섹션 "OAuth (expo-auth-session)"

```markdown
## OAuth (expo-auth-session)

- Google OAuth 는 `expo-auth-session/providers/google` 사용
- 콜백 처리 후 Supabase 세션을 `setSession({ access_token, refresh_token })` 으로 주입
- WebBrowser.maybeCompleteAuthSession() 호출 누락 금지
```

### 6. 신규 섹션 "Nativewind v4 설정"

```markdown
## Nativewind v4 설정

- `nativewind` v4 설치 후 `tailwind.config.ts` 의 `presets: [require('nativewind/preset')]`
- `babel.config.js` 의 `plugins: ['nativewind/babel']`
- 글로벌 CSS: `app/global.css` 에 Tailwind base / components / utilities 임포트
- 컴포넌트는 `className` prop 으로 Tailwind 유틸리티 사용
```

## 주의사항

1. **`react-native-webview` 표현 0건** — package 의존성 / 코드 / 본문 모두 제거
2. **`WebView 래퍼` 표현 0건** — 개요 / 본문 모두 grep 으로 검증
3. **expo-router 그룹 라우팅 표기 정확히** — `(auth)` / `(main)/{life,work,settings}` 누락 없이 명시
4. **OAuth 흐름은 expo-auth-session 으로 명시** — Supabase OAuth Provider 설정과 별개
5. **`@todo-list/core` 공유 강조** — 도메인 로직 중복 작성 금지 표현 포함

## 검증 체크리스트

- [ ] `grep -n "react-native-webview" apps/mobile/CLAUDE.md` 결과 0건
- [ ] `grep -n "WebView 래퍼" apps/mobile/CLAUDE.md` 결과 0건
- [ ] `grep -n "expo-auth-session" apps/mobile/CLAUDE.md` 결과 1건 이상
- [ ] `grep -n "nativewind" apps/mobile/CLAUDE.md` (대소문자 무시) 결과 1건 이상
- [ ] `grep -n "@todo-list/core" apps/mobile/CLAUDE.md` 결과 1건 이상
- [ ] 디렉토리 구조 블록에 `(auth)` / `(main)/life` / `(main)/work` / `(main)/settings` 모두 존재
- [ ] "OAuth (expo-auth-session)" / "Nativewind v4 설정" 신규 섹션이 모두 존재
