# TASK-10-04: core — domain mapper / 타입 이전 (`SubIssue.priority` 제거 + `EpicIssue.priority` 추가)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-04
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-03 (database.ts 재생성)

## 작업 목표

sub-prd-10 §2 — `packages/core` 의 도메인 타입과 mapper 를 갱신해 priority 이전을 반영한다. `SubIssue` 에서 priority 제거, `EpicIssue` 에 priority 추가, `Priority` 타입 export.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/domain/todo.ts` | 수정 | `SubIssue.priority` 제거 + `mapSubIssueRow` 갱신 |
| `packages/core/src/domain/epic.ts` | 수정 | `EpicIssue.priority: Priority` 추가 + `mapEpicRow` priority 매핑 + `Priority` 타입 export |

### 변경 세부

#### `domain/todo.ts`

```ts
// 변경 전
export type SubIssue = {
  id: string;
  ...
  priority: 'high' | 'medium' | 'low';
  ...
};

export function mapSubIssueRow(row: SubIssueRow): SubIssue {
  return {
    ...
    priority: row.priority,
    ...
  };
}

// 변경 후 — priority 필드 / 매핑 양쪽 제거
export type SubIssue = { id: string; ... };
export function mapSubIssueRow(row: SubIssueRow): SubIssue {
  return { ... };
}
```

#### `domain/epic.ts`

```ts
import type { Database } from '@todo-list/shared/database';
export type Priority = Database['public']['Enums']['priority'];

export type EpicIssue = {
  id: string;
  ...
  priority: Priority;   // 추가
};

export function mapEpicRow(row: EpicIssueRow): EpicIssue {
  return {
    ...
    priority: row.priority,   // 추가
  };
}
```

> `Priority` 타입 export — `packages/ui/EpicAccordionCard` / `apps/{web,mobile}` 폼 schemas 에서 재사용.

### 회귀 영향

- `services/todo.ts` 의 `TodoInsert/Update` 가 자동으로 priority 미포함 (TASK-10-05 검증)
- `services/epic.ts` 의 `EpicInsert/Update` 가 자동으로 priority 수용 (TASK-10-05 검증)
- 단위 테스트 mock 형 변경 (TASK-10-06 에서 처리)

## 검증 과정

- [x] `domain/todo.ts` 에서 `priority` 키워드 0건
- [x] `domain/epic.ts` 의 `EpicIssue` 에 `priority: Priority` 필드 존재
- [x] `domain/epic.ts` 가 `Priority` 타입 export
- [x] `mapEpicRow` 가 `row.priority` 매핑
- [x] `pnpm --filter @todo-list/core run typecheck` 통과
- [x] 후속 task (10-05 ~ 10-08) 가 `Priority` 타입을 import 가능

## 주의사항

1. **atomic 묶음 내 위치**: TASK-10-02 / 10-03 / 10-04 / 10-05 / 10-06 한 PR — sub-prd-10 §주의사항 2 정합. 본 task 단독 머지 시 ui / web / mobile typecheck 광범위 깨짐.
2. **`Priority` 타입 SoT**: `domain/epic.ts` 가 SoT. `packages/ui` / web / mobile schemas 는 본 export 를 import 해 zod enum 정합.
3. **Sub 단위 priority 가 다시 필요해질 경우**: 현재 부재 (sub-prd-10 §주의사항 8 — 후속 결정).
4. **scope = refactor(core)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §2
- [`./tasks-10-03-shared-regen-database-types.md`](./tasks-10-03-shared-regen-database-types.md)
- [`./tasks-10-05-core-service-payload-verify.md`](./tasks-10-05-core-service-payload-verify.md)
- `packages/core/src/domain/{todo,epic}.ts`
