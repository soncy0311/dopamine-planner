# TASK-09-16: web — 분류 / Epic 관리 페이지 삭제

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 16
- **상태**: 대기중
- **의존성**: TASK-09-15

## 작업 목표

sub-prd-09 §6 — 분류 / Epic 관리 페이지 4개 + 관련 view 컴포넌트 + SideNav / MainLayout 의 관리 페이지 링크를 삭제한다. 분류 직접 관리 UI 부재 정책 정합.

## 상세 구현 내용

### 대상 파일 (삭제)

| 파일 / 디렉토리 | 작업 |
|---|---|
| `apps/web/src/app/(main)/life/categories/page.tsx` | 삭제 |
| `apps/web/src/app/(main)/life/epics/page.tsx` | 삭제 |
| `apps/web/src/app/(main)/work/categories/page.tsx` | 삭제 |
| `apps/web/src/app/(main)/work/epics/page.tsx` | 삭제 |
| `apps/web/src/components/CategoriesView.tsx` | 삭제 (관리 전용일 경우) |
| `apps/web/src/components/EpicsView.tsx` | 삭제 (관리 전용일 경우) |
| `apps/web/src/components/SideNav.tsx` | 수정 — 관리 링크 4개 제거 |
| `apps/web/src/components/MainLayout.tsx` | 수정 — 관리 링크 잔존 시 제거 |

### 파일 삭제 시 점검 (host 영향)

1. `CategoriesView` / `EpicsView` 가 다른 곳에서 import 되는지 grep
2. 관리 전용 hooks (예: `useDeleteCategory`, `useUpdateCategory`) 가 다른 곳에서 사용되는지 — 사용처 0이면 함께 제거. 사용처 존재 시 본 task 내 제거 보류 (후속 정리)
3. SideNav 의 메뉴 구조 정합 — 빈 슬롯 / 헤딩 잔존 0
4. 라우트 직접 진입 시 Next.js 기본 404 노출 (별도 redirect 설정 X)

### 정책 검증 (sub-prd-09 §6)

- 분류 직접 생성 / 수정 / 삭제 UI 부재
- 분류 생성 = `CategoryComboboxCreate` 만
- 분류 삭제 = DB trigger (마이그레이션 006)

## 검증 과정

- [ ] 4개 page.tsx 파일 삭제
- [ ] 관련 view 컴포넌트 삭제 (관리 전용일 경우)
- [ ] SideNav / MainLayout 에서 관리 페이지 링크 잔존 0
- [ ] `pnpm --filter @todo-list/web typecheck` / `build` 통과
- [ ] 수동: `/life/categories` / `/life/epics` / `/work/categories` / `/work/epics` 직접 진입 → 404
- [ ] 수동: SideNav 가 매끄럽게 렌더 (빈 슬롯 / 헤딩 0)
- [ ] 회귀 0건 — sub-prd-06/07/08 동작 정상

## 주의사항

1. **분류 / Epic hooks 의 다른 사용처**: 관리 전용 hooks 가 다른 페이지에서도 사용 중일 수 있음 — grep 확인 필수. 잘못 삭제 시 빌드 실패.
2. **머지 순서**: 15 머지 후 — 사용자 진입 흐름이 새 모달 (EpicFormModal) 로 전환되어야 관리 페이지 부재 시에도 동작.
3. **404 정책**: redirect 별도 설정 X (sub-prd-09 §검증 §수동 — "404 또는 redirect"). 직접 URL 진입자는 사용자 결정 필요 시점에 재논의.
4. **scope = refactor(web)** 또는 `chore(web)`: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §6
- [`./tasks-09-15-web-deprecate-create-todo-modal.md`](./tasks-09-15-web-deprecate-create-todo-modal.md)
- [`./tasks-09-17-web-settings-page-revamp.md`](./tasks-09-17-web-settings-page-revamp.md)
