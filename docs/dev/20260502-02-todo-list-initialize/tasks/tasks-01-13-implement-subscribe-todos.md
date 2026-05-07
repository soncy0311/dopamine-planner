# TASK-01-13: realtime/subscribeTodos 4 테이블 통합 구독

## 기본 정보

- **Sub-PRD**: [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md)
- **작업 번호**: 13
- **상태**: 완료
- **의존성**: 01 (queryKeys / `invalidateByTable`)

## 작업 목표

`packages/core/src/realtime/subscribeTodos.ts` 의 stub 을 실 구현으로 교체한다. 4 테이블 (`profile`, `category`, `epic_issue`, `sub_issue`) 변화를 단일 채널로 받아 `invalidateByTable` 로 라우팅한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `packages/core/src/realtime/subscribeTodos.ts` | 본문 작성 | `subscribeTodos(client, qc): () => void` |

### 구현 세부사항

- 시그니처: `subscribeTodos(client: SupabaseClient<Database>, qc: QueryClient): () => void`
- 본문 (sub-prd-01 §핵심 구현 로직 §subscribeTodos 그대로):

  ```ts
  const channel = client.channel('todos:all')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_issue' },
      (p) => invalidateByTable(qc, 'sub_issue'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'epic_issue' },
      (p) => invalidateByTable(qc, 'epic_issue'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'category' },
      (p) => invalidateByTable(qc, 'category'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profile' },
      (p) => invalidateByTable(qc, 'profile'))
    .subscribe();
  return () => { client.removeChannel(channel); };
  ```

- 채널 이름 `todos:all` 고정. 다중 인스턴스 호출 시 supabase-js 가 채널 다중화 처리.

### 참조 코드

sub-prd-01 §8 Realtime 헬퍼 + §핵심 구현 로직 §subscribeTodos.

## 검증 과정

- [x] `subscribeTodos` export — `(client, qc) => () => void` 시그니처
- [x] 4 테이블 모두 `.on('postgres_changes', ...)` 등록
- [x] payload 라우팅이 `invalidateByTable` 통과
- [x] unsubscribe 함수가 `client.removeChannel(channel)` 호출
- [x] `pnpm --filter @todo-list/core typecheck` 통과

## 주의사항

1. **단일 채널 의무** — 4 테이블 각각 별도 채널 만들지 말 것. 단일 `todos:all` 채널에 4번 `.on(...)`.
2. **payload 미사용** — 현재 구현은 payload 의 new/old 를 무시하고 invalidate 만 수행. 후속 시점에 fine-grained 캐시 갱신으로 확장 가능.
3. **플랫폼 의존 금지** — `window`, `react-native` 등 import 금지 (sub-prd §주의사항 1).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) §Realtime
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) §8, §핵심 구현 로직
