# TASK-09-09: core service `listByDate` 필터 컬럼 갱신

## 기본 정보

- **Sub-PRD**: [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md)
- **작업 번호**: 09
- **상태**: 대기중
- **의존성**: TASK-09-08

## 작업 목표

sub-prd-09 §2 — `packages/core/src/services/todo.ts` 의 `listByDate` 가 신 컬럼명을 사용하도록 갱신한다. 호출 측 (`useTodos*` hooks) 의 queryKey / 인자 시그니처는 불변.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/services/todo.ts` | 수정 | `.eq('due_date', date)` → `.eq('registered_date', date)` |

### 변경 세부

```ts
// 변경 전
const { data } = await client
  .from('sub_issue')
  .select('*')
  .eq('user_id', userId)
  .eq('due_date', date)
  .order('priority', { ascending: false });

// 변경 후
const { data } = await client
  .from('sub_issue')
  .select('*')
  .eq('user_id', userId)
  .eq('registered_date', date)
  .order('priority', { ascending: false });
```

### 호출 측 검증

- `packages/core/src/hooks/useTodos*.ts` — `useTodosByDate(date)` 시그니처 / queryKey 불변. 코드 변경 0건.
- `apps/web/src/components/MainDailyView.tsx` — `useTodosByDate` 소비 측 변경 0건.
- `apps/mobile/src/app/(main)/index.tsx` — 동일.

### 빌드 검증

- `pnpm --filter @todo-list/core typecheck` 통과
- `pnpm --filter @todo-list/core test` 통과 (TASK-09-10 갱신 후)

## 검증 과정

- [ ] `services/todo.ts` 의 `.eq('due_date', ...)` 0건
- [ ] `.eq('registered_date', ...)` 1건 (또는 동등 표현)
- [ ] `pnpm --filter @todo-list/core typecheck` 통과
- [ ] hooks / 호출 측 코드 변경 0건 (PR diff 로 확인)
- [ ] queryKey 불변 → 캐시 무효화 회귀 0

## 주의사항

1. **queryKey 동일**: `useTodosByDate` 의 인자 의미가 "그 날짜에 등록된 sub" 로 변경되지만 queryKey 자체 (`['todos', 'date', date]`) 는 동일. 캐시 invalidation 영향 0.
2. **다른 필터 잔존 검토**: `services/todo.ts` 의 다른 메서드 (e.g. `listAll`, `getById`) 가 `due_date` 참조 시 함께 갱신. grep 으로 확인.
3. **scope = refactor(core)**: PR scope.

## 관련 문서

- [`../sub-prd-09-feat-issue-flow-and-settings-revamp.md`](../sub-prd-09-feat-issue-flow-and-settings-revamp.md) §2
- [`./tasks-09-08-core-domain-mapper-rename.md`](./tasks-09-08-core-domain-mapper-rename.md)
- [`./tasks-09-10-core-update-unit-tests.md`](./tasks-09-10-core-update-unit-tests.md)
