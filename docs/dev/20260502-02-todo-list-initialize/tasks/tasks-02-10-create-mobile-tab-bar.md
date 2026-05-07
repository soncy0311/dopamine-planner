# TASK-02-10: `MobileTabBar` 컴포넌트 (모바일 뷰포트 하단 탭)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md)
- **작업 번호**: 10
- **상태**: 완료
- **의존성**: (없음)

## 작업 목표

모바일 뷰포트의 하단 탭 바를 신설한다. 데스크톱 `SideNav` 와 동일한 3개 항목 (`Life` / `Work` / `설정`) 을 가지며, 활성 항목 표시도 동일 방식.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/MobileTabBar.tsx` | 신설 | `<MobileTabBar />` 컴포넌트 |

### 구현 세부사항

- 파일 상단 `'use client'`
- 위치 — `fixed bottom-0 left-0 right-0` (하단 고정)
- 항목 3개 균등 분할 (`flex justify-around`)
  - `Life` → `/life`
  - `Work` → `/work`
  - `설정` → `/settings`
- 각 항목: 아이콘 + 라벨 (또는 아이콘만 — 디자인 시스템 명세 따름)
- 활성 항목 표시 — `usePathname()` 기반
- 반응형 — `md:hidden` (데스크톱 뷰포트에서 숨김)
- 각 탭 hit area 44x44 이상

### 참조 코드

sub-prd-02 §7 "워크스페이스 전환" — 사이드 네비와 동일 항목, 동일 활성 로직.

## 검증 과정

- [x] `apps/web/src/components/MobileTabBar.tsx` 파일 존재
- [x] `'use client'` 디렉티브
- [x] 3개 항목 모두 렌더 (Life/Work/설정)
- [x] `usePathname()` 기반 활성 표시
- [x] `md:hidden` 반응형 분기
- [x] FAB 와 시각적 충돌 없음 — MainDailyView 에서 FAB className 에 `!bottom-24` 적용 (탭 바 높이 56px + safe-area 상회)
- [x] `pb-[env(safe-area-inset-bottom)]` 노치 가드
- [x] `tsc --noEmit` 본 파일 관련 에러 0건

## 주의사항

1. **데스크톱 hidden** — `md:hidden` 으로 데스크톱에서는 미렌더. 데스크톱에서는 task 09 의 `SideNav` 가 대체.
2. **safe-area-inset-bottom** — 모바일 브라우저 하단 노치 고려. `pb-[env(safe-area-inset-bottom)]` 또는 디자인 토큰 적용.
3. **FAB 와의 z-index/위치 충돌** — FAB 가 탭 바 위에 보이도록 z-index 검토. 또는 FAB 의 `bottom` 값 조정.
4. **/settings 미존재** — task 09 와 동일 (Sub-03 가 신설).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §7
- `docs/base/design-system/` — 탭 바 토큰
