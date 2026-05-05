# TASK-01-01: queryKeys 단일화 + invalidateByTable

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 01
- **상태**: 완료
- **의존성**: (없음 — 가장 먼저 진입)

## 작업 목표

`packages/core/src/queryKeys.ts` 를 신설하여 모든 훅·realtime 헬퍼·invalidate 가 단일 헬퍼만 통과하도록 만든다. Realtime payload 의 테이블명을 입력으로 받아 해당 queryKey prefix 를 invalidate 하는 `invalidateByTable(qc, table)` 헬퍼도 함께 제공한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/queryKeys.ts` | 신설 | queryKeys 객체 + invalidateByTable 헬퍼 |

### 구현 세부사항

- `queryKeys.todos(workspace, date)` → `['todos', { workspace, date }] as const`
- `queryKeys.epics(workspace)` → `['epics', { workspace }] as const`
- `queryKeys.epicsByCategory(categoryId)` → `['epics', { categoryId }] as const`
- `queryKeys.categories(workspace)` → `['categories', { workspace }] as const`
- `queryKeys.profile()` → `['profile'] as const`
- `invalidateByTable(qc: QueryClient, table: 'profile' | 'category' | 'epic_issue' | 'sub_issue')`:
  - `sub_issue` → `qc.invalidateQueries({ queryKey: ['todos'] })`
  - `epic_issue` → `qc.invalidateQueries({ queryKey: ['epics'] })`
  - `category` → `qc.invalidateQueries({ queryKey: ['categories'] })`
  - `profile` → `qc.invalidateQueries({ queryKey: ['profile'] })`

### 참조 코드

sub-prd-01 §1 queryKeys 단일화 정의 그대로.

## 검증 과정

- [x] `packages/core/src/queryKeys.ts` 파일 존재
- [x] queryKeys 5개 헬퍼(`todos / epics / epicsByCategory / categories / profile`) export
- [x] `invalidateByTable` 헬퍼 export — 4 테이블 매핑 분기 포함
- [x] `pnpm --filter @todo-list/core typecheck` 통과 (task 02 까지 진행 후 일괄 검증)

## 주의사항

1. **queryKeys 헬퍼 통과 의무** — 본 task 산출물이 후속 모든 hook task 의 의존이다. 문자열 리터럴 (`['todos', ...]`) 직접 작성 금지.
2. **react-query peerDependency** — `@tanstack/react-query` 는 import 만 하고 `dependencies` 추가 금지 (sub-prd §주의사항 7).
3. 헬퍼 반환값에 `as const` 적용해 튜플 타입 추론을 보장한다.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md)
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §1
