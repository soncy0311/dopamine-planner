# TASK-07-07: 단위 테스트 추가 (cascade / EpicAccordionCard / groupByEpic / useTodos mapper)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md)
- **작업 번호**: 07
- **상태**: 미착수
- **의존성**: TASK-07-01 ~ TASK-07-06 모두 머지 후

## 작업 목표

신설 / 변경된 자산 (`cascadeToggleEpic`, `groupByEpic`, `EpicAccordionCard`, `useTodos` epic.progress) 의 회귀 방지 단위 테스트를 추가한다. 필요 시 `packages/ui` 에 vitest 인프라를 셋업한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/__tests__/cascadeToggleEpic.test.ts` | 신설 | cascade 호출 횟수 / 인자 검증 |
| `packages/core/src/__tests__/groupByEpic.test.ts` | 검증 / 보강 | TASK-07-03 산출물 재확인 + 누락 케이스 추가 |
| `packages/core/src/__tests__/useTodos.test.ts` (또는 mapper 테스트) | 보강 | `epic.progress` select 보존 검증 |
| `packages/ui/__tests__/EpicAccordionCard.test.tsx` | 신설 | render / expand / 콜백 검증 |
| `packages/ui/vitest.config.ts` | 신설 (부재 시) | vitest + jsdom 인프라 |
| `packages/ui/package.json` | 수정 (부재 시) | `@testing-library/react`, `jsdom`, `vitest` devDependency |

### vitest 인프라 셋업 (packages/ui)

`packages/ui` 에 vitest 인프라가 부재하면 본 task 의 첫 항목으로 셋업.

```ts
// packages/ui/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

```ts
// packages/ui/vitest.setup.ts
import '@testing-library/jest-dom/vitest';
```

> sub-prd-06 의 TASK-06-08 에서 동일 셋업이 이미 머지된 경우, 본 셋업은 skip 하고 testfile 만 추가한다.

### cascadeToggleEpic 테스트

```ts
describe('cascadeToggleEpic', () => {
  it('subs 일괄 toggle + recalc 1회 호출', async () => {
    const toggleMock = vi.fn().mockResolvedValue(undefined);
    const recalcMock = vi.fn().mockResolvedValue(undefined);
    // ... mock client / service injection
    await cascadeToggleEpic(client, epic, subs, 'done');
    expect(toggleMock).toHaveBeenCalledTimes(subs.length);
    expect(recalcMock).toHaveBeenCalledTimes(1);
  });

  it('이미 target 상태인 sub 는 toggle 호출 제외', async () => { ... });

  it('일부 toggle 실패 시에도 recalc 호출 (rollback 없음)', async () => { ... });
});
```

### groupByEpic 테스트 (TASK-07-03 보강)

- TASK-07-03 의 5 케이스 (epic 0개 / 1개 / 다수 / standalone-only / orphan) 모두 통과 재확인
- 누락 케이스 추가:
  - `subs` 순서 보존 (입력 todos 순서)
  - 동일 epic 내 sub 가 0개일 때 결과의 `epics` 에서 제외

### useTodos mapper 테스트

```ts
it('mapTodo preserves epic.progress', () => {
  const row = { id: '1', title: 't', epic: { id: 'e', title: 'E', color: '#fff', progress: 0.5 } };
  const result = mapTodo(row);
  expect(result.epic?.progress).toBe(0.5);
});
```

### EpicAccordionCard 테스트

```tsx
describe('EpicAccordionCard', () => {
  it('expanded=false 일 때 sub-issue 목록 미렌더', () => { ... });
  it('expanded=true 일 때 subIssues.length 만큼 TodoItem 렌더', () => { ... });
  it('chevron 클릭 → onToggleExpand 호출', () => { ... });
  it('메인 체크 클릭 → onMainToggle 호출', () => { ... });
  it('progressPercent 가 헤더에 표시', () => { ... });
  it('chevron 의 aria-expanded 가 expanded 와 동기', () => { ... });
});
```

### 참조 코드

- sub-prd-07 §검증 기준 §자동
- TASK-07-02 / 03 / 04 산출물

## 검증 과정

- [ ] `packages/ui` 에 vitest 인프라 셋업 (부재 시) 완료
- [ ] `cascadeToggleEpic.test.ts` — 3 케이스 (정상 cascade / 이미 done 제외 / 부분 실패) 통과
- [ ] `groupByEpic.test.ts` — 5 + 2 = 총 7 케이스 통과
- [ ] `useTodos` mapper 테스트 — `epic.progress` 보존 통과
- [ ] `EpicAccordionCard.test.tsx` — 6 케이스 통과
- [ ] `make test` (turbo test) 전체 통과
- [ ] 기존 테스트 회귀 0건

## 주의사항

1. **vitest 인프라 중복 셋업 회피** — sub-prd-06 의 TASK-06-08 에서 동일 셋업이 머지되면 skip. 충돌 시 sub-prd-06 산출물을 우선.
2. **mock 격리** — supabase client / service 의 mock 은 testfile 내 격리. 전역 mock 금지.
3. **jsdom 환경 의존** — DOM 조작을 사용하는 컴포넌트 테스트는 `environment: 'jsdom'` 필수.
4. **테스트 데이터 fixture** — TodoData / EpicData fixture 는 testfile 상단의 helper 로 분리. 테스트 간 공유 시 deep clone.
5. **Realtime 검증 제외** — Realtime 흐름은 TASK-07-06 의 수동 검증으로 처리. 본 task 는 단위 테스트만.
6. **TodoItem 의존** — sub-prd-06 의 priority / carryOverCount 확장이 머지된 뒤 진입. 부재 시 EpicAccordionCard 테스트의 sub-issue render 가 prop type error.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md) §검증 기준
- [`./tasks-07-01-extend-use-todos-select.md`](./tasks-07-01-extend-use-todos-select.md)
- [`./tasks-07-02-create-cascade-toggle-epic-service.md`](./tasks-07-02-create-cascade-toggle-epic-service.md)
- [`./tasks-07-03-create-group-by-epic-util.md`](./tasks-07-03-create-group-by-epic-util.md)
- [`./tasks-07-04-create-epic-accordion-card.md`](./tasks-07-04-create-epic-accordion-card.md)
- [`./tasks-06-08-add-unit-tests.md`](./tasks-06-08-add-unit-tests.md)
