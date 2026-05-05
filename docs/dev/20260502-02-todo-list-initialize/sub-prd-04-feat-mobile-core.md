# SUB-PRD: `모바일 핵심 화면`

## 작업 정보

- **작업명**: `모바일 핵심 화면`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-05
- **종료일**: TBD
- **최신 업데이트**: 2026-05-05
- **상태**: 완료 (자동 검증) / 수동 시나리오·EAS 빌드 사용자 확인 대기
- **Main PRD**: [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md)
- **선행 Sub-PRD**: [`sub-prd-01-feat-core-services.md`](./sub-prd-01-feat-core-services.md)
- **선행 Sprint**: stack-pivot Sub-05 (Expo + Nativewind v4 셋업, expo-router 골격, deep link scheme `dopamine-planner://` 머지 완료)

## 배경 및 목적

선행 sprint(`stack-pivot`) Sub-05 가 Expo SDK 52 (React Native 네이티브) + Nativewind v4 + expo-router + OAuth deep link 스킴 까지 골격을 머지했다. 본 sub 는 그 위에 **RN 화면 5종** 을 완성한다:

1. 로그인 화면 (`/login`)
2. Life · Work 메인 일자 뷰 (`(tabs)/life`, `(tabs)/work`)
3. 투두 생성·수정·삭제 모달
4. 분류·Epic 관리 화면 (모바일 풀스크린 모달)
5. 설정 화면 (계정·로그아웃)

웹(Sub-02·03) 과 동일 비즈니스 로직(`@todo-list/core`) 을 import 하지만, RN UI 는 `apps/mobile/src/components/` 에 직배치한다 (`packages/ui-mobile` 미신설 정책 유지). EAS Build profile=preview 산출물 빌드 검증은 본 sub 에서 수행하되, 다중 디바이스 sync 통합 시나리오는 Sub-05 에 위임한다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Expo SDK 52, React Native 0.76 |
| 라우팅 | expo-router v4 (file-based) |
| 스타일 | Nativewind v4 (Tailwind className → RN style) |
| 인증 | `expo-auth-session` (OAuth) + deep link `dopamine-planner://auth/callback` |
| 스토리지 | `@react-native-async-storage/async-storage` (Supabase storage adapter) |
| 상태 | TanStack Query v5 (Sub-01 의 훅) |
| 빌드 | EAS Build profile=preview (Sub-05 통합 검증의 산출물) |

## 핵심 요구 사항

### 1. Supabase 클라이언트 + AsyncStorage adapter

- `apps/mobile/src/lib/supabase.ts` — `createClient` (Sub-01) + `AsyncStorage` 주입
- `AsyncStorage` import 는 **`apps/mobile` 안에서만**. `packages/core` 본문에 들어가지 않음

### 2. 로그인 화면 (`apps/mobile/src/app/login.tsx`)

- "Google 로 계속하기" 버튼
- `expo-auth-session` 으로 OAuth 흐름 → deep link `dopamine-planner://auth/callback` 수신 → `supabase.auth.exchangeCodeForSession`

### 3. OAuth deep link 처리

- `apps/mobile/app.json` 의 `scheme: 'dopamine-planner'` (이미 stack-pivot 머지)
- 콜백 도착 시 root 의 deep link handler 가 `code` 추출 → 세션 교환 → `(tabs)/life` 로 navigation
- 로그인 성공 후 앱 재시작 시 세션 복원 (AsyncStorage 어댑터)

### 4. 탭 라우트 (`(tabs)`)

- `apps/mobile/src/app/(tabs)/_layout.tsx` — 하단 탭 (`Life` / `Work` / `설정`)
- `(tabs)/life.tsx`, `(tabs)/work.tsx`, `(tabs)/settings.tsx`

### 5. 메인 일자 뷰 RN (`<MainDailyViewMobile>`)

- 동일 데이터 흐름 (`useTodos(workspace, date)` + `subscribeTodos`)
- 좌우 스와이프로 일자 이동 (`react-native-gesture-handler`)
- 상단 DateHeader (월 + 주간) — 탭으로 일자 선택
- 두 섹션 (완료 / 진행 중) — `FlatList` 또는 `ScrollView`

### 6. `<TodoItemMobile>` 컴포넌트

- `<Pressable>` + 체크박스 아이콘 + 제목 + 분류 라벨
- 토글 → `useToggleTodo()`
- 탭 (체크박스 외 영역) → 상세 모달 open
- 최소 hit area 44x44

### 7. 투두 생성 모달

- `<Modal>` 또는 `expo-router` 의 modal route
- 폼: 제목 / 설명 / 우선순위 / 분류 / Epic / due_date (`@react-native-community/datetimepicker`)
- 제출 → `useCreateTodo()`

### 8. 관리 화면 (분류·Epic) + 설정

- `(tabs)/settings.tsx` — 계정 정보 + 분류 관리 / Epic 관리 / 로그아웃 진입
- 분류·Epic 화면은 풀스크린 라우트 (`/categories`, `/epics`)
- 로그아웃 → `signOut + qc.clear + router.replace('/login')`

### 9. Nativewind 토큰 매핑 검증

- 디자인 토큰 (`packages/config/tailwind.config.js`) 의 색·간격이 RN 화면에서 시각 일치
- 시뮬레이터 화면 vs `docs/base/design-system/` 가이드 비교
- 미지원 className 발견 시 `Platform.select` 분기 처리

### 10. EAS Build profile=preview 빌드

- `eas.json` profile=preview 로 internal distribution 빌드 산출물 생성 가능 검증
- 산출물 자체의 다중 디바이스 sync 검증은 Sub-05 에 위임

## 핵심 구현 로직

### Supabase 클라이언트 + AsyncStorage adapter

```tsx
// apps/mobile/src/lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@todo-list/core';

export const supabase = createClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  storage: AsyncStorage,
});
```

### OAuth deep link

```tsx
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';

const redirectUri = Linking.createURL('auth/callback'); // dopamine-planner://auth/callback

async function loginWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUri, skipBrowserRedirect: true },
  });
  // expo-auth-session 으로 브라우저 launch + deep link 수신
}
```

### 좌우 스와이프 일자 이동

```tsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const swipe = Gesture.Pan().onEnd((e) => {
  if (e.translationX > 80) setDate(prevDate(date));
  else if (e.translationX < -80) setDate(nextDate(date));
});
```

### 디자인 토큰 시각 검증

- 시뮬레이터에서 `<View className="bg-purple-500 p-4 rounded-md">` 등 토큰 className 사용
- `docs/base/design-system/tokens.md` 의 HEX 값과 시뮬레이터 색이 일치하는지 육안 비교

## 구현 시 주의사항

1. **storage adapter 는 `apps/mobile` 안에서만** — `AsyncStorage` import 가 `packages/core/src/` 에 들어가면 안 됨 (Sub-01 의 검증)
2. **`react-native-webview` 의존성 0건 유지** — stack-pivot 에서 제거됨. `apps/mobile/package.json` 에 재추가 금지
3. **Nativewind 미지원 속성 platform 분기** — `box-shadow`, `gap` 일부 등은 RN 0.76 에서 미지원. 발견 시 `Platform.select` 또는 `style={}` 직접 작성
4. **deep link scheme 단일** — `dopamine-planner://` 만 사용. 다른 스킴 추가 금지 (`app.json` 변경 시 stack-pivot main-prd 갱신 필요)
5. **expo-router modal 사용 권장** — 풀스크린 모달은 expo-router 의 modal route 활용. RN `<Modal>` 직접 사용은 폼 stretch 시점에만
6. **Realtime 구독 unmount cleanup 의무** — 화면 언마운트 시 unsubscribe (RN 은 백그라운드 시 채널 누수 위험)
7. **EAS Build env 주입** — `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` 를 EAS 시크릿으로 주입. 코드에 하드코딩 금지
8. **EAS Build 산출물 검증은 본 sub 에서, 사용 검증은 Sub-05 에서** — 본 sub 는 "빌드 성공" 까지. "iOS 시뮬레이터 + 웹 동시 sync" 시나리오는 Sub-05

## 작업

- [x] `apps/mobile/src/lib/supabase.ts` 신설 (`createClient` + AsyncStorage 주입) — task 01 정합 검증
- [x] `apps/mobile/src/app/login.tsx` 신설 (OAuth 진입) — 실제 경로: `(auth)/login.tsx` 보강
- [x] `apps/mobile/src/app/_layout.tsx` 수정 (deep link handler + Query Provider)
- [x] `apps/mobile/src/app/(tabs)/_layout.tsx` 신설 (하단 탭 — Life / Work / 설정) — 실제 경로: `(main)/_layout.tsx`
- [ ] `apps/mobile/src/app/(tabs)/life.tsx` 신설 — task 09
- [ ] `apps/mobile/src/app/(tabs)/work.tsx` 신설 — task 09
- [ ] `apps/mobile/src/app/(tabs)/settings.tsx` 신설 — task 14
- [x] `apps/mobile/src/app/categories.tsx` 신설 (분류 관리)
- [x] `apps/mobile/src/app/epics.tsx` 신설 (Epic 관리)
- [x] `apps/mobile/src/app/create-todo.tsx` 신설 (modal route)
- [x] `apps/mobile/src/app/todo/[id].tsx` 신설 (상세 modal)
- [x] `apps/mobile/src/components/MainDailyViewMobile.tsx` 신설
- [x] `apps/mobile/src/components/TodoItemMobile.tsx` 신설 — 실제 경로: `components/TodoItem.tsx` 보강
- [x] `apps/mobile/src/components/DateHeaderMobile.tsx` 신설
- [x] `apps/mobile/src/components/forms/TodoForm.tsx` 신설
- [x] `apps/mobile/src/components/forms/CategoryForm.tsx` 신설
- [x] `apps/mobile/src/components/forms/EpicForm.tsx` 신설
- [x] 좌우 스와이프 일자 이동 (`react-native-gesture-handler`) — `runOnJS` + `activeOffsetX`
- [ ] 디자인 토큰 시각 검증 (시뮬레이터 ↔ `docs/base/design-system/`) — **수동 확인 필요**
- [ ] EAS Build profile=preview 빌드 산출물 생성 (iOS internal distribution) — **수동 확인 필요** (자격증명·시간 한계)
- [x] `pnpm --filter @todo-list/mobile typecheck` 통과 — 0 에러
- [ ] ~~`pnpm --filter @todo-list/mobile lint` 통과~~ — mobile ESLint 미설치 (별도 chore 분리)

## 검증 기준

- [ ] `pnpm --filter @todo-list/mobile dev` (`expo start`) iOS 시뮬레이터 부팅 — **수동 확인 필요**
- [ ] 로그인 화면에서 Google 로그인 → deep link `dopamine-planner://auth/callback` 수신 → `(main)/life` 로 navigation — **수동 확인 필요**
- [ ] 메인 일자 뷰 렌더 — 두 섹션 (완료/진행 중) + 카운트 — **수동 확인 필요**
- [ ] 좌우 스와이프로 일자 이동 동작 — **수동 확인 필요**
- [ ] 토글 시 즉시 섹션 이동 (optimistic) + 디바운스 후 epic 진행률 갱신 — **수동 확인 필요**
- [ ] FAB 또는 + 버튼으로 투두 생성 모달 진입 → 시드 추가 가능 — **수동 확인 필요**
- [ ] 분류·Epic 관리 화면 진입 + CRUD 동작 — **수동 확인 필요**
- [ ] 설정 → 로그아웃 → 로그인 화면 복귀 — **수동 확인 필요**
- [ ] 디자인 토큰 색·간격이 시뮬레이터 화면에 일치 (`docs/base/design-system/tokens.md` 비교) — **수동 확인 필요**
- [x] `grep -RIn "react-native-webview" apps/mobile/` 결과 0건 ✅ 2026-05-05
- [x] `grep -RIn "AsyncStorage" packages/core/src/` 결과 0건 ✅ 2026-05-05
- [ ] EAS Build profile=preview 빌드 성공 (iOS internal distribution 산출물 생성) — **수동 확인 필요** (자격증명·시간)
- [x] `pnpm --filter @todo-list/mobile typecheck` 통과 ✅ 2026-05-05

---

*이 문서는 `투두 서비스 초기화` 프로젝트의 Sub-PRD 입니다. 전체 범위는 [`main-prd-todo-list-initialize.md`](./main-prd-todo-list-initialize.md) 를 참조하세요.*
