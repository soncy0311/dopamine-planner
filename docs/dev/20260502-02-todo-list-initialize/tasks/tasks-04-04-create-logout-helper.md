# TASK-04-04: `lib/auth/logout.ts` 신설 (`signOut + qc.clear + redirect`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md)
- **작업 번호**: 04
- **상태**: 대기중
- **의존성**: (없음 — 공용 helper)

## 작업 목표

모바일 로그아웃 진입점을 단일 helper 로 모은다. `supabase.auth.signOut()` → `queryClient.clear()` → `router.replace('/(auth)/login')` 의 3 단을 한 함수에서 보장하여, 다른 계정으로 재로그인 시 캐시 잔존을 방지한다 (sub-prd §8 "로그아웃" + §주의사항 6 와 일관). Sub-03 task 11 의 web logout helper 와 동일 패턴이지만 모바일은 `useRouter` (expo-router) 사용.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/lib/auth/logout.ts` | 신설 | `useLogout()` 훅 |

### 구현 세부사항

```ts
// apps/mobile/src/lib/auth/logout.ts
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return async function logout() {
    await supabase.auth.signOut();
    qc.clear();              // 모든 캐시 폐기 — 다른 계정 로그인 시 잔존 방지
    router.replace('/(auth)/login');
  };
}
```

### 핵심 포인트

- 훅 형태 — settings 페이지 (task 14) 에서 `const logout = useLogout()` 으로 한 줄 호출
- `signOut` → `clear` → `replace` 순서 의무
- `router.replace` (push 아님) — history 잔존 방지

## 검증 과정

- [ ] `apps/mobile/src/lib/auth/logout.ts` 파일 존재
- [ ] `useLogout` named export
- [ ] `signOut()` → `qc.clear()` → `router.replace('/(auth)/login')` 순서
- [ ] `pnpm --filter @todo-list/mobile typecheck` 통과

## 주의사항

1. **순서 의무** — `signOut` 먼저, 그 다음 `qc.clear`, 마지막 redirect. `clear` 가 `signOut` 보다 먼저면 새 invalidate 가 자동으로 다시 fetch 트리거할 위험 (Sub-03 task 11 와 동일).
2. **`qc.clear()` 의무** — `qc.removeQueries()` 가 아니라 `clear()`. 모든 캐시 (mutations 포함) 폐기.
3. **`router.replace`** — `push` 가 아닌 `replace` 로 history 잔존 방지. 뒤로가기로 보호 페이지 재진입 차단.
4. **세션 가드와의 관계** — `(main)/_layout.tsx` 의 세션 가드 (이미 머지됨) 가 미인증 상태로 보호 페이지 진입 시 `/(auth)/login` 으로 redirect 보장. 본 helper 는 그 흐름을 능동적으로 트리거.
5. **공용 helper 정책** — settings 페이지 외에도 향후 알림/딥링크 등 다른 진입점에서 재사용. 도메인 종속 텍스트 없음.
6. **packages/core 격상 검토** — 본 plan 범위 외. 후속 리팩터에서 `apps/web/src/lib/auth/logout.ts` (Sub-03 task 11) 와 함께 `packages/core` 또는 `packages/shared` 격상 가능.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-04-feat-mobile-core.md`](../sub-prd-04-feat-mobile-core.md) §8 관리·설정, §주의사항 6
- `apps/web/src/lib/auth/logout.ts` (Sub-03 task 11) — web 카운터파트
