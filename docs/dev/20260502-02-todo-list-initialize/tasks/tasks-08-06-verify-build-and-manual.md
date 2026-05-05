# TASK-08-06: 자동·수동 검증 (sub-prd-08 종료 게이트)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md)
- **작업 번호**: 06
- **상태**: 미착수
- **의존성**: TASK-08-01 ~ TASK-08-05 모두 완료

## 작업 목표

sub-prd-08 의 §검증 기준 §자동·수동 항목을 모두 통과시키는 종료 게이트. 코드 변경 0건. 검증 활동만 수행하며, 실패 시 해당 task 로 회귀하여 수정.

## 상세 구현 내용

### 자동 검증

| 명령 | 기대 |
|---|---|
| `make lint` | 0 error / 0 warn (web · ui · core 전부) |
| `make build` | turbo 전체 빌드 성공 |
| `make test` | 모든 단위 테스트 통과 (TASK-08-05 산출물 포함) |
| `pnpm --filter @todo-list/ui typecheck` | 0 error |
| `pnpm --filter @todo-list/web typecheck` | 0 error |

### 수동 검증 (sub-prd-08 §검증 기준 §수동)

| # | 검증 항목 | 기대 |
|---|---|---|
| 1 | 빈 워크스페이스 / 빈 일자에 EmptyState 노출 | title + description 노출, CTA 클릭 시 신규 투두 모달 진입 |
| 2 | 데이터 페칭 중 Spinner 노출 → 결과 도착 시 사라짐 | `<Spinner variant="inline" />` 가 isLoading 동안 노출, 데이터 도착 시 사라짐 |
| 3 | 투두 저장 → `toast.success` | top-right, 4초 자동 닫힘, 색 토큰 정합 (toast.md 명세) |
| 4 | 네트워크 에러 → `toast.error` | top-right, 에러 색 토큰, 닫기 버튼 동작 |
| 5 | 키보드 only 토스트 닫기 + Tab 포커스 이동 | Tab 으로 toast 닫기 버튼 포커스, Enter / Space 로 닫기. focus-visible 가시성 |
| 6 | `prefers-reduced-motion: reduce` 시 Spinner 정적 | OS 설정 토글 후 spinner 가 회전하지 않음 (정적 표시) |

### Toast 정합 검증 (변경 0건, 시각·동작 확인)

| # | 항목 | 기대 |
|---|---|---|
| 1 | 위치 | top-right (`apps/web/src/app/layout.tsx` 의 `<Toaster position="top-right" />` 정합) |
| 2 | 자동 닫힘 시간 | 4초 (sonner 기본값) |
| 3 | 동시 노출 개수 | 3개 — 4번째 호출 시 큐잉 또는 가장 오래된 것 교체 |
| 4 | 4종 색 | success / error / info / warning 각 색 토큰이 toast.md 명세와 일치 |
| 5 | 닫기 버튼 | `closeButton` 활성, hover / focus 시 가시 |

### 회귀 검증 (sub-prd-06 / 07 / 기존 기능)

| # | 검증 항목 | 기대 |
|---|---|---|
| 1 | sub-prd-06 chip 필터 | 카테고리 필터 토글 동작 유지 |
| 2 | sub-prd-06 FAB | 신규 투두 생성 모달 진입 동작 유지 |
| 3 | sub-prd-07 Epic 카드 | 아코디언 펼침 / cascade 토글 / 진행률 갱신 유지 |
| 4 | DateNavigator | 일자 이동 + 월간 모드 정상 |
| 5 | 모바일 뷰 (sub-prd-04) | 회귀 0건 (본 sub 는 web 전용) |
| 6 | 기존 toast 호출 6개 컴포넌트 | success / error 색·위치 정합 (변경 0건) |

### 실행 가이드

```sh
make doctor          # 환경 검증
make lint
make build
make test

make web-up          # web 컨테이너 기동
```

`prefers-reduced-motion` 검증:
- macOS: 시스템 설정 → 손쉬운 사용 → 디스플레이 → "동작 줄이기" ON
- Chrome DevTools: Rendering 탭 → "Emulate CSS media feature prefers-reduced-motion: reduce"

키보드 only 검증:
- 토스트 노출 후 Tab → 닫기 버튼 포커스 → Enter / Space 로 닫기
- focus-visible 가시 (outline / ring)

### 산출물 / 마킹

- 본 task 종료 시 `sub-prd-08-feat-auth-and-empty-state.md` §작업 + §검증 기준 모두 체크 마킹
- `main-prd-todo-list-initialize.md` 의 sub-prd-08 진행 상태 업데이트 (Done)

## 검증 과정

- [ ] `make lint` 통과
- [ ] `make build` 통과
- [ ] `make test` 통과
- [ ] `pnpm --filter @todo-list/{ui,web} typecheck` 통과
- [ ] 수동 검증 6 항목 모두 통과
- [ ] Toast 정합 검증 5 항목 모두 통과
- [ ] 회귀 검증 6 항목 모두 통과
- [ ] `prefers-reduced-motion` 시 spinner 정적
- [ ] 키보드 only 시나리오 통과 (focus-visible 가시)
- [ ] sub-prd-08 §작업 / §검증 기준 마킹 완료
- [ ] main-prd 진행 상태 마킹 완료

## 주의사항

1. **코드 변경 0건 원칙**: 본 task 는 검증 게이트. 실패 발견 시 해당 TASK-08-01 ~ 05 로 회귀하여 수정 후 다시 게이트 통과.
2. **Toast 색·위치 mismatch 발견 시**: TASK-08-01 (toast.md 명세) 또는 layout.tsx 의 `<Toaster>` props 회귀 — 본 task 외부에서 수정.
3. **`prefers-reduced-motion` 검증 환경**: OS 설정 + DevTools 양쪽 검증 권장. 환경 차이로 결과 달라질 수 있음.
4. **mobile 회귀**: 본 sub 는 web 전용이지만 `packages/ui` 변경이 mobile 빌드에도 영향. mobile typecheck 함께 확인.
5. **PR 분리 정책**: sub-prd-08 단일 PR 또는 docs(TASK-08-01) 우선 머지 후 코드 묶음 PR 의 2단계로 분리. `/create-pr` 스킬로 base `dev` PR 생성. PR 본문에 §검증 기준 체크리스트 포함.
6. **Kakao OAuth 미포함 명시**: PR 본문에 "Kakao OAuth 는 본 sub 에서 분리되어 후속 sub 로 진행 (main-prd §향후 개선 P3)" 한 줄 명시.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-08-feat-auth-and-empty-state.md`](../sub-prd-08-feat-auth-and-empty-state.md) §검증 기준
- [`./tasks-08-01-design-system-docs.md`](./tasks-08-01-design-system-docs.md)
- [`./tasks-08-02-create-empty-state.md`](./tasks-08-02-create-empty-state.md)
- [`./tasks-08-03-create-spinner.md`](./tasks-08-03-create-spinner.md)
- [`./tasks-08-04-refactor-callsites.md`](./tasks-08-04-refactor-callsites.md)
- [`./tasks-08-05-add-unit-tests.md`](./tasks-08-05-add-unit-tests.md)
