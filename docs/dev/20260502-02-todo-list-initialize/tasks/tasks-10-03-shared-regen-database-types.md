# TASK-10-03: shared — `database.ts` 재생성 (`make sb-gen-types`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-03
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-02 (마이그레이션 013 적용)

## 작업 목표

sub-prd-10 §1 후속 — `make sb-gen-types` 를 실행해 `packages/shared/src/database.ts` 를 재생성하고 `epic_issue.priority` 추가 / `sub_issue.priority` 제거가 type 에 반영되었는지 검증한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/shared/src/database.ts` | 자동 재생성 | epic_issue.Row/Insert/Update 에 priority 필드 추가 + sub_issue 에서 priority 필드 제거 |

### 실행 절차

1. TASK-10-02 의 mig 적용 완료 상태 확인 (`make sb-reset` 직후 권장)
2. `make sb-gen-types` 실행 → `packages/shared/src/database.ts` 자동 갱신
3. git diff 검토:
   - `epic_issue: { Row: { ..., priority: Database['public']['Enums']['priority'] }, Insert: { ..., priority?: ... }, Update: { ..., priority?: ... } }` 추가 확인
   - `sub_issue` 의 priority 필드 모두 제거 확인
4. 변경된 `database.ts` 커밋 (생성물이지만 SoT 로 commit — sub-prd-09 task 09-07 패턴 정합)

### 검증 명령

- `pnpm --filter @todo-list/shared run typecheck` — 자체 타입 정합 0 에러
- `pnpm --filter @todo-list/core run typecheck` — `mapSubIssueRow` 가 `row.priority` 참조 시 여기서 에러 발생 (예상 — TASK-10-04 에서 해결)

## 검증 과정

- [x] `make sb-gen-types` 정상 종료
- [x] `database.ts` 의 `epic_issue.Row` 에 `priority: 'high' | 'medium' | 'low'` 포함
- [x] `database.ts` 의 `sub_issue.Row` 에 priority 필드 0건
- [x] `database.ts` 의 `priority` enum 정의 보존
- [x] `pnpm --filter @todo-list/shared run typecheck` 통과
- [x] git에 갱신된 `database.ts` 커밋

## 주의사항

1. **자동 생성 SoT 보존**: `database.ts` 는 수동 편집 금지. 본 task 안에서 직접 편집 X.
2. **atomic PR 묶음**: TASK-10-02 / 10-03 / 10-04 한 PR. 본 task 단독 머지 시 후속 core typecheck 깨짐 (의도된 — 후속 task 가 수정).
3. **CI 의 sb-gen-types 부재 검증**: CI 가 자동으로 sb-gen-types 를 검증한다면 본 task 결과가 drift 0 이어야 함. 부재 시 본 task 의 git diff 0 verify 단계 생략 가능.
4. **scope = chore(shared)** 또는 `feat(db)` PR 안에 포함.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §1
- [`./tasks-10-02-db-move-priority-to-epic-issue.md`](./tasks-10-02-db-move-priority-to-epic-issue.md)
- [`./tasks-10-04-core-domain-priority-relocate.md`](./tasks-10-04-core-domain-priority-relocate.md)
- `Makefile` (`sb-gen-types` 타깃)
