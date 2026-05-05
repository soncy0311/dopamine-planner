# TASK-07-03: `groupByEpic` 유틸 신설 + 단위 테스트

## 기본 정보

- **Sub-PRD**: [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md)
- **작업 번호**: 03
- **상태**: 완료 (2026-05-06)
- **의존성**: TASK-07-01 (Todo / Epic 도메인 타입 확정 후)

## 작업 목표

todos / epics 결과를 epic 그룹과 standalone 그룹으로 분리하는 순수 함수 `groupByEpic` 을 신설한다. 후속 `MainDailyView` 통합에서 epic 카드 + 일반 카드 혼재 렌더의 진입점이 된다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/utils/groupByEpic.ts` | 신설 | `groupByEpic` 순수 함수 |
| `packages/core/src/utils/index.ts` | 수정 | re-export |
| `packages/core/src/__tests__/groupByEpic.test.ts` | 신설 | 단위 테스트 (5 케이스) |

### 시그니처

```ts
import type { TodoData } from '@todo-list/shared';
import type { EpicData } from '@todo-list/shared';

export type GroupByEpicResult = {
  epics: Array<{ epic: EpicData; subs: TodoData[] }>;
  standalone: TodoData[];
};

export function groupByEpic(todos: TodoData[], epics: EpicData[]): GroupByEpicResult;
```

### 구현

```ts
export function groupByEpic(
  todos: TodoData[],
  epics: EpicData[],
): GroupByEpicResult {
  const byEpic = new Map<string, TodoData[]>();
  const standalone: TodoData[] = [];

  for (const t of todos) {
    if (t.epic_id) {
      const arr = byEpic.get(t.epic_id) ?? [];
      arr.push(t);
      byEpic.set(t.epic_id, arr);
    } else {
      standalone.push(t);
    }
  }

  return {
    epics: epics
      .filter((e) => byEpic.has(e.id))
      .map((e) => ({ epic: e, subs: byEpic.get(e.id) ?? [] })),
    standalone,
  };
}
```

### 동작 규칙

- `todos` 의 순서는 `subs` 배열 내에서 보존
- `epics` 인자에 포함된 epic 만 결과에 포함 (orphan sub-issue — `epic_id` 가 있지만 `epics` 에 없는 경우 — 는 결과에서 제외, 호출 측에서 토스트 / 무시 결정)
- 동일 epic 의 subs 가 0개일 가능성: `byEpic.has` 필터로 사전 제외
- 순수 함수 — side-effect 없음, 입력 mutate 없음

### 단위 테스트 케이스

| 케이스 | 입력 | 기대 |
|---|---|---|
| epic 0개 | `todos=[]`, `epics=[]` | `{ epics: [], standalone: [] }` |
| epic 1개, subs 다수 | epic 1개 + 그 epic 의 sub 3개 | `epics.length === 1`, `subs.length === 3` |
| epic 다수 | epic 2개 + 각 sub 2개씩 | `epics.length === 2`, 각 `subs.length === 2` |
| standalone-only | epic_id 없는 todo 5개 | `epics.length === 0`, `standalone.length === 5` |
| orphan sub-issue | epic_id 있으나 `epics` 인자 미포함 | `epics` 에 미포함, `standalone` 에도 미포함 (drop) |

## 검증 과정

- [ ] `groupByEpic` 가 순수 함수로 export 됨 (입력 mutate 0건)
- [ ] 5 단위 테스트 케이스 모두 통과
- [ ] `pnpm --filter @todo-list/core test` 통과
- [ ] `pnpm --filter @todo-list/core typecheck` 통과
- [ ] orphan sub-issue 케이스의 정책 (drop vs standalone 으로 흡수) 가 테스트로 명시됨

## 주의사항

1. **위치 결정** — `packages/core/src/utils/` 우선. 만약 epic 도메인과 강결합 (e.g. `EpicData` 의 추가 메서드 의존) 이라면 `packages/core/src/domain/` 으로 이동 가능.
2. **orphan 정책** — 본 task 는 drop 채택. 후속에서 logging 또는 toast 가 필요해지면 호출 측에서 처리.
3. **타입 의존** — TASK-07-01 의 `TodoEpic` 타입 보강이 머지된 뒤 진입. select 변경이 본 유틸의 타입 추론에 영향.
4. **순서 보존 검증** — 단위 테스트에 `subs` 배열의 순서가 입력 `todos` 순서를 따른다는 케이스 추가 권장.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md) §3, §핵심 구현 로직
- [`./tasks-07-01-extend-use-todos-select.md`](./tasks-07-01-extend-use-todos-select.md)
