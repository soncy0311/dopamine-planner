# SUB-PRD: `웹 SPA`

## 작업 정보

- **작업명**: `웹 SPA`
- **작업 유형**: `feat` (새로운 기능 추가)
- **시작일**: 2026-05-04
- **종료일**: 2026-05-04
- **최신 업데이트**: 2026-05-04
- **상태**: 진행전

## 배경 및 목적

v2 웹 앱을 정적 SPA (`output: 'export'`) 로 export 하면서 **OAuth 콜백 Route Handler 만 서버에서 동작**하도록 구성한다. 메인 일자 뷰에 `@todo-list/core` 의 Realtime 구독 훅을 연결하고, Vercel 의 git 자동 배포 (dev → preview, main → production) 를 활성화한다. 본 단계에서 Sub-02 의 services / hooks / realtime stub 을 실 구현으로 채운다.

## 의존성

- **Sub-02 산출물 필수**: `@todo-list/core` 패키지 골격, `packages/config/tailwind.config.js`
- **Sub-03 산출물 필수**: `packages/shared/src/database.ts`, Supabase Dashboard Redirect URL / Google Provider 설정

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router, `output: 'export'`) |
| React | 19 |
| Supabase 콜백 | `@supabase/ssr` (Route Handler 전용) |
| 비즈니스 로직 | `@todo-list/core` (Sub-02 산출물) |
| 데이터 페칭 | `@tanstack/react-query` |
| 스타일 | Tailwind v3 (`packages/config/tailwind.config.js` 공유) |
| 배포 | Vercel (git 자동 배포) |

## 핵심 요구 사항

### 1. `apps/web/next.config.ts` 갱신

- `output: 'export'` 추가
- `transpilePackages: ['@todo-list/core', '@todo-list/ui', '@todo-list/shared']`
- `images: { unoptimized: true }` (export 모드 호환)

### 2. supabase 클라이언트 — `apps/web/src/lib/supabase/client.ts`

`@todo-list/core` 의 `createClient` 팩토리 호출. storage = `window.localStorage`.

```ts
import { createClient } from '@todo-list/core/supabase/createClient';

export const supabase = createClient({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined as any,
});
```

### 3. `apps/web/src/app/layout.tsx`

- `QueryClientProvider` (TanStack Query)
- 글로벌 supabase 클라이언트 컨텍스트 (필요 시)
- `globals.css` import (Tailwind directive + 토큰 import)

### 4. 인증 화면 — `(auth)/login/`

- `apps/web/src/app/(auth)/login/page.tsx` — Google OAuth 버튼 1개 (Kakao 미노출)
- `apps/web/src/app/(auth)/login/OAuthButton.tsx` — `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '<origin>/auth/callback' } })`

### 5. OAuth 콜백 Route Handler — `apps/web/src/app/auth/callback/route.ts`

- `output: 'export'` 모드에서도 Route Handler 는 동작 (Vercel 이 함수로 배포)
- `@supabase/ssr` 의 `createServerClient` 로 `exchangeCodeForSession(code)` 처리
- 성공 시 `/life` 로 redirect

### 6. 메인 화면 — `(main)/`

- `apps/web/src/app/(main)/layout.tsx` — **client-side 인증 가드** (export 모드에서는 RSC `cookies()` 가드 불가)
  ```tsx
  'use client';
  // useEffect 로 supabase.auth.getSession() 확인 → 없으면 router.replace('/login')
  ```
- `apps/web/src/app/(main)/life/page.tsx` — Life 일자 뷰 stub
- `apps/web/src/app/(main)/work/page.tsx` — Work 일자 뷰 stub

> 실제 UI 구현 (날짜 네비게이션, todo 리스트, 입력 등) 은 본 단계 범위 밖. 본 단계는 진입·인증·Realtime 구독 동작까지만 보장한다.

### 7. Realtime 구독

`(main)/life/page.tsx` 마운트 시 `@todo-list/core/realtime/subscribeTodos` 훅 사용. DB 변경 → TanStack Query `queryClient.invalidateQueries(['todos', { workspace: 'life' }])`.

### 8. `packages/core` stub 실 구현 (본 단계에서 채움)

- `packages/core/src/services/carryOver.ts` — `supabase.rpc('carry_over_todos', { target_date })` wrapper
- `packages/core/src/services/epicProgress.ts` — `supabase.rpc('recalc_epic_progress', { epic_id })` wrapper
- `packages/core/src/hooks/useTodos.ts`, `useCreateTodo.ts`, `useUpdateTodo.ts`, `useDeleteTodo.ts` — TanStack Query 훅
- `packages/core/src/realtime/subscribeTodos.ts` — Sub-02 의 시그니처 그대로, 실제 채널 구독 본문 채움

### 9. Vercel 자동 배포 (사용자 작업 — 본 Sub-PRD 의 검증 항목)

- Vercel 대시보드에서 본 레포 연결
- Production Branch: `main`
- Preview Branches: `dev` (및 모든 작업 브랜치)
- 환경 변수 주입: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 10. legacy `apps/web/src/app/api/**` 비재사용

- 현재 코드 베이스에 해당 디렉토리가 없음 확인 (Phase 4 종료 게이트)
- 본 단계 종료 시 `auth/callback` 외 다른 API 라우트 0건 보장

## 핵심 구현 로직

### Route Handler 와 export 모드 공존

`output: 'export'` 는 정적 페이지만 export 하지만, Route Handler (`route.ts`) 는 Vercel 이 별도 함수로 배포한다. middleware 는 export 빌드에서 동작하지 않으므로 인증 가드는 **client-side 로 한정**한다.

### client-side 인증 가드 패턴

```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login');
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);
  return <>{children}</>;
}
```

### Realtime + Query invalidation

```tsx
'use client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeTodos } from '@todo-list/core/realtime/subscribeTodos';
import { supabase } from '@/lib/supabase/client';

export function useLifeRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const unsub = subscribeTodos(supabase, 'life', () => {
      qc.invalidateQueries({ queryKey: ['todos', { workspace: 'life' }] });
    });
    return unsub;
  }, [qc]);
}
```

## 구현 시 주의사항

1. **export 모드 + middleware 비호환** — 인증 가드를 middleware 로 작성하면 정적 빌드 시 무시된다. 반드시 client-side
2. **`apps/web/src/app/api/**` 신규 추가 금지** — `auth/callback` 외 API 라우트는 RPC 로 대체
3. **`SUPABASE_SERVICE_ROLE_KEY` 사용 금지** — 클라이언트·Route Handler 어디에도 주입하지 않는다. RPC 의 SECURITY DEFINER 가 권한을 한정
4. **`packages/core` stub 채우기는 본 단계 범위** — Sub-02 의 시그니처를 유지하되, 본문을 실 구현으로 교체. 시그니처 변경 시 Sub-05 와 충돌 가능 → 변경하면 Sub-05 의존부 동기화
5. **Tailwind directive** — `apps/web/src/app/globals.css` 에 `@tailwind base/components/utilities;` + design-system 토큰 CSS import
6. **OAuth redirect URL** — `signInWithOAuth` 호출 시 `redirectTo` 가 Supabase Dashboard 화이트리스트와 정확히 일치해야 함 (Sub-03 사용자 작업 결과)

## 작업

- [ ] `apps/web/next.config.ts` 갱신 — `output: 'export'`, `transpilePackages`, `images.unoptimized`
- [ ] `apps/web/src/lib/supabase/client.ts` 신설 (`@todo-list/core/supabase/createClient` 사용)
- [ ] `apps/web/src/app/layout.tsx` — QueryClientProvider 셋업, `globals.css` import
- [ ] `apps/web/src/app/globals.css` — Tailwind directive + design-system 토큰 import
- [ ] `apps/web/src/app/(auth)/login/page.tsx` — Google OAuth 버튼 1개
- [ ] `apps/web/src/app/(auth)/login/OAuthButton.tsx` — `signInWithOAuth({ provider: 'google' })`
- [ ] `apps/web/src/app/auth/callback/route.ts` — code 교환 + `/life` redirect
- [ ] `apps/web/src/app/(main)/layout.tsx` — client-side 인증 가드
- [ ] `apps/web/src/app/(main)/life/page.tsx` — Realtime 구독 훅 포함 stub
- [ ] `apps/web/src/app/(main)/work/page.tsx` — stub
- [ ] `packages/core/src/services/carryOver.ts` 실 구현 (`supabase.rpc('carry_over_todos', ...)`)
- [ ] `packages/core/src/services/epicProgress.ts` 실 구현 (`supabase.rpc('recalc_epic_progress', ...)`)
- [ ] `packages/core/src/hooks/useTodos.ts` 실 구현 (TanStack Query useQuery)
- [ ] `packages/core/src/hooks/useCreateTodo.ts`, `useUpdateTodo.ts`, `useDeleteTodo.ts` 실 구현 (useMutation)
- [ ] `packages/core/src/realtime/subscribeTodos.ts` 실 구현 (channel.on('postgres_changes', …))
- [ ] `apps/web/src/app/api/**` 디렉토리에 `auth/callback` 외 파일 없음 확인
- [ ] `pnpm --filter @todo-list/web build` 통과 (정적 export 성공)
- [ ] **(사용자 작업)** Vercel 대시보드에서 본 레포 연결 (Production: main, Preview: dev + 작업 브랜치)
- [ ] **(사용자 작업)** Vercel 환경 변수 주입 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 검증 기준

- [ ] `pnpm --filter @todo-list/web build` 성공 (`output: 'export'` 정적 export — `out/` 디렉토리 생성)
- [ ] `pnpm --filter @todo-list/web dev` 후 브라우저 `/login` 진입 → Google OAuth 버튼 클릭 → 동의 화면 → `/auth/callback` → `/life` redirect
- [ ] `/life` 마운트 후 Supabase SQL Studio 에서 `sub_issue` 직접 INSERT → 화면에 즉시 반영 (Realtime)
- [ ] 미인증 상태로 `/life` 접근 시 `/login` 으로 redirect
- [ ] `find apps/web/src/app/api -type f` 결과가 `auth/callback/route.ts` 하나뿐
- [ ] `grep -RIn "SUPABASE_SERVICE_ROLE_KEY" apps/web/` 결과 0건
- [ ] Vercel 대시보드: `dev` push → preview URL 자동 생성, `main` push → production 자동 배포
- [ ] Vercel preview 빌드 로그에 `output: 'export'` 적용 흔적 (정적 페이지 export 메시지) 확인

---

*이 문서는 `스택 전환` 프로젝트의 Sub-PRD 입니다. 전체 범위는 `main-prd-stack-pivot.md` 를 참조하세요.*
