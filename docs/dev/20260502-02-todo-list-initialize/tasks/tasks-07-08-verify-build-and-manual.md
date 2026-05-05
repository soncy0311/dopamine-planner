# TASK-07-08: 빌드·린트·수동 시각 검증 (sub-prd-07 종료 게이트)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md)
- **작업 번호**: 08
- **상태**: 미착수
- **의존성**: TASK-07-01 ~ TASK-07-07 모두 완료

## 작업 목표

sub-prd-07 의 §검증 기준 §자동·수동 항목을 모두 통과시키는 종료 게이트. 코드 변경 0건. 검증 활동만 수행하며, 실패 시 해당 task 로 회귀하여 수정.

## 상세 구현 내용

### 자동 검증

| 명령 | 기대 |
|---|---|
| `make lint` | 0 error / 0 warn (web · ui · core 전부) |
| `make build` | turbo 전체 빌드 성공 |
| `make test` | 모든 단위 테스트 통과 (TASK-07-07 산출물 포함) |
| `pnpm --filter @todo-list/core typecheck` | 0 error |
| `pnpm --filter @todo-list/ui typecheck` | 0 error |
| `pnpm --filter @todo-list/web typecheck` | 0 error |

### 수동 검증 (sub-prd-07 §검증 기준 §수동)

| # | 검증 항목 | 기대 |
|---|---|---|
| 1 | 메인 일자 뷰에서 epic 카드 + 일반 카드 혼재 노출 | epic 카드는 헤더 + segmented bar + chevron 형태. 일반 카드는 기존 TodoItem 형태 |
| 2 | chevron 클릭 → sub-issue 목록 펼침 | body 가 펼쳐지고 chevron 이 90도 회전 (`rotate-90 transition`) |
| 3 | 메인 체크 토글 → 모든 sub 일괄 체크/해제 + 진행률 텍스트 갱신 | 토글 후 200ms 디바운스 후 `recalc_epic_progress` 1회 호출되어 진행률 텍스트 갱신 |
| 4 | 다른 디바이스 동일 워크스페이스 → Realtime 으로 epic 진행률 반영 | 두 탭 / 두 디바이스 시나리오에서 진행률 200ms 이내 갱신 (TASK-07-06 시나리오 A/B 정합) |
| 5 | 키보드 only 로 chevron 토글 + sub-issue 토글 가능 | Tab 으로 포커스 이동, Enter / Space 로 토글. focus-visible 가시성 확인 |

### 회귀 검증 (sub-prd-06 / 기존 기능)

| # | 검증 항목 | 기대 |
|---|---|---|
| 1 | sub-prd-06 의 chip 필터 | 카테고리 필터 토글 동작 유지 |
| 2 | FAB | 신규 todo 생성 모달 진입 동작 유지 |
| 3 | Pretendard 폰트 | 모든 화면에 적용 |
| 4 | DateNavigator (월간 모드) | 일자 이동 동작 유지 + 일자 이동 시 expand state reset |
| 5 | 모바일 뷰 (sub-prd-04) | 회귀 0건 (epic 카드는 web 한정) |

### 진행률 / segmented bar 시각 정합

- 진행률 텍스트: `0%` ~ `100%` 정수. 백분율 변환 누락 시 `1%` 등 비정상 값 노출 — 발견 시 TASK-07-05 로 회귀.
- segmented bar: sub-issue 수만큼 segment 노출. 완료 segment 가 색칠. 0개일 때 빈 막대 또는 미노출 (prototype 정합 확인).

### 실행 가이드

```sh
make doctor          # 환경 검증
make lint
make build
make test

make web-up          # web 컨테이너 기동
make sb-reset        # supabase 초기화 (필요 시)
```

브라우저 두 탭 동시 열기 → Realtime 시나리오 A/B 검증 (TASK-07-06 정합).

### 산출물 / 마킹

- 본 task 종료 시 `sub-prd-07-feat-epic-accordion-card.md` §작업 7건 + §검증 기준 모두 체크 마킹
- `main-prd-todo-list-initialize.md` 의 sub-prd-07 진행 상태 업데이트 (Done)

## 검증 과정

- [ ] `make lint` 통과
- [ ] `make build` 통과
- [ ] `make test` 통과
- [ ] `pnpm --filter @todo-list/{core,ui,web} typecheck` 모두 통과
- [ ] 수동 검증 5 항목 모두 통과
- [ ] 회귀 검증 5 항목 모두 통과
- [ ] 진행률 백분율 변환 누락 없음 (`1%` 같은 비정상 값 0건)
- [ ] 키보드 only 시나리오 통과 (focus-visible 가시)
- [ ] sub-prd-07 §작업 / §검증 기준 마킹 완료
- [ ] main-prd 진행 상태 마킹 완료

## 주의사항

1. **코드 변경 0건 원칙** — 본 task 는 검증 게이트. 실패 발견 시 해당 TASK-07-01 ~ 07 로 회귀하여 수정 후 다시 게이트 통과.
2. **수동 검증의 재현성** — 두 탭 / 두 디바이스 시나리오는 동일 워크스페이스 + 동일 일자에서 검증. 워크스페이스 / 일자 mismatch 시 Realtime 미반영은 정상.
3. **백분율 변환 버그** — UI 에 `1%` 같은 값 노출 시 즉시 TASK-07-05 회귀 (`Math.round(epic.progress * 100)` 누락).
4. **Realtime 노이즈** — cascade 일괄 토글 시 Realtime 이벤트가 sub 수만큼 도착할 수 있음. 디바운스로 invalidate 1회 합쳐지는지 확인 (TASK-07-06 시나리오 B).
5. **mobile 회귀** — 본 sub 는 web 전용이지만 `packages/core` 변경이 mobile 에도 영향. mobile 빌드 / typecheck 이 깨지지 않는지 함께 확인.
6. **PR 분리 정책** — sub-prd-07 단일 PR 로 묶음. `/create-pr` 스킬로 base `dev` PR 생성. PR 본문에 §검증 기준 체크리스트 포함.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md) §검증 기준
- [`./tasks-07-01-extend-use-todos-select.md`](./tasks-07-01-extend-use-todos-select.md)
- [`./tasks-07-02-create-cascade-toggle-epic-service.md`](./tasks-07-02-create-cascade-toggle-epic-service.md)
- [`./tasks-07-03-create-group-by-epic-util.md`](./tasks-07-03-create-group-by-epic-util.md)
- [`./tasks-07-04-create-epic-accordion-card.md`](./tasks-07-04-create-epic-accordion-card.md)
- [`./tasks-07-05-integrate-main-daily-view.md`](./tasks-07-05-integrate-main-daily-view.md)
- [`./tasks-07-06-verify-realtime-invalidation.md`](./tasks-07-06-verify-realtime-invalidation.md)
- [`./tasks-07-07-add-unit-tests.md`](./tasks-07-07-add-unit-tests.md)
- [`./tasks-06-09-verify-build-and-manual.md`](./tasks-06-09-verify-build-and-manual.md)
