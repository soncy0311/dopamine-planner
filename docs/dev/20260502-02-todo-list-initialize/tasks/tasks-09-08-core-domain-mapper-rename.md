# TASK-09-08: core 도메인 / mapper rename (`dueDate` → `registeredDate`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 08
- **상태**: 대기중
- **의존성**: TASK-09-07 (자동 생성 타입 갱신 후)

## 작업 목표

sub-prd-09 §2 의 도메인 / mapper 갱신을 수행한다. `SubIssue.dueDate` → `registeredDate`, `mapSubIssueRow` 의 row 키 참조 갱신.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/domain/todo.ts` | 수정 | `SubIssue` 인터페이스 / `mapSubIssueRow` 갱신 |

### 변경 세부

```ts
// 변경 전
export interface SubIssue {
  // ...
  dueDate: string;
}

export const mapSubIssueRow = (row: Tables<'sub_issue'>): SubIssue => ({
  // ...
  dueDate: row.due_date,
});

// 변경 후
export interface SubIssue {
  // ...
  registeredDate: string;
}

export const mapSubIssueRow = (row: Tables<'sub_issue'>): SubIssue => ({
  // ...
  registeredDate: row.registered_date,
});
```

> 의미: "그 날짜에 등록 / 이월된 sub". 마감일 의미 X (sub-prd-09 §배경 §a).

### 호출 측 영향

- `packages/core/src/services/todo.ts` (TASK-09-09 에서 처리)
- `packages/core/src/__tests__/*.ts` (TASK-09-10 에서 처리)
- `packages/ui` / `apps/web` / `apps/mobile` 의 SubIssue 소비 측: 본 task 머지 시 typecheck 실패 → TASK-09-09 ~ 21 PR 묶음으로 흡수

### 빌드 검증

- `pnpm --filter @todo-list/core typecheck` 통과 (mapper / domain 단독은 통과해야 함)

## 검증 과정

- [ ] `domain/todo.ts` 의 `SubIssue` 에 `dueDate` 0건 / `registeredDate` 1건
- [ ] `mapSubIssueRow` 가 `row.registered_date` 참조
- [ ] `pnpm --filter @todo-list/core typecheck` 통과
- [ ] grep `dueDate` 0건 (`packages/core/src/domain` 범위)

## 주의사항

1. **PR 묶음**: 본 task 단독 머지 시 services / hooks / ui / web / mobile typecheck 실패. 08 / 09 / 10 + 11 / 12 까지 한 PR 권장.
2. **camelCase ↔ snake_case 경계**: domain 은 camelCase, DB row 는 snake_case. mapper 가 단일 변환 지점. 다른 곳에서 `due_date` / `dueDate` 잔존 0건 확인.
3. **scope = refactor(core)**: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §2
- [`./tasks-09-07-core-regen-database-types.md`](./tasks-09-07-core-regen-database-types.md)
- [`./tasks-09-09-core-service-list-by-date-filter.md`](./tasks-09-09-core-service-list-by-date-filter.md)
