# TASK-07-02: `cascadeToggleEpic` 도메인 서비스 신설

## 기본 정보

- **Sub-PRD**: [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md)
- **작업 번호**: 02
- **상태**: 완료 (2026-05-06)
- **의존성**: 없음 (TASK-07-01 과 병렬 가능)

## 작업 목표

epic 메인 체크 토글 시 sub-issue 일괄 status 변경 + `recalc_epic_progress` RPC 1회 호출하는 도메인 함수 `cascadeToggleEpic` 를 신설한다. 디바운스는 호출 측 hook 의 책임으로 분리한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/services/todo.ts` (또는 동등 위치) | 수정 | `cascadeToggleEpic` 함수 신설 |
| `packages/core/src/services/index.ts` | 수정 | `cascadeToggleEpic` re-export |

### 함수 시그니처

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { recalcEpicProgress } from './epic';
import { toggle } from './todo';

export async function cascadeToggleEpic(
  client: SupabaseClient,
  epic: { id: string },
  subs: Array<{ id: string; status: 'todo' | 'done' }>,
  target: 'todo' | 'done',
): Promise<void> {
  await Promise.all(
    subs
      .filter((s) => s.status !== target)
      .map((s) => toggle(client, s.id, target)),
  );
  await recalcEpicProgress(client, epic.id);
}
```

### 동작 규칙

- `subs` 중 이미 `target` 상태인 항목은 토글 호출에서 제외 (no-op 회피)
- `Promise.all` 병렬 처리 — 단일 RPC 트랜잭션 도입은 후속 결정 (sub-prd-07 §미해결 항목)
- `recalcEpicProgress` 는 **일괄 후 1회만** 호출 — sub-issue 단건 toggle 의 디바운스와 별개로 cascade 전용 단건 호출
- 일부 sub toggle 실패 시: 1차 정책 — rollback 없이 invalidate (sub-prd-07 §주의사항 3). 호출 측 hook 에서 query invalidate.

### 참조 코드

- sub-prd-07 §2 "cascade 토글"
- `packages/core/src/services/todo.ts` — 기존 `toggle` 함수
- `packages/core/src/services/epic.ts` — 기존 `recalcEpicProgress` 헬퍼
- `supabase/migrations/004_recalc_epic_progress.sql` — RPC 정의

## 검증 과정

- [ ] `cascadeToggleEpic` 가 `services/index.ts` 에서 export 됨
- [ ] `Promise.all` 로 sub 일괄 toggle 호출
- [ ] `recalc_epic_progress` RPC 가 정확히 1회 호출됨
- [ ] 이미 `target` 상태인 sub 는 toggle 에서 제외됨
- [ ] `pnpm --filter @todo-list/core typecheck` / `lint` 통과
- [ ] 단위 테스트 (TASK-07-07 에서 작성) — 호출 횟수 / 인자 검증

## 주의사항

1. **디바운스는 호출 측 책임** — 본 함수는 단건 호출. 동일 epic 의 cascade 가 짧은 시간 내 다회 발생할 경우의 합치기는 호출 측 hook (예: `useToggleTodo` 의 debounceByEpic) 에서 처리.
2. **rollback 정책 1차 단순화** — 일부 실패 시 중간 상태 허용. 후속에서 단일 RPC 트랜잭션 (`cascade_toggle_epic`) 로 강화 가능 (sub-prd-07 §미해결).
3. **단일 RPC 트랜잭션 vs Promise.all** — 본 task 는 Promise.all 채택. 후속 결정 시 본 함수의 구현부만 교체하고 시그니처는 유지.
4. **이미 target 상태인 sub 제외** — RPC race / Realtime 노이즈 회피. status 가 동일한 항목까지 update 호출 시 불필요한 Realtime 이벤트가 발생.
5. **toggle 함수 의존** — 기존 `toggle(client, id, target)` 시그니처가 변하면 본 함수도 같이 수정. 의존 함수 변경 시 함께 검토.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md) §2
- [`./tasks-01-05-implement-todo-service.md`](./tasks-01-05-implement-todo-service.md)
- [`./tasks-01-07-implement-epic-progress-service.md`](./tasks-01-07-implement-epic-progress-service.md)
