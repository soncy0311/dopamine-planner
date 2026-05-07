# TASK-02-09: `SideNav` 컴포넌트 (데스크톱 240px)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 09
- **상태**: 완료
- **의존성**: (없음)

## 작업 목표

데스크톱 뷰포트(240px 너비) 의 사이드 네비게이션을 신설한다. `Life` / `Work` / `설정` 3개 항목을 표시하며 활성 상태는 URL pathname (`/life` 또는 `/work`) 기준으로 결정된다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/SideNav.tsx` | 신설 | `<SideNav />` 컴포넌트 |

### 구현 세부사항

- 파일 상단 `'use client'` (`usePathname` 사용)
- 너비 `w-60` (240px), 좌측 고정 (`fixed left-0 top-0 h-screen`)
- 항목 3개
  - `Life` → `/life`
  - `Work` → `/work`
  - `설정` → `/settings` (라우트 자체는 Sub-03)
- 활성 항목 표시 — `usePathname()` 결과로 `pathname.startsWith('/life')` 등 매칭하여 강조 스타일
- 반응형 — `hidden md:flex` (모바일 뷰포트에서 숨김; 모바일은 task 10 의 `MobileTabBar`)
- WCAG 44x44 hit area (각 항목 패딩)

### 참조 코드

sub-prd-02 §7 "워크스페이스 전환" 명세 그대로.

## 검증 과정

- [x] `apps/web/src/components/SideNav.tsx` 파일 존재
- [x] `'use client'` 디렉티브
- [x] 3개 항목 (`Life` / `Work` / `설정`) 모두 렌더
- [x] `usePathname()` 기반 활성 표시 분기 존재
- [x] `hidden md:flex` 반응형 분기
- [x] 각 항목 hit area 44x44 이상 (`h-11`)
- [x] `tsc --noEmit` 본 파일 관련 에러 0건

## 주의사항

1. **/settings 라우트는 미존재** — 본 sub 에서는 링크만 두고 페이지 자체는 Sub-03. 클릭 시 404 가 나도 본 sub 범위 밖.
2. **인라인 색 금지** — 활성/비활성 강조 모두 디자인 토큰 className.
3. **next/link 사용** — 클라이언트 라우팅을 위한 `<Link>` 사용 (a 태그 직접 사용 금지).
4. **hit area 44x44** — 디자인 시스템 명세에 따라 각 항목에 충분한 패딩.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §7
- `docs/base/design-system/` — 네비게이션 토큰
