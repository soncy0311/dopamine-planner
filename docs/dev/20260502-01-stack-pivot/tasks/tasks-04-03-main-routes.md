# Task 04-03: 메인 라우트 (가드 + life + work)

## 작업 정보

- **Sub-PRD**: `sub-prd-04-feat-web-spa.md`
- **의존성**: 04-01 완료 (`apps/web/src/lib/supabase/client.ts`), 04-06 완료 (`subscribeTodos` 본문 — life 페이지 import)
- **대상 파일**:
  - `apps/web/src/app/(main)/layout.tsx` (신설)
  - `apps/web/src/app/(main)/life/page.tsx` (신설)
  - `apps/web/src/app/(main)/work/page.tsx` (신설)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-04-feat-web-spa.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `apps/web/src/app/(main)/layout.tsx` — client-side 인증 가드
- [x] `apps/web/src/app/(main)/life/page.tsx` — Realtime 구독 훅 포함 stub
- [x] `apps/web/src/app/(main)/work/page.tsx` — stub

## 구현 세부사항

### 1. `(main)/layout.tsx` — client-side 인증 가드

Sub-PRD §핵심 구현 로직 코드 그대로. `'use client'`, `useEffect` 로 `getSession()` + `onAuthStateChange` 구독.

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

### 2. `(main)/life/page.tsx` — Life 일자 뷰 stub + Realtime 구독

`useLifeRealtime` 훅을 inline 정의 (또는 별도 hook 파일로 분리 가능 — 본 task 범위 내에서는 inline 으로 충분).

```tsx
'use client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeTodos } from '@todo-list/core/realtime/subscribeTodos';
import { supabase } from '@/lib/supabase/client';

function useLifeRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const unsub = subscribeTodos(supabase, 'life', () => {
      qc.invalidateQueries({ queryKey: ['todos', { workspace: 'life' }] });
    });
    return unsub;
  }, [qc]);
}

export default function LifePage() {
  useLifeRealtime();
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Life</h1>
      <p className="text-sm text-muted-foreground">Life 일자 뷰 (구현 예정)</p>
    </main>
  );
}
```

### 3. `(main)/work/page.tsx` — Work 일자 뷰 stub

본 단계에서는 단순 stub. Realtime 구독은 life 만으로 검증 충분 (Sub-PRD §검증 기준 3).

```tsx
'use client';

export default function WorkPage() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Work</h1>
      <p className="text-sm text-muted-foreground">Work 일자 뷰 (구현 예정)</p>
    </main>
  );
}
```

## 주의사항

1. **middleware 가드 금지** — export 모드에서 middleware 는 무시된다. 반드시 client-side `'use client'` + `useEffect` 패턴 (Sub-PRD §주의사항 1)
2. **본 task 는 stub** — 실제 UI (날짜 네비게이션, todo 리스트, 입력 등) 는 후속 sprint 에서 다룬다 (Sub-PRD §6 주석)
3. **`onAuthStateChange` cleanup** — `sub.subscription.unsubscribe()` 반드시 반환. 메모리 누수 방지
4. **`subscribeTodos` 시그니처 의존** — `(client, workspace, callback) => unsubscribe`. Sub-02/04-06 의 시그니처 변경 시 본 파일도 동기화

## 검증 체크리스트

- [x] `grep -n "'use client'" apps/web/src/app/\(main\)/layout.tsx` 1건
- [x] `grep -n "router.replace('/login')" apps/web/src/app/\(main\)/layout.tsx` 1건 이상
- [x] `grep -n "onAuthStateChange" apps/web/src/app/\(main\)/layout.tsx` 1건
- [x] `grep -n "subscribeTodos" apps/web/src/app/\(main\)/life/page.tsx` 1건
- [x] `grep -n "invalidateQueries" apps/web/src/app/\(main\)/life/page.tsx` 1건
- [x] `ls apps/web/src/app/\(main\)/work/page.tsx` 존재
- [x] `grep -RIn "middleware" apps/web/src/` 0건 (또는 본 task 범위 내 신규 추가 0건)
