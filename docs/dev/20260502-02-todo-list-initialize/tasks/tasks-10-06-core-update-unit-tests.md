# TASK-10-06: core — 단위 테스트 갱신 (`cascadeToggleEpic` / `groupByEpic`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-06
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-04 (domain 타입 갱신)

## 작업 목표

sub-prd-10 §2 — domain 타입 변경에 따라 단위 테스트 mock 형을 갱신한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/__tests__/cascadeToggleEpic.test.ts` | 수정 | mock subs payload 의 `priority` 필드 제거 |
| `packages/core/src/__tests__/groupByEpic.test.ts` | 수정 | epic mock 에 `priority` 필드 추가 (필요 시) |

### 변경 세부

#### `cascadeToggleEpic.test.ts`

```ts
// 변경 전
const subs = [
  { id: 's1', epic_id: 'e1', status: 'todo', priority: 'high', ... },
  ...
];

// 변경 후 — priority 키 제거
const subs = [
  { id: 's1', epic_id: 'e1', status: 'todo', ... },
  ...
];
```

#### `groupByEpic.test.ts`

```ts
// epic mock 에 priority 추가 (Domain.EpicIssue 형 정합)
const epics = [
  { id: 'e1', title: 'A', priority: 'medium', ... },
  ...
];
```

> Domain.EpicIssue 가 priority 를 필수 필드로 가지므로 mock 누락 시 typecheck 실패. 모든 mock 갱신 필요.

### 회귀 영향

- `cascadeToggleEpic` 알고리즘 자체는 priority 미사용 — 로직 변화 0
- `groupByEpic` 출력 형은 priority 자동 포함 (mock 정합 후 자동)

## 검증 과정

- [x] `cascadeToggleEpic.test.ts` 의 mock subs 에 priority 키 0건
- [x] `groupByEpic.test.ts` 의 epic mock 에 priority 필드 존재
- [x] `pnpm --filter @todo-list/core run test` — 모든 테스트 통과
- [x] `pnpm --filter @todo-list/core run typecheck` 통과
- [x] 테스트 케이스 / assertion 변경 0 (mock 형만 변경)

## 주의사항

1. **로직 변경 X**: 본 task 는 mock 형 정합만. 알고리즘 검증 케이스 추가 / 변경 X.
2. **다른 test 파일 검증**: `__tests__/` 하위 다른 test 파일도 grep 으로 priority 참조 확인 — 누락 발생 시 동반 갱신.
3. **atomic PR 묶음**: TASK-10-02~10-06 한 PR (sub-prd-10 §주의사항 2 정합).
4. **scope = test(core)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §2
- [`./tasks-10-04-core-domain-priority-relocate.md`](./tasks-10-04-core-domain-priority-relocate.md)
- `packages/core/src/__tests__/{cascadeToggleEpic,groupByEpic}.test.ts`
