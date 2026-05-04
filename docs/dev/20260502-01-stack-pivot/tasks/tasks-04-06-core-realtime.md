# Task 04-06: core realtime 실 구현 (subscribeTodos)

## 작업 정보

- **Sub-PRD**: `sub-prd-04-feat-web-spa.md`
- **의존성**: Sub-02 stub 존재 (`packages/core/src/realtime/subscribeTodos.ts` 시그니처), Sub-03 task 03-03 완료 (Realtime publication 활성화)
- **대상 파일**:
  - `packages/core/src/realtime/subscribeTodos.ts` (Sub-02 stub 본문 채움)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-04-feat-web-spa.md`, `sub-prd-02-feat-core-package.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [x] `packages/core/src/realtime/subscribeTodos.ts` 실 구현 (`channel.on('postgres_changes', …)`)

## 구현 세부사항

### 1. 시그니처 (Sub-02 가 정의 — 변경 금지)

```ts
export function subscribeTodos(
  client: AppSupabaseClient,
  workspace: 'life' | 'work',
  onChange: () => void,
): () => void;
```

### 2. 본문

채널명에 workspace 포함하여 구분. `postgres_changes` 이벤트로 `sub_issue` 테이블 감지. **workspace payload 필터는 적용하지 않는다** — `sub_issue` 테이블에는 `workspace` 칼럼이 없고 (workspace 는 `category` 에만 존재), payload 에서 이를 검사하려면 추가 DB round-trip 이 필요하므로 비효율. RLS 가 1차 보안을 제공하고, `['todos']` prefix 광역 invalidate 의 비용은 작음 (date 별 캐시 엔트리 ~2개).

```ts
import type { AppSupabaseClient } from '../supabase/types';

type Workspace = 'life' | 'work';

export function subscribeTodos(
  client: AppSupabaseClient,
  workspace: Workspace,
  onChange: () => void,
): () => void {
  const channel = client
    .channel(`todos:${workspace}`)
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'sub_issue' },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
```

## 주의사항

1. **시그니처 불변** — Sub-05 mobile 도 동일 import. `(client, workspace, onChange) => unsubscribe` 변경 시 양쪽 깨짐 (Sub-PRD §주의사항 4)
2. **workspace payload 필터 미적용** — `sub_issue` 에 `workspace` 칼럼 부재. RLS 가 1차 차단(본인 데이터만 통과). 광역 invalidate (`['todos']` prefix) 비용이 작아 옵션 A 채택
3. **DELETE 이벤트** — payload 형태 무관하게 `onChange()` 호출 (광역 invalidate 정책)
4. **cleanup 반환 필수** — `useEffect` 에서 unsubscribe. `client.removeChannel(channel)` 호출
5. **플랫폼 독립** — `react-native`, `next/`, `window.` 등 import 금지 (Sub-PRD §8)

## 검증 체크리스트

- [x] `grep -n "postgres_changes" packages/core/src/realtime/subscribeTodos.ts` 1건 이상 (chained `.on(`)
- [x] `grep -n "table: 'sub_issue'" packages/core/src/realtime/subscribeTodos.ts` 1건
- [x] `grep -n "removeChannel" packages/core/src/realtime/subscribeTodos.ts` 1건
- [x] `grep -n "subscribe()" packages/core/src/realtime/subscribeTodos.ts` 1건
- [x] `grep -RIn "from 'react-native'" packages/core/src/realtime/` 0건
- [x] `grep -RIn "from 'next/" packages/core/src/realtime/` 0건
- [ ] **(사용자 환경)** `pnpm --filter @todo-list/core typecheck` exit code 0
