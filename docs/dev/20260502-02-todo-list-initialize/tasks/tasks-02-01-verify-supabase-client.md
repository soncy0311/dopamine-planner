# TASK-02-01: `apps/web` Supabase client 정합 검증

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 01
- **상태**: 완료
- **의존성**: (없음 — stack-pivot Sub-04 산출물 검증)

## 작업 목표

`apps/web/src/lib/supabase/client.ts` 는 stack-pivot Sub-04 머지 시 이미 신설되어 있다. 본 task 는 sub-prd-02 §3 "Supabase 클라이언트 인스턴스화 (web)" 코드 예시와 현재 파일이 정합한지 검증하고, 어긋난 부분만 보정한다. **신설이 아니라 검증·보정 task** 이다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/lib/supabase/client.ts` | 검증·보정 | 정합 확인 (필요 시 보정) |

### 구현 세부사항

sub-prd-02 §3 코드 예시 정합 체크리스트:

- [x] 파일 상단 `'use client'` 디렉티브
- [x] `packages/core` 의 `createClient` import (자체 `@supabase/supabase-js` 의 createClient 직접 호출 금지)
- [x] 인자 형태 `{ url, anonKey, storage }` 준수
- [x] `url: process.env.NEXT_PUBLIC_SUPABASE_URL!`
- [x] `anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!`
- [x] `storage: typeof window !== 'undefined' ? window.localStorage : undefined`
- [x] export 심볼명 `supabase` (기본 export 가 아닌 named export)
- [x] `useSupabaseClient` 훅 또는 동등한 진입점이 `apps/web/src/components/MainDailyView.tsx` (task 08) 에서 import 가능 — `supabase` named export 로 직접 import

### 참조 코드

sub-prd-02 §3 "Supabase 클라이언트 인스턴스화 (web)" 그대로:

```tsx
// apps/web/src/lib/supabase/client.ts
'use client';
export const supabase = createClient({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});
```

## 검증 과정

- [x] `apps/web/src/lib/supabase/client.ts` 파일 존재
- [x] 위 정합 체크리스트 8개 항목 모두 충족
- [x] `pnpm --filter @todo-list/web typecheck` — web 패키지에 typecheck 스크립트 미정의. `cd apps/web && npx tsc --noEmit` 로 확인. `client.ts` 자체는 에러 0건. 사전 존재하던 `(main)/life/page.tsx` 의 `subscribeTodos` 3-arg 호출 에러는 task 12 가 재작성으로 해소. `auth/callback/route.ts` 의 implicit-any 는 본 sub 범위 밖이며 task 13 에서 별도 보정.
- [x] `grep -n "createClient" apps/web/src/lib/supabase/client.ts` — `import { createClient } from '@todo-list/core';` 확인

## 주의사항

1. **신설 금지** — 이미 존재하는 파일. overwrite 가 아니라 정합 검증·필요 시 부분 수정.
2. **storage SSR 가드** — `typeof window !== 'undefined'` 분기 누락 시 export build 단계에서 에러 발생 가능.
3. **sub-prd 본문과 코드 현실의 불일치** — sub-prd-02 §작업 4 가 "신설" 로 적혀 있지만 실제로는 stack-pivot Sub-04 머지 결과 이미 존재. 후속 docs PR 에서 sub-prd 본문을 "확인" 으로 정정 권장.
4. **env 누락 가드** — `NEXT_PUBLIC_*` 누락 시 런타임 에러. `env/.env.web.local` 존재 여부도 함께 검증.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §3
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `packages/core` createClient
