# TASK-09-22: 자동 검증 — lint / typecheck / test / build / db diff

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 22
- **상태**: 대기중
- **의존성**: 모든 코드 task (04~21)

## 작업 목표

sub-prd-09 §검증 기준 §자동 — 전 패키지 자동 검증을 일괄 실행하고 결과를 기록한다. 본 task 는 코드 변경 0건 (검증 + 보고).

## 상세 구현 내용

### 실행 항목

| 명령 | 통과 기준 |
|---|---|
| `pnpm --filter @todo-list/core run lint` | 경고 0건 |
| `pnpm --filter @todo-list/core run test` | 모든 테스트 통과 |
| `pnpm --filter @todo-list/core run typecheck` | 에러 0건 |
| `pnpm --filter @todo-list/ui run lint` | 경고 0건 |
| `pnpm --filter @todo-list/ui run test` | 모든 테스트 통과 |
| `pnpm --filter @todo-list/ui run typecheck` | 에러 0건 |
| `pnpm --filter @todo-list/web run lint` | 경고 0건 |
| `pnpm --filter @todo-list/web run typecheck` | 에러 0건 |
| `pnpm --filter @todo-list/web run build` | 빌드 성공 |
| `pnpm --filter @todo-list/mobile run typecheck` | 에러 0건 |
| `make sb-reset` | 마이그레이션 004/005/006 정합 |
| `supabase db diff` | drift 0 |
| `make sb-gen-types` | `database.ts` 갱신 후 git diff 0 (이미 07 에서 커밋됨) |

> Makefile 단일 진입점 활용 가능 — `make lint` / `make build` / `make test` 로 turbo 전체 실행.

### 보고 형식

- 각 명령의 통과 / 실패 + 실패 시 로그 발췌 (sub-prd-09 §검증 §자동 체크박스 6 항목 모두)
- 실패 항목 발견 시 즉시 차단 + 책임 task 식별 (예: web typecheck 실패 → TASK-09-13~17 회귀 검토)

### 회귀 검증 항목 (sub-prd-09 §회귀 0건)

- sub-prd-06 chip / DateNavigator
- sub-prd-07 Epic 카드 expand / cascade toggle
- sub-prd-08 EmptyState / Spinner / Toast

→ 자동 테스트로 커버되는 부분만 본 task 에서 검증. 시각 / UX 회귀는 TASK-09-23 의 수동 검증.

## 검증 과정

- [ ] lint (core / ui / web) 경고 0건
- [ ] test (core / ui) 모두 통과
- [ ] typecheck (core / ui / web / mobile) 에러 0건
- [ ] web build 성공
- [ ] mobile typecheck 통과
- [ ] `supabase db diff` drift 0
- [ ] `make sb-gen-types` 결과 git clean (07 에서 이미 커밋됨)
- [ ] 보고 문서 생성 (또는 PR 본문에 결과 첨부)

## 주의사항

1. **선행 task 미머지 시 차단**: 04~21 중 미머지 task 존재 시 본 task 는 일찍 진행해도 의미 없음. 모든 코드 task 머지 후 실행.
2. **scope = chore(verify)**: 본 task 는 코드 변경 0. 보고만.
3. **실패 시 책임 task 회귀**: 발견된 실패는 책임 task 의 PR 로 환원 (본 task 안에서 코드 수정 X).
4. **mobile build 미포함**: sub-prd-09 §검증 §자동 — mobile 은 typecheck 만 (네이티브 빌드 별도).

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §검증 기준 §자동 / §회귀 0건
- [`./tasks-09-23-verify-manual.md`](./tasks-09-23-verify-manual.md)
- `Makefile` (`lint` / `test` / `build` / `sb-*` 타깃)
