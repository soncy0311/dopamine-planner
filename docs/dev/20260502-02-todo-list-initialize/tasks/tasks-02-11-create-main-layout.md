# TASK-02-11: `(main)/layout.tsx` 클라이언트 가드 + 네비 통합

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 11
- **상태**: 대기중
- **의존성**: 01 (supabase client), 09 (SideNav), 10 (MobileTabBar)

## 작업 목표

`(main)` 라우트 그룹의 layout 을 신설한다. 클라이언트 사이드 가드 (미로그인 시 `/login` redirect) 와 네비게이션 (`SideNav` + `MobileTabBar`) 을 통합하여 `/life` `/work` 에서 공유되는 셸을 만든다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/app/(main)/layout.tsx` | 신설 | `(main)` 그룹 layout |

### 구현 세부사항

- 파일 상단 `'use client'` (export 모드 → RSC 가드 불가)
- 가드 — `useEffect` 1개에서 `supabase.auth.getSession()` 호출 후 미로그인 시 `router.replace('/login')`
- 가드 진행 중에는 `null` 또는 로딩 placeholder 렌더 (세션 결과 도착 전 깜빡임 방지)
- 레이아웃 구조
  - 데스크톱 — `<SideNav />` (좌측 고정 240px) + `<main className="md:ml-60">{children}</main>`
  - 모바일 — `<MobileTabBar />` (하단 고정) + `<main className="pb-16">{children}</main>` (탭 바 높이만큼 패딩)
- `children` = `/life/page.tsx` 또는 `/work/page.tsx` (task 12)

### 참조 코드

sub-prd-02 §1 "`(main)` 라우트 클라이언트 가드" + §7 "워크스페이스 전환" 통합.

## 검증 과정

- [ ] `apps/web/src/app/(main)/layout.tsx` 파일 존재
- [ ] `'use client'` 디렉티브
- [ ] `useEffect` 1개로 세션 가드 (`supabase.auth.getSession()` → 미로그인 시 `router.replace('/login')`)
- [ ] `<SideNav />` (task 09), `<MobileTabBar />` (task 10) 모두 import·렌더
- [ ] middleware 사용 0건 (`grep -RIn "middleware" apps/web/middleware.ts` → 없음 또는 미사용)
- [ ] `pnpm --filter @todo-list/web build` 통과 (`output: 'export'` 정합)

## 주의사항

1. **세션 가드는 클라이언트 useEffect** — middleware 사용 금지 (`output: 'export'` 미지원). RSC 에서 세션 체크 시도 금지.
2. **가드 + 네비 동거** — 한 layout 에 두 책임이 모이지만 분리하지 않는다 (sub-prd §1 + §7 통합 명세). 가드는 useEffect 1개, 네비는 컴포넌트 import 로 명확히 구분.
3. **로딩 placeholder** — 세션 확인 전 `children` 렌더 시 미로그인 사용자가 잠깐 메인 화면을 본 후 redirect 되는 깜빡임 발생. `null` 또는 로딩 indicator 로 방어.
4. **redirect 무한 루프 방지** — `/login` 페이지에는 본 layout 적용 안 됨 ((auth) 그룹). 추가 가드 불필요.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §1, §7
- stack-pivot Sub-04 — `(auth)/login`, `app/auth/callback/route.ts`
