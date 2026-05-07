# TASK-09-20: mobile — 분류 / Epic 관리 라우트 삭제

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 20
- **상태**: 대기중
- **의존성**: TASK-09-19

## 작업 목표

sub-prd-09 §7 — mobile 의 분류 / Epic 관리 라우트 (존재 시) 와 메뉴 / 탭 진입점을 삭제한다. web 의 §6 정책 (직접 관리 UI 부재) 정합.

## 상세 구현 내용

### 대상 (존재 시 삭제)

| 영역 | 작업 |
|---|---|
| `apps/mobile/src/app/(main)/{life,work}/categories.tsx` (또는 동등) | 삭제 |
| `apps/mobile/src/app/(main)/{life,work}/epics.tsx` (또는 동등) | 삭제 |
| 관련 RN view 컴포넌트 | 삭제 (관리 전용일 경우) |
| 메뉴 / 탭 진입점 (Drawer / TabBar 등) | 수정 — 관리 진입 링크 제거 |

> 진입 시 `apps/mobile/src/app` 디렉토리 구조 grep 으로 실제 경로 식별. 부재 시 본 task 는 메뉴 / 탭 정리만.

### 정책 정합 (sub-prd-09 §6)

- 분류 직접 생성 / 수정 / 삭제 UI 부재
- 분류 생성 = `epic-form` 의 자유 입력 Combobox (TASK-09-19) 만
- 분류 삭제 = DB trigger (마이그레이션 006)

### 빌드 검증

- `pnpm --filter @todo-list/mobile typecheck` 통과
- Expo dev — 메뉴 / 탭에서 관리 진입 부재 + 직접 라우트 진입 시 404 (Expo Router 기본)

## 검증 과정

- [ ] 관리 라우트 파일 삭제 (또는 부재 확인)
- [ ] 메뉴 / 탭 / Drawer 의 관리 진입점 0
- [ ] `pnpm --filter @todo-list/mobile typecheck` 통과
- [ ] 수동: 시뮬레이터 — 메뉴에서 관리 진입 부재 확인
- [ ] 회귀 0건 — 홈 / 메인 탭 정상

## 주의사항

1. **mobile 측 관리 라우트 부재 가능성**: web 과 달리 mobile 은 본래 관리 UI 가 없을 수 있음. 진입 시 grep 으로 확인 후 작업 범위 결정.
2. **머지 순서**: 19 머지 후 — 사용자 진입 흐름이 `epic-form` 으로 전환되어야 함.
3. **scope = refactor(mobile)** 또는 `chore(mobile)`: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §6 / §7
- [`./tasks-09-16-web-delete-management-pages.md`](./tasks-09-16-web-delete-management-pages.md) (web 동등)
- [`./tasks-09-19-mobile-epic-and-sub-form-routes.md`](./tasks-09-19-mobile-epic-and-sub-form-routes.md)
