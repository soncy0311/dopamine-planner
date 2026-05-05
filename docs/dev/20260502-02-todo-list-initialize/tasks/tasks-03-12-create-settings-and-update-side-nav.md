# TASK-03-12: `(main)/settings/page.tsx` 신설 + `SideNav` 수정

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 12
- **상태**: 완료
- **의존성**: 11 (useLogout)

## 작업 목표

설정 화면을 신설하고 사이드 네비에 "설정" 항목을 추가한다. 두 산출물은 동일 목적("설정 진입점 도입") 의 표면이므로 단일 task 로 묶는다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/app/(main)/settings/page.tsx` | 신설 | 설정 페이지 |
| `apps/web/src/components/SideNav.tsx` | 수정 | "설정" 메뉴 항목 추가 |

### `(main)/settings/page.tsx`

- 파일 상단 `'use client'`
- 동적 세그먼트 미사용 (`output: 'export'` 호환)
- 데이터: `supabase.auth.getUser()` 또는 `useUser()` 훅 (Sub-04 가 있다면) — `email`, `displayName` (user_metadata) 표시
- 섹션:
  1. **계정 정보** — email, displayName (read-only)
  2. **데이터 관리 진입 링크** — `/life/categories`, `/work/categories`, `/life/epics`, `/work/epics`
  3. **로그아웃 버튼** — `useLogout()` (task 11) 호출
  4. **(placeholder)** 통계, 테마 — "준비 중" 카드만
- 로그아웃 버튼 클릭 → `useLogout()` 의 함수 await → router 가 자동으로 `/login` 으로 이동

### `SideNav.tsx` 수정

- Sub-02 task 09 의 산출물에 "설정" 항목 추가
- 항목 순서: 라이프 / 워크 / (구분선) / 분류 관리 / Epic 관리 / 설정
  - 또는 원안: 라이프 / 워크 만 노출, 설정은 별도 섹션 (Sub-02 design 따라)
- 새 menu entry: `{ label: '설정', href: '/settings', icon: SettingsIcon }`
- 활성 라우팅: `usePathname()` 기반 `aria-current` 처리

### 참조 코드 골격

```tsx
// apps/web/src/app/(main)/settings/page.tsx
'use client';
import Link from 'next/link';
import { useLogout } from '@/lib/auth/logout';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const logout = useLogout();
  const [user, setUser] = useState<{ email?: string; displayName?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser({
        email: data.user?.email ?? undefined,
        displayName: data.user?.user_metadata?.name ?? undefined,
      });
    });
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6">
      <section>
        <h1 className="text-xl font-semibold">설정</h1>
        <div className="mt-2 text-sm text-muted-foreground">
          <div>이메일: {user?.email ?? '—'}</div>
          <div>이름: {user?.displayName ?? '—'}</div>
        </div>
      </section>
      <section className="grid gap-2">
        <Link href="/life/categories">라이프 분류 관리</Link>
        <Link href="/work/categories">워크 분류 관리</Link>
        <Link href="/life/epics">라이프 Epic 관리</Link>
        <Link href="/work/epics">워크 Epic 관리</Link>
      </section>
      <section>
        <button
          onClick={() => logout()}
          className="px-4 py-2 rounded bg-destructive text-destructive-foreground"
        >
          로그아웃
        </button>
      </section>
    </div>
  );
}
```

## 검증 과정

- [x] `apps/web/src/app/(main)/settings/page.tsx` 파일 존재
- [x] `'use client'` 디렉티브 + 동적 라우트 미사용 (export 호환)
- [x] 계정 정보 (email / displayName) 표시
- [x] 분류·Epic 관리 진입 링크 4 개
- [x] 로그아웃 버튼 → `useLogout()` 호출
- [x] `apps/web/src/components/SideNav.tsx` 에 `/settings` 메뉴 항목 추가 (sub-02 산출로 이미 존재 — 본 task 추가 수정 0)
- [x] `pnpm --filter @todo-list/web typecheck` 통과
- [x] `pnpm --filter @todo-list/web build` 통과 (export 정합)

## 주의사항

1. **`useLogout` 의 단일 진입점 의무** — settings 의 로그아웃 버튼은 본 helper 만 호출. inline `signOut()` 호출 금지 (qc.clear 누락 위험).
2. **계정 정보 source** — `supabase.auth.getUser()` 또는 Sub-01 의 user hook. user_metadata 필드명은 OAuth provider (Google) 의 `name` 또는 `full_name` 일 수 있음 — Sub-04 의 OAuth 콜백 산출물에 맞춰 정정.
3. **`output: 'export'` 호환** — 동적 라우트 미사용. RSC fetch 미사용.
4. **SideNav 변경 범위 한정** — Sub-02 task 09 의 다른 동작 (라이프/워크 토글, 키보드 단축키 등) 보존. "설정" 항목 추가만.
5. **placeholder 카드 (통계 / 테마)** — 본 task 에서 미구현. "준비 중" 표기만 (선택 사항).
6. **로그아웃 버튼 톤** — destructive 토큰 또는 secondary outline. 선택은 디자인 시스템 따라.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §5 설정, §6 라우트·네비
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) — `<SideNav>` (task 09)
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — supabase auth
