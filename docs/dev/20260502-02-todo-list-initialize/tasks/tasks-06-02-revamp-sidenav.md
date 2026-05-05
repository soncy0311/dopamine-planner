# TASK-06-02: `apps/web/src/components/SideNav.tsx` 시각·정보구조 정합

## 기본 정보

- **Sub-PRD**: [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md)
- **작업 번호**: 02
- **상태**: 완료
- **의존성**: TASK-06-01 (Pretendard 폰트 적용된 텍스트로 시각 검증)

## 작업 목표

prototype `page-prototypes-desktop.html:29-53` 정합 — 로고 아이콘 + "워크스페이스" 그룹 헤더 + 메뉴별 lucide 아이콘 + 그룹 분리선 (`border-t`) 구조로 SideNav 를 재구성한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/SideNav.tsx` | 수정 | 재구성된 SideNav 컴포넌트 |

### 구조 (위→아래)

1. 로고 영역: `<CircleCheck />` + "Dopamine Planner" 텍스트
2. 워크스페이스 그룹: 그룹 헤더 ("워크스페이스") + Life (`Home`) / Work (`Briefcase`)
3. spacer (`flex-1`)
4. 분리선 (`border-t border-{token}`)
5. 설정 그룹: `<Settings />` + "설정"

### 핵심 코드

```tsx
import { Home, Briefcase, Settings, CircleCheck } from 'lucide-react';

const WORKSPACE_ITEMS = [
  { label: 'Life', href: '/life', icon: Home, match: (p: string) => p.startsWith('/life') },
  { label: 'Work', href: '/work', icon: Briefcase, match: (p: string) => p.startsWith('/work') },
];
const SETTINGS_ITEMS = [
  { label: '설정', href: '/settings', icon: Settings, match: (p: string) => p.startsWith('/settings') },
];
```

active 상태: `aria-current="page"` + 활성 토큰 (`bg-*` / `text-*`).

### 참조 코드

- sub-prd-06 §1 "사이드바 정합"
- prototype `docs/base/prototype/pages/page-prototypes-desktop.html:29-53`

## 검증 과정

- [x] 로고 아이콘 + 텍스트 노출
- [x] 그룹 헤더 "워크스페이스" 노출
- [x] Life / Work 메뉴에 각각 `Home` / `Briefcase` 아이콘 노출
- [x] spacer 로 인해 설정 그룹이 사이드바 하단에 fix
- [x] 그룹 사이에 `border-t` 분리선 노출
- [x] 활성 메뉴에 `aria-current="page"` 부여
- [x] 키보드 Tab 으로 모든 링크 탐색 가능
- [x] `make lint` 통과

## 주의사항

1. **lucide-react 의존성 확인** — 이미 설치되어 있다면 추가 설치 불필요. 미설치 시 `pnpm --filter @todo-list/web add lucide-react`.
2. **모바일 영향 0** — SideNav 는 데스크탑 전용 (`md:` 이상). 모바일은 `MobileTabBar` 사용 — 본 task 변경이 모바일 레이아웃에 영향 주지 않는지 확인.
3. **active 매칭 함수** — `pathname.startsWith(...)` 으로 sub-route 도 활성 처리 (예: `/life/categories` 도 Life 활성).
4. **TASK-03-12 와의 병행 충돌** — sub-prd-03 의 task-03-12 가 SideNav 에 설정 메뉴를 추가했다면 그 변경 위에 시각 정합. git blame 으로 최신 상태 확인 후 진입.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md) §1
- `docs/base/prototype/pages/page-prototypes-desktop.html`
- [`./tasks-06-01-setup-design-tokens-and-pretendard.md`](./tasks-06-01-setup-design-tokens-and-pretendard.md)
