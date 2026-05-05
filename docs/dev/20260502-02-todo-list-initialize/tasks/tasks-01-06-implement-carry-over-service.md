# TASK-01-06: services/carryOver.ts RPC wrapper

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 06
- **상태**: 대기중
- **의존성**: (없음)

## 작업 목표

`packages/core/src/services/carryOver.ts` 의 stub 을 실 구현으로 교체. Postgres RPC `carry_over_todos` 를 thin wrapper 로 감싸 단일 row 배열 첫 번째 요소만 추출한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/services/carryOver.ts` | 본문 작성 | `carryOverTodos(client, targetDate): Promise<number>` |

### 구현 세부사항

- 시그니처: `carryOverTodos(client: SupabaseClient<Database>, targetDate: string): Promise<number>`
- 본문:

  ```ts
  const { data, error } = await client.rpc('carry_over_todos', { target_date: targetDate });
  if (error) throw error;
  return data?.[0]?.moved_count ?? 0;
  ```

- 003 마이그레이션의 `returns table(moved_count int)` 시그니처와 정합

### 참조 코드

sub-prd-01 §6 RPC wrapper + sub-prd-01 §핵심 구현 로직 의 `carryOverTodos` 예시.

## 검증 과정

- [ ] `carryOverTodos` 함수 export
- [ ] `data?.[0]?.moved_count ?? 0` 패턴 사용
- [ ] `pnpm --filter @todo-list/core typecheck` 통과
- [ ] `grep -RIn "carry_over_todos" packages/core/src/services/carryOver.ts` 결과 ≥ 1건

## 주의사항

1. **단일 row 배열 추출 패턴** — `data?.[0]?.moved_count` 일관 적용. 003·004 마이그레이션 정합 (sub-prd §주의사항 2).
2. **에러는 throw** — supabase error 객체 그대로 throw. 호출 측이 처리.
3. **호출 위치 단일화** — 본 wrapper 의 호출은 `useTodos` 의 진입 effect 1군데 (sub-prd §주의사항 5).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §RPC
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §6
