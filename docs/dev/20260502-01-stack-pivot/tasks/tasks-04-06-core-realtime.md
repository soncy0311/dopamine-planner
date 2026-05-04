# Task 04-06: core realtime 실 구현 (subscribeTodos)

## 작업 정보

- **Sub-PRD**: `sub-prd-04-feat-web-spa.md`
- **의존성**: Sub-02 stub 존재 (`packages/core/src/realtime/subscribeTodos.ts` 시그니처), Sub-03 task 03-03 완료 (Realtime publication 활성화)
- **대상 파일**:
  - `packages/core/src/realtime/subscribeTodos.ts` (Sub-02 stub 본문 채움)
- **참조 파일**: `main-prd-stack-pivot.md`, `sub-prd-04-feat-web-spa.md`, `sub-prd-02-feat-core-package.md`

## 대상 체크리스트 (Sub-PRD 매핑)

- [ ] `packages/core/src/realtime/subscribeTodos.ts` 실 구현 (`channel.on('postgres_changes', …)`)

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

채널명에 workspace 포함하여 구분. `postgres_changes` 이벤트로 `sub_issue` 테이블 감지. payload 에서 workspace 일치 여부 확인 후 `onChange()` 호출. cleanup 함수 반환 필수.

```ts
import type { AppSupabaseClient } from '../supabase/types';

type Workspace = 'life' | 'work';

export function subscribeTodos(
  client: AppSupabaseClient,
  workspace: Workspace,
  onChange: () => void,
): () => void {
  const channel = client
    .channel(`todos-${workspace}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sub_issue' },
      (payload) => {
        const newRow = (payload.new ?? {}) as { workspace?: Workspace };
        const oldRow = (payload.old ?? {}) as { workspace?: Workspace };
        if (newRow.workspace === workspace || oldRow.workspace === workspace) {
          onChange();
        }
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
2. **workspace 필터 — RLS + payload 이중 검사** — RLS 가 1차 차단하지만 클라이언트 측에서도 `payload.new.workspace === workspace` 확인하여 다른 workspace 변경 시 불필요한 invalidation 방지
3. **DELETE 이벤트** — `payload.new` 가 없을 수 있음 → `payload.old.workspace` 도 검사 (위 코드 참고)
4. **cleanup 반환 필수** — `useEffect` 에서 unsubscribe. `client.removeChannel(channel)` 호출
5. **플랫폼 독립** — `react-native`, `next/`, `window.` 등 import 금지 (Sub-PRD §8)

## 검증 체크리스트

- [ ] `grep -n "channel.on('postgres_changes'" packages/core/src/realtime/subscribeTodos.ts` 1건 (또는 chained `.on(`)
- [ ] `grep -n "table: 'sub_issue'" packages/core/src/realtime/subscribeTodos.ts` 1건
- [ ] `grep -n "removeChannel" packages/core/src/realtime/subscribeTodos.ts` 1건
- [ ] `grep -n "subscribe()" packages/core/src/realtime/subscribeTodos.ts` 1건
- [ ] `grep -RIn "from 'react-native'" packages/core/src/realtime/` 0건
- [ ] `grep -RIn "from 'next/" packages/core/src/realtime/` 0건
- [ ] `pnpm --filter @todo-list/core typecheck` exit code 0
