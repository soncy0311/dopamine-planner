# Task 04-02: 인증 플로우 (login + OAuthButton + callback route)

## 작업 정보

- **Sub-PRD**: `sub-prd-04-feat-web-spa.md`
- **의존성**: 04-01 완료 (`apps/web/src/lib/supabase/client.ts` 존재), Sub-03 task 03-06 완료 (Supabase Dashboard Redirect URL / Google Provider 설정)
- **대상 파일**:
  - `apps/web/src/app/(auth)/login/page.tsx` (신설)
  - `apps/web/src/app/(auth)/login/OAuthButton.tsx` (신설)
  - `apps/web/src/app/auth/callback/route.ts` (신설)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-04-feat-web-spa.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `apps/web/src/app/(auth)/login/page.tsx` — Google OAuth 버튼 1개
- [x] `apps/web/src/app/(auth)/login/OAuthButton.tsx` — `signInWithOAuth({ provider: 'google' })`
- [x] `apps/web/src/app/auth/callback/route.ts` — code 교환 + `/life` redirect

## 구현 세부사항

### 1. `(auth)/login/page.tsx`

`'use client'` 클라이언트 컴포넌트. 상단 로고/타이틀 + `<OAuthButton />` 1개 (Google 만 노출, Kakao 미노출).

```tsx
'use client';
import { OAuthButton } from './OAuthButton';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Todo List</h1>
      <OAuthButton />
    </main>
  );
}
```

### 2. `(auth)/login/OAuthButton.tsx`

Sub-PRD §4 코드 그대로. `redirectTo` 는 현재 origin + `/auth/callback`.

```tsx
'use client';
import { supabase } from '@/lib/supabase/client';

export function OAuthButton() {
  const handleClick = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button onClick={handleClick} className="rounded bg-black px-4 py-2 text-white">
      Google 로 시작하기
    </button>
  );
}
```

### 3. `auth/callback/route.ts`

`output: 'export'` 모드에서도 Route Handler 는 Vercel 함수로 배포된다 (Sub-PRD §5). `@supabase/ssr` 의 `createServerClient` 사용.

```ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet) => {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      },
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/life', request.url));
}
```

## 주의사항

1. **`redirectTo` 화이트리스트 일치** — Supabase Dashboard 의 Redirect URL 화이트리스트와 정확히 일치해야 한다 (Sub-PRD §주의사항 6, 03-06 결과 의존)
2. **`SUPABASE_SERVICE_ROLE_KEY` 사용 금지** — Route Handler 에도 service_role key 주입 금지. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 만 사용 (Sub-PRD §주의사항 3)
3. **export 모드에서도 route handler 동작** — page 가 아닌 `route.ts` 로 작성 필수. Next.js 가 `export` 빌드 중에도 `route.ts` 는 Vercel 함수로 분리 배포한다
4. **Kakao 미노출** — Google OAuth 1개만 (Sub-PRD §4)

## 검증 체크리스트

- [x] `grep -n "signInWithOAuth" apps/web/src/app/\(auth\)/login/OAuthButton.tsx` 1건
- [x] `grep -n "provider: 'google'" apps/web/src/app/\(auth\)/login/OAuthButton.tsx` 1건
- [x] `grep -n "exchangeCodeForSession" apps/web/src/app/auth/callback/route.ts` 1건
- [x] `grep -n "/life" apps/web/src/app/auth/callback/route.ts` 1건 (redirect 대상)
- [x] `grep -RIn "kakao" apps/web/src/app/\(auth\)/` 0건
- [x] `grep -RIn "SUPABASE_SERVICE_ROLE_KEY" apps/web/src/app/auth/callback/` 0건
- [x] `ls apps/web/src/app/\(auth\)/login/page.tsx apps/web/src/app/\(auth\)/login/OAuthButton.tsx apps/web/src/app/auth/callback/route.ts` 모두 존재
