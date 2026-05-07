# TASK-01-07: services/epicProgress.ts RPC wrapper

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 07
- **상태**: 완료
- **의존성**: (없음). 단 task 04(`services/epic.ts`) 가 본 wrapper 에 위임 — 본 task 가 먼저 존재해야 04 typecheck 통과.

## 작업 목표

`packages/core/src/services/epicProgress.ts` 의 stub 을 실 구현으로 교체. Postgres RPC `recalc_epic_progress` 를 thin wrapper 로 감싸 단일 row 배열 첫 번째 요소만 추출한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/services/epicProgress.ts` | 본문 작성 | `recalcEpicProgress(client, epicId): Promise<number>` |

### 구현 세부사항

- 시그니처: `recalcEpicProgress(client: SupabaseClient<Database>, epicId: string): Promise<number>`
- 본문:

  ```ts
  const { data, error } = await client.rpc('recalc_epic_progress', { epic_id: epicId });
  if (error) throw error;
  return data?.[0]?.progress ?? 0;
  ```

- 004 마이그레이션의 `returns table(progress numeric)` 시그니처와 정합

### 참조 코드

sub-prd-01 §6 RPC wrapper.

## 검증 과정

- [x] `recalcEpicProgress` 함수 export
- [x] `data?.[0]?.progress ?? 0` 패턴 사용
- [ ] `pnpm --filter @todo-list/core typecheck` 통과 (task 11 에서 일괄)
- [x] `grep -RIn "recalc_epic_progress" packages/core/src/services/epicProgress.ts` 결과 ≥ 1건

## 주의사항

1. **단일 row 배열 추출 패턴** — `data?.[0]?.progress` 일관 적용 (sub-prd §주의사항 2).
2. **호출 위치** — 본 wrapper 는 `useToggleTodo` 의 200ms debounce 후 호출 (sub-prd §주의사항 6) + `services/epic.ts` 의 `recalcProgress` 위임 진입점.
3. **에러는 throw** — supabase error 객체 그대로 throw.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §RPC
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §6
