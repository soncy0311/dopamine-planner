# TASK-07-01: `useTodos` select 보강 (`epic_issue.progress` 추가)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md)
- **작업 번호**: 01
- **상태**: 미착수
- **의존성**: 없음 (sub-prd-07 의 가장 선행 task)

## 작업 목표

`useTodos` 의 select 절에 `epic_issue.progress` 컬럼을 포함시키고, 도메인 매퍼 / `TodoEpic` 타입이 `progress: number` 를 보존하도록 정합한다. 후속 `EpicAccordionCard` 가 이 값을 그대로 소비할 수 있도록 데이터 진입점을 확정한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/hooks/useTodos.ts` | 수정 | select 절에 `epic_issue ( ..., progress )` 추가 |
| `packages/core/src/domain/mappers.ts` (또는 동등 위치) | 수정 | `mapTodo` 가 `epic.progress` 를 number 로 보존 |
| `packages/shared/src/types/*` | 검증 / 보강 | `TodoEpic` 또는 동등 타입에 `progress: number` 포함 |

### select 변경 (예시)

```ts
const SELECT = `
  id, title, status, priority, carry_over_count, ...,
  epic:epic_issue (
    id, title, color,
    progress
  ),
  category:category ( id, name, color )
`;
```

### 매퍼 정합

```ts
function mapTodo(row: Row): TodoData {
  return {
    ...,
    epic: row.epic
      ? { id: row.epic.id, title: row.epic.title, color: row.epic.color, progress: row.epic.progress }
      : null,
  };
}
```

### 타입 정합

- `packages/shared/src/types/todo.ts` (혹은 epic 타입 정의 위치) — `TodoEpic` 에 `progress: number` 추가
- 호출 측은 추가 필드를 무시할 수 있어야 한다 (additive 변경)

### 참조 코드

- sub-prd-07 §사전 조건 §1 — `epic_issue.progress` 컬럼 select 요건
- `packages/core/src/services/todos.ts` — 기존 select 절
- `supabase/migrations/004_recalc_epic_progress.sql` — `progress` 컬럼은 0~1 비율 (UI 변환은 후속 task 책임)

## 검증 과정

- [ ] `useTodos` select 가 `epic.progress` 를 포함
- [ ] `mapTodo` 결과의 `todo.epic.progress` 가 number 타입
- [ ] `TodoEpic` 또는 동등 타입에 `progress: number` 가 정의됨
- [ ] supabase select 쿼리 lint / typecheck 통과 (`pnpm --filter @todo-list/core typecheck`)
- [ ] 기존 호출 측 (e.g. `MainDailyView`) 에서 type error 발생 없음 (additive 변경)
- [ ] mapper 단위 테스트 — `epic.progress` 필드 보존 (TASK-07-07 에서 테스트 추가 가능)

## 주의사항

1. **additive 원칙 유지** — 기존 select 컬럼 / 타입 필드는 절대 삭제하지 않는다. 호출 측 회귀 회피.
2. **백분율 변환은 본 task 외부** — `progress` 는 0~1 비율 그대로 보존한다. 백분율 변환은 TASK-07-04 / 07-05 의 UI 책임.
3. **mobile 영향 분리** — `packages/core` 변경은 web/mobile 공유. mobile 측 호출 (`apps/mobile/`) 에서 type error 가 발생하지 않도록 검증한다 (mobile 의 epic 카드 정합은 후속 sub).
4. **Supabase select 키워드 충돌** — `epic` 이라는 alias 가 기존 select 와 충돌하지 않는지 확인.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md) §사전 조건
- [`./tasks-01-10-implement-use-todos.md`](./tasks-01-10-implement-use-todos.md) — `useTodos` 신설 task
- [`./tasks-01-02-implement-domain-mappers.md`](./tasks-01-02-implement-domain-mappers.md)
