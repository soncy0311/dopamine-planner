# Task 04-01: 웹 앱 기반 셋업 (next.config / supabase client / layout / globals.css)

## 작업 정보

- **Sub-PRD**: `sub-prd-04-feat-web-spa.md`
- **의존성**: Sub-02 완료 (`@todo-list/core` 패키지 골격), Sub-03 완료 (`packages/shared/src/database.ts` 자동 생성)
- **대상 파일**:
  - `apps/web/next.config.ts` (수정)
  - `apps/web/src/lib/supabase/client.ts` (신설)
  - `apps/web/src/app/layout.tsx` (수정)
  - `apps/web/src/app/globals.css` (신설)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-04-feat-web-spa.md`, `sub-prd-02-feat-core-package.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `apps/web/next.config.ts` 갱신 — `output: 'export'`, `transpilePackages`, `images.unoptimized`
- [ ] `apps/web/src/lib/supabase/client.ts` 신설 (`@todo-list/core/supabase/createClient` 사용)
- [ ] `apps/web/src/app/layout.tsx` — QueryClientProvider 셋업, `globals.css` import
- [ ] `apps/web/src/app/globals.css` — Tailwind directive + design-system 토큰 import

## 구현 세부사항

### 1. `apps/web/next.config.ts` 갱신

기존 파일에서 다음 항목을 추가/갱신한다.

- `output: 'export'` 추가 (정적 SPA export 활성화)
- `transpilePackages` 에 `@todo-list/core` 추가 (현재 `@todo-list/ui`, `@todo-list/shared` 만 있음)
- `images: { unoptimized: true }` 추가 (export 모드 호환)

최종 형태 예시:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['@todo-list/core', '@todo-list/ui', '@todo-list/shared'],
  images: { unoptimized: true },
};

export default nextConfig;
```

### 2. `apps/web/src/lib/supabase/client.ts` 신설

Sub-PRD §2 코드 그대로 적용. `@todo-list/core` 의 `createClient` 팩토리 호출.

```ts
import { createClient } from '@todo-list/core/supabase/createClient';

export const supabase = createClient({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  storage: typeof window !== 'undefined' ? window.localStorage : (undefined as any),
});
```

### 3. `apps/web/src/app/layout.tsx` 갱신

- `'use client'` 또는 별도 `Providers` 컴포넌트 분리하여 `QueryClientProvider` 셋업
- `QueryClient` 인스턴스를 `useState` 로 보존 (요청마다 새로 생성되지 않도록)
- `globals.css` import (`@/app/globals.css`)

권장 구조: `Providers` 컴포넌트를 별도 파일로 두고 `layout.tsx` 는 RSC 로 유지.

```tsx
// apps/web/src/app/providers.tsx (신설 가능)
'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

```tsx
// apps/web/src/app/layout.tsx
import './globals.css';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 4. `apps/web/src/app/globals.css` 신설

Tailwind v3 directive + design-system 토큰 CSS import.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* design-system 토큰 — packages/ui 또는 packages/config 경유 */
/* @import '@todo-list/ui/styles/tokens.css'; (실제 토큰 경로는 Sub-02 산출물에 맞게 조정) */
```

## 주의사항

1. **export 모드 + middleware 비호환** — 본 task 에서는 middleware 작성 0건 (Sub-PRD §주의사항 1)
2. **Tailwind v3** — `apps/web/CLAUDE.md` 가 v4 라고 명시되어 있더라도 Sub-02 결정에 따라 v3 + 공유 config 사용. CLAUDE.md 동기화는 별도 task 로 분리 (본 task 범위 밖)
3. **`SUPABASE_SERVICE_ROLE_KEY` 주입 금지** — 클라이언트 코드에 절대 노출하지 않는다 (Sub-PRD §주의사항 3)
4. **`createClient` 팩토리 시그니처 유지** — Sub-02 의 `createClient({ url, anonKey, storage })` 시그니처를 정확히 따른다

## 검증 체크리스트

- [ ] `grep -n "output: 'export'" apps/web/next.config.ts` 결과 1건
- [ ] `grep -n "@todo-list/core" apps/web/next.config.ts` 결과 1건 (transpilePackages 안)
- [ ] `grep -n "unoptimized" apps/web/next.config.ts` 결과 1건
- [ ] `ls apps/web/src/lib/supabase/client.ts apps/web/src/app/globals.css` 양쪽 존재
- [ ] `grep -n "QueryClientProvider" apps/web/src/app/layout.tsx apps/web/src/app/providers.tsx` 1건 이상 (또는 Providers import)
- [ ] `grep -n "@tailwind base" apps/web/src/app/globals.css` 1건
- [ ] `grep -RIn "SUPABASE_SERVICE_ROLE_KEY" apps/web/` 0건
