# TASK-09-10: core 단위 테스트 갱신 (rename + carry-over 의미 변경)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 10
- **상태**: 대기중
- **의존성**: TASK-09-08, TASK-09-09

## 작업 목표

sub-prd-09 §2 — `packages/core` 의 단위 테스트에서 `dueDate` / `due_date` 참조를 갱신하고, carry-over RPC 의미 변경을 반영한 fixture 를 갱신한다.

## 상세 구현 내용

### 대상 파일 (예상)

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/__tests__/domain.test.ts` | 수정 | mapSubIssueRow 입출력 fixture 갱신 |
| `packages/core/src/__tests__/services/todo.test.ts` (있을 경우) | 수정 | listByDate / carry-over 케이스 갱신 |
| `packages/core/src/__tests__/hooks/*.test.ts` (해당 시) | 수정 | mock fixture rename |

> 정확한 파일은 진입 시 `grep -r "dueDate\|due_date" packages/core/src/__tests__/` 로 식별.

### 변경 패턴

#### domain.test.ts

```ts
// 변경 전
const row: Row<'sub_issue'> = { id: '...', due_date: '2026-05-06', ... };
expect(mapSubIssueRow(row).dueDate).toBe('2026-05-06');

// 변경 후
const row: Row<'sub_issue'> = { id: '...', registered_date: '2026-05-06', ... };
expect(mapSubIssueRow(row).registeredDate).toBe('2026-05-06');
```

#### carry-over 의미 변경

기존 테스트가 "due_date < target → due_date = target" 시나리오를 검증한다면, 의미는 동일 (단순 컬럼명 rename) — fixture 의 키만 갱신. 새 의미 (등록일 = 그 날짜에 등록 / 이월) 는 RPC 본문에서 보장되므로 단위 테스트 추가 X.

### 빌드 검증

- `pnpm --filter @todo-list/core test` 통과
- 신규 테스트 추가 X (sub-prd-09 §검증 §자동 — 기존 테스트 갱신 범위)

## 검증 과정

- [ ] `__tests__/` 하위 grep `dueDate` 0건 / `due_date` 0건
- [ ] `pnpm --filter @todo-list/core test` 통과
- [ ] `pnpm --filter @todo-list/core typecheck` 통과
- [ ] mock fixture 의 key 가 신 스키마 (`registered_date`) 와 일치
- [ ] 테스트 케이스 수 = 변경 전과 동일 (의미 변경 = rename, 신규 케이스 X)

## 주의사항

1. **호출 측 영향 0**: queryKey / 시그니처 불변이므로 hooks 단위 테스트는 fixture key 외 변경 0.
2. **PR 묶음**: 08 / 09 / 10 한 PR 권장 — typecheck 단계에서 끊기지 않도록.
3. **mobile core 의존**: `packages/core` 의존성 (mobile 도 사용) 영향 — mobile typecheck 도 본 task 후 통과 확인 (TASK-09-22 자동 검증으로 위임).
4. **scope = test(core)**: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §2 / §검증 기준
- [`./tasks-09-08-core-domain-mapper-rename.md`](./tasks-09-08-core-domain-mapper-rename.md)
- [`./tasks-09-09-core-service-list-by-date-filter.md`](./tasks-09-09-core-service-list-by-date-filter.md)
