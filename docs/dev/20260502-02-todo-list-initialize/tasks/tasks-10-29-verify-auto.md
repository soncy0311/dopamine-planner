# TASK-10-29: 자동 검증 — typecheck / unit test / build / db diff

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-29
- **상태**: 완료 (2026-05-07)
- **의존성**: 모든 코드 task (10-01 ~ 10-28)

## 작업 목표

sub-prd-10 §검증 기준 §자동 — 전 패키지 자동 검증 일괄 실행 + 결과 보고. 본 task 는 코드 변경 0건 (검증 + 보고).

## 상세 구현 내용

### 실행 항목

| 명령 | 통과 기준 |
|---|---|
| `make typecheck` (또는 `pnpm --filter @todo-list/{shared,core,ui,web,mobile} run typecheck`) | 모든 패키지 에러 0건 |
| `pnpm --filter @todo-list/core run test` | `cascadeToggleEpic` / `groupByEpic` 모두 통과 |
| `pnpm --filter @todo-list/ui run test` | (있을 경우) 통과 |
| `pnpm --filter @todo-list/web run lint` | 경고 0건 |
| `pnpm --filter @todo-list/web run build` | web 정적 export 빌드 성공 |
| `pnpm --filter @todo-list/mobile run typecheck` | 에러 0건 |
| `make sb-reset` | 마이그레이션 013 까지 적용 정상 |
| `supabase db diff` | drift 0 |
| `make sb-gen-types` | `database.ts` 갱신 후 git diff 0 (이미 10-03 에서 커밋됨) |
| `make build` | turbo 전체 빌드 성공 (web + 패키지) |

> Makefile 단일 진입점 활용 가능 — `make typecheck` / `make lint` / `make build` / `make test`.

### 회귀 검증 항목 (자동 커버 범위)

- sub-prd-09 산출물 회귀 0 (모달 분리 / Combobox / Settings 프로필)
- sub-prd-08 산출물 회귀 0 (EmptyState / Spinner / Toast)
- sub-prd-07 산출물 회귀 0 (Epic 카드 expand / cascade toggle)
- sub-prd-06 chip / DateNavigator (자동 테스트로 가능한 범위)

### 보고 형식

- 각 명령의 통과 / 실패 + 실패 시 로그 발췌
- 실패 항목 발견 시 즉시 차단 + 책임 task 식별 (예: web typecheck 실패 → TASK-10-09~15 회귀 검토)

## 검증 과정

- [x] typecheck (shared / core / ui / web / mobile) 에러 0건
- [x] core test (cascadeToggleEpic / groupByEpic) 통과
- [x] web build 성공 (정적 export)
- [x] mobile typecheck 통과
- [x] `supabase db diff` drift 0
- [x] `make sb-gen-types` 결과 git clean
- [x] 보고 문서 생성 (또는 PR 본문에 결과 첨부)

## 주의사항

1. **선행 task 미머지 시 차단**: 10-01 ~ 10-28 중 미머지 task 존재 시 본 task 진행해도 의미 없음.
2. **scope = chore(verify)**: 본 task 는 코드 변경 0. 보고만.
3. **실패 시 책임 task 회귀**: 발견된 실패는 책임 task 의 PR 로 환원 (본 task 안에서 코드 수정 X).
4. **mobile build 미포함**: sub-prd-10 §검증 §자동 — mobile 은 typecheck 만. metro 번들은 본 task 범위 안에서 시도하되 실패해도 차단 X (수동 시각 검증 의존).

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §검증 기준 §자동 / §회귀
- [`./tasks-10-30-verify-manual.md`](./tasks-10-30-verify-manual.md)
- `Makefile`
