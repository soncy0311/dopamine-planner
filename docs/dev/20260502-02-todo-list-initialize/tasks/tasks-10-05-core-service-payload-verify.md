# TASK-10-05: core — service payload 자동 반영 검증 (`services/todo.ts` / `services/epic.ts`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-05
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-04 (domain mapper 갱신)

## 작업 목표

sub-prd-10 §2 — `services/todo.ts` 의 `TodoInsert/Update` payload 가 priority 미포함으로 자동 반영되는지 검증하고, `services/epic.ts` 의 payload 가 priority 자동 수용되는지 검증한다. 이상 발견 시 보강.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/services/todo.ts` | 검증 / 필요 시 수정 | `TodoInsert/Update` 가 priority 미포함 자동 반영. `cascadeToggleEpic` priority 의존 0 검증 |
| `packages/core/src/services/epic.ts` | 검증 / 필요 시 수정 | `EpicInsert/Update` 가 priority 자동 수용 (`Database['public']['Tables']['epic_issue']['Insert']` 따름) |

### 검증 절차

#### `services/todo.ts`

1. `TodoInsert` / `TodoUpdate` 타입이 `Database['public']['Tables']['sub_issue']['Insert' | 'Update']` 에서 파생되었는지 확인
2. 파생됐다면 priority 필드 자동 제거 — 추가 수정 불요
3. `cascadeToggleEpic` 본문에서 `priority` 참조 grep — 0건 확인
4. 잔존 시 제거 + `pnpm --filter @todo-list/core run typecheck` 통과 확인

#### `services/epic.ts`

1. `EpicInsert` / `EpicUpdate` 타입이 `Database['public']['Tables']['epic_issue']['Insert' | 'Update']` 에서 파생되었는지 확인
2. 파생됐다면 priority 필드 자동 추가 — 추가 수정 불요
3. `create` / `update` 호출이 호출자(폼)로부터 priority 를 그대로 전달하는 패턴 유지 확인 (별도 가공 X)

### 잔존 priority 참조 grep

```bash
grep -rn "priority" packages/core/src/services/
# 기대: 0건 (또는 Epic 단위 사용 정합 — Insert/Update 파생 타입 사용)
```

## 검증 과정

- [x] `TodoInsert` / `TodoUpdate` 가 priority 미포함 (Database type 파생)
- [x] `EpicInsert` / `EpicUpdate` 가 priority 포함 (Database type 파생)
- [x] `cascadeToggleEpic` 본문에 priority 참조 0건
- [x] `services/todo.ts` 의 priority 참조 0건
- [x] `pnpm --filter @todo-list/core run typecheck` 통과
- [x] services 코드 외형 변경 0 인 경우, 본 task 는 검증만 — diff 0

## 주의사항

1. **별도 가공 X**: 폼이 priority 를 직접 전달 / service 는 wrapper. 본 task 안에서 enrich / default 부여 등 추가 로직 X.
2. **`cascadeToggleEpic` priority 미사용 확인**: sub-prd-10 §2 — Epic toggle cascade 는 Sub status 만 변경. priority 의존 부재.
3. **diff 0 가능성**: TODO type 파생이 이미 정합되어 있다면 본 task 는 검증만 — PR scope 고려.
4. **scope = refactor(core)**: 변경 발생 시 PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §2
- [`./tasks-10-04-core-domain-priority-relocate.md`](./tasks-10-04-core-domain-priority-relocate.md)
- `packages/core/src/services/{todo,epic}.ts`
- `packages/shared/src/database.ts`
