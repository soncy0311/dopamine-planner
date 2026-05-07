# TASK-09-07: `make sb-gen-types` — `database.ts` 재생성

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 07
- **상태**: 대기중
- **의존성**: TASK-09-04, TASK-09-05, TASK-09-06 (DB 마이그레이션 3건 모두 머지 후)

## 작업 목표

DB 마이그레이션 004/005/006 머지 후 `make sb-gen-types` 를 실행하여 `packages/shared/src/database.ts` 자동 생성 타입을 갱신·커밋한다. core / ui / web / mobile 의 typecheck 가 신 컬럼명·RPC 시그니처를 인식하도록.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/shared/src/database.ts` | 자동 생성 (수동 편집 금지) | sub_issue.registered_date 반영 + carry_over_todos / category_create 시그니처 |

### 실행 절차

1. `make sb-reset` — 로컬 DB 에 마이그레이션 004/005/006 적용 정합 확인
2. `make sb-gen-types` — Supabase CLI 가 `packages/shared/src/database.ts` 재생성
3. diff 확인:
   - `sub_issue.due_date` 흔적 0건 → `registered_date` 로 대체
   - `idx_sub_issue_user_due_status` → `idx_sub_issue_user_registered_status`
   - `Functions['carry_over_todos']` 시그니처 동일 (의미만 변경 — 타입 변화 없음)
   - `purge_orphan_categories` function 추가 반영 (trigger function 이지만 자동 생성 결과 포함 여부 확인)
4. `pnpm --filter @todo-list/shared typecheck` 통과 확인
5. 본 파일은 자동 생성 결과 — 수동 편집 0건. PR 본문에 "자동 생성, sb-gen-types 결과" 명시

## 검증 과정

- [ ] `packages/shared/src/database.ts` grep `due_date` 0건
- [ ] `registered_date` 키 존재
- [ ] `pnpm --filter @todo-list/shared typecheck` 통과
- [ ] git diff 가 sb-gen-types 결과와 1:1 일치 (수동 편집 0)
- [ ] PR 본문에 자동 생성 사실 명시

## 주의사항

1. **수동 편집 금지**: `database.ts` 는 자동 생성 산출물. 수동 편집 시 다음 sb-gen-types 에서 덮어써짐.
2. **머지 순서**: 04/05/06 머지 후 본 task. 마이그레이션 미적용 상태에서 sb-gen-types 시 옛 스키마가 반영됨.
3. **scope = chore**: PR scope 는 `chore` 또는 `chore(shared)`.
4. **호출 측 typecheck 영향**: 본 task 머지 시 `core/services/todo.ts` 의 `due_date` 참조가 컴파일 에러 → TASK-09-08 / 09 가 즉시 따라붙어야 함. PR 묶음 권장.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §1 §머지 후속 작업
- `Makefile` (`sb-gen-types` 타깃)
- [`./tasks-09-04-db-rename-due-to-registered.md`](./tasks-09-04-db-rename-due-to-registered.md)
- [`./tasks-09-05-db-carry-over-semantic-change.md`](./tasks-09-05-db-carry-over-semantic-change.md)
- [`./tasks-09-06-db-purge-orphan-categories-trigger.md`](./tasks-09-06-db-purge-orphan-categories-trigger.md)
