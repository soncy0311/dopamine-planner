# TASK-03-11: `lib/auth/logout.ts` (`signOut + qc.clear + redirect`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 11
- **상태**: 대기중
- **의존성**: (없음 — 공용 helper)

## 작업 목표

로그아웃 진입점을 단일 helper 로 모은다. `supabase.auth.signOut()` → `queryClient.clear()` → `/login` 으로 redirect 의 3 단을 한 함수에서 보장하여, 다른 계정으로 재로그인 시 캐시 잔존을 방지한다 (sub-prd §주의사항 5).

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/lib/auth/logout.ts` | 신설 | `useLogout()` 훅 (또는 `logout(client, qc, router)` 함수) |

### 구현 세부사항

훅 형태 (권장):

```ts
// apps/web/src/lib/auth/logout.ts
'use client';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return async function logout() {
    await supabase.auth.signOut();
    qc.clear();              // 모든 캐시 폐기 — 다른 계정 로그인 시 잔존 방지
    router.replace('/login');
  };
}
```

함수 형태도 OK (호출 측에서 hooks 직접 사용 후 함수로 전달):

```ts
// 또는 함수형
export async function logout(qc: QueryClient, router: AppRouterInstance) {
  await supabase.auth.signOut();
  qc.clear();
  router.replace('/login');
}
```

본 plan 은 훅 형태 권장 — settings 페이지에서 `const logout = useLogout()` 으로 한 줄 호출 가능.

## 검증 과정

- [ ] `apps/web/src/lib/auth/logout.ts` 파일 존재
- [ ] `'use client'` 디렉티브
- [ ] `signOut()` → `qc.clear()` → `router.replace('/login')` 순서
- [ ] `useLogout` 또는 등가 named export
- [ ] `pnpm --filter @todo-list/web typecheck` 통과

## 주의사항

1. **순서 의무** — `signOut` 먼저, 그 다음 `qc.clear`, 마지막 redirect. clear 가 signOut 보다 먼저면 새 invalidate 가 자동으로 다시 fetch 트리거할 위험.
2. **`qc.clear()` 의무** — `qc.removeQueries()` 가 아니라 `clear()`. 모든 캐시 (mutations 포함) 폐기 (sub-prd §주의사항 5).
3. **`router.replace`** — `push` 가 아닌 `replace` 로 history 잔존 방지. 뒤로가기로 보호 페이지 재진입 차단.
4. **세션 가드와의 관계** — `(main)/layout.tsx` 의 세션 가드 (Sub-02) 가 미인증 상태로 보호 페이지 진입 시 `/login` 으로 redirect 보장. 본 helper 는 그 흐름을 능동적으로 트리거.
5. **공용 helper** — settings 페이지 외에도 향후 헤더 메뉴 / 모바일 탭바 등 다른 진입점에서도 재사용. 도메인 종속 텍스트 없음.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §5 설정, §핵심 구현 로직 "로그아웃", §주의사항 5
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) — 세션 가드 (`(main)/layout.tsx`)
