# TASK-07-06: Realtime invalidate 흐름 검증 (epic 진행률)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md)
- **작업 번호**: 06
- **상태**: 완료 (2026-05-06) — 코드 변경 0건, 기존 흐름 정합 확인

## 검증 결과 (2026-05-06)

코드 추적 결과 sub-prd-07 의 Realtime invalidation 흐름은 본 sub 의 추가 보강 없이 이미 정합:

- `packages/core/src/realtime/subscribeTodos.ts` — `sub_issue`, `epic_issue`, `category`, `profile` 4개 테이블의 `postgres_changes` 를 구독하고 `invalidateByTable` 로 각각 `['todos']`/`['epics']`/`['categories']`/`['profile']` query 를 invalidate. epic 진행률 갱신 (`recalc_epic_progress` 의 epic_issue UPDATE) 이 자동으로 `['epics']` invalidate 를 트리거.
- `packages/core/src/hooks/useToggleTodo.ts` — onSuccess 에서 `debounceByEpic(200ms)` 로 `recalcEpicProgress` 호출 → epic_issue UPDATE → Realtime postgres_changes → `['epics']` invalidate. onSettled 에서 `['todos']` + `['epics']` 직접 invalidate (낙관적 업데이트 보호).
- `cascadeToggleEpic` — `Promise.all` 후 `recalcEpicProgress` 1회 호출. 호출 측 `MainDailyView` 의 `handleCascadeToggle` 가 finally 에서 `queryKeys.todos(workspace, date)` / `queryKeys.epics(workspace)` 둘 다 invalidate.

추가 코드 변경 없음. 다중 디바이스 sync 수동 검증은 TASK-07-08 게이트의 시나리오 4·5번에서 수행.
- **의존성**: TASK-07-02 (cascade 함수 머지 후 검증 가능)

## 작업 목표

`sub_issue.status` 변경 → `recalc_epic_progress` RPC → `epic_issue.progress` 변경 → `['epics']` query invalidate 흐름이 일관되게 처리되는지 검증한다. 누락된 invalidate 가 있다면 `subscribeTodos` 또는 `useToggleTodo` 에 보강 (코드 변경 가능성 있음).

## 상세 구현 내용

### 검증 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/realtime/subscribeTodos.ts` (또는 동등 위치) | 검증 / 필요 시 보강 | `epic_issue` 변경 → `['epics']` invalidate 흐름 정합 |
| `packages/core/src/hooks/useToggleTodo.ts` | 검증 / 필요 시 보강 | cascade 직후 epic invalidate 호출 추가 |

### 검증 시나리오

#### 시나리오 A: 단일 sub-issue toggle

1. 두 브라우저 탭에서 동일 워크스페이스의 동일 일자를 연다
2. 탭 1 에서 임의 sub-issue 토글
3. 탭 2 에서 해당 epic 카드의 진행률 텍스트 / segmented bar 가 200ms 이내 갱신되는지 확인

#### 시나리오 B: cascade 토글

1. 두 탭 동일 상태
2. 탭 1 에서 epic 메인 체크 클릭 (cascade)
3. 탭 2 에서 모든 sub 가 done + 진행률 100% 로 갱신되는지 확인
4. 탭 2 의 react-query devtools 에서 `['epics']` query 가 invalidate 1회만 발생하는지 확인 (디바운스 200ms 합치기 정합)

#### 시나리오 C: race / optimistic update 충돌

1. 탭 1 에서 토글 (optimistic update 적용)
2. 같은 시점에 Realtime 갱신이 도착
3. 동일 todo 의 status 가 깜빡이거나 잘못된 값으로 덮어씌워지지 않는지 확인 (queryKeys 단일화 정합)

### 보강 가이드

검증 결과 누락된 invalidate 가 있다면:

- `subscribeTodos` 채널의 `epic_issue` 이벤트에서 `queryClient.invalidateQueries({ queryKey: queryKeys.epics(...) })` 호출 확인
- cascade 직후 host 측에서 `['epics']` invalidate 호출 (TASK-07-05 의 `handleMainToggle` 와 정합)
- 디바운스 200ms 가 sub_issue 단건 토글에는 적용되지만 cascade 일괄 후 1회 호출과 충돌하지 않는지 확인

### 참조 코드

- sub-prd-07 §사전 조건 §3 / §주의사항 4 / §주의사항 7
- `packages/core/src/realtime/subscribeTodos.ts` (또는 동등 위치)
- `packages/core/src/hooks/useToggleTodo.ts` — debounceByEpic 200ms

## 검증 과정

- [ ] 시나리오 A 통과 — 단일 sub-issue 토글 후 다른 탭의 epic 진행률 200ms 이내 갱신
- [ ] 시나리오 B 통과 — cascade 후 다른 탭에서 모든 sub + 진행률 100% 갱신, `['epics']` invalidate 1회
- [ ] 시나리오 C 통과 — optimistic / Realtime 충돌 없음, 깜빡임 없음
- [ ] 디바운스 200ms 가 cascade 일괄 호출에서도 1회로 합쳐짐
- [ ] 누락 invalidate 발견 시 보강 후 다시 시나리오 A/B/C 통과
- [ ] react-query devtools 로 query 키 / invalidate 호출 횟수 검증

## 주의사항

1. **코드 변경 최소화** — 본 task 는 검증이 주. 보강은 누락 발견 시에만. 보강 시에도 sub-prd-01 의 queryKeys 단일화 정책 준수.
2. **디바운스 정합** — cascade 직후 단건 호출은 1회. sub_issue 단건 토글은 debounceByEpic 200ms. 두 흐름이 충돌하지 않는지 확인.
3. **Realtime 채널 재사용** — 새 채널 생성 금지. 기존 `subscribeTodos` 채널만 사용 (sub-prd-01 정합).
4. **optimistic update 정책** — 본 task 는 optimistic update 추가 / 변경 0건. 기존 정책 유지.
5. **수동 검증의 재현성** — 검증 결과를 sub-prd-07 §검증 기준 §수동 의 해당 항목에 체크 마킹 (TASK-07-08 게이트).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-07-feat-epic-accordion-card.md`](../sub-prd-07-feat-epic-accordion-card.md) §사전 조건 §3, §주의사항 4, 7
- [`./tasks-01-12-implement-use-toggle-todo.md`](./tasks-01-12-implement-use-toggle-todo.md)
- [`./tasks-01-13-implement-subscribe-todos.md`](./tasks-01-13-implement-subscribe-todos.md)
- [`./tasks-07-02-create-cascade-toggle-epic-service.md`](./tasks-07-02-create-cascade-toggle-epic-service.md)
