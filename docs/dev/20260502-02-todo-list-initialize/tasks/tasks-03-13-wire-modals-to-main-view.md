# TASK-03-13: `MainDailyView` + `TodoItem` 모달 연결

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 13
- **상태**: 완료
- **의존성**: 07 (CreateTodoModal), 08 (TodoDetailModal), Sub-02 task 03 (`<TodoItem>`) + Sub-02 task 08 (`<MainDailyView>`)

## 작업 목표

Sub-02 가 placeholder 로 두었던 모달 트리거 (FAB onClick / TodoItem onClick) 를 실제 모달 컴포넌트와 연결한다. Sub-02 산출물 2 종을 수정하는 단일 목적 task.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/MainDailyView.tsx` | 수정 | FAB onClick → `<CreateTodoModal>` open |
| `apps/web/src/components/TodoItem.tsx` | 수정 | item click → `<TodoDetailModal>` open (또는 host 가 onPress 콜백으로 수신) |

### 구현 세부사항

#### `MainDailyView.tsx`

- `useState` 로 `createOpen` / `detailTodoId` 상태 관리
- FAB onClick → `setCreateOpen(true)`
- TodoItem 클릭 (TodoSection 의 onPress 콜백) → `setDetailTodoId(id)`
- 렌더 끝에 두 모달 추가:
  ```tsx
  <CreateTodoModal
    open={createOpen}
    onOpenChange={setCreateOpen}
    workspace={workspace}
    defaultDate={date}
  />
  {detailTodoId && (
    <TodoDetailModal
      open={!!detailTodoId}
      onOpenChange={(o) => !o && setDetailTodoId(null)}
      workspace={workspace}
      todoId={detailTodoId}
    />
  )}
  ```

#### `TodoItem.tsx`

- Sub-02 task 03 산출물이 이미 `onPress` 콜백을 props 로 받고 있으면 본 task 에서 수정 불필요 — Sub-02 가 패턴을 잘 잡았다면 모달 연결만으로 끝남.
- 콜백이 없으면 `onPress?: (id: string) => void` 추가, 클릭 가능 영역에 `onClick={() => onPress?.(item.id)}` 부착.
- 토글 체크박스 영역과 클릭 영역을 분리 (체크박스 클릭은 토글, 본문 클릭은 상세 진입).

### 참조 코드 (sub-prd-02 §핵심 구현 로직 + sub-prd-03 §1·2 결합)

```tsx
// apps/web/src/components/MainDailyView.tsx (수정 후)
'use client';
import { useEffect, useState } from 'react';
// ... 기존 imports
import { CreateTodoModal } from './modals/CreateTodoModal';
import { TodoDetailModal } from './modals/TodoDetailModal';

export function MainDailyView({ workspace }: { workspace: Workspace }) {
  const client = useSupabaseClient();
  const qc = useQueryClient();
  const [date, setDate] = useDateQuery();
  useEffect(() => subscribeTodos(client, qc), [client, qc]);
  const { data, isLoading } = useTodos(workspace, date);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailTodoId, setDetailTodoId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <DateHeader date={date} onChange={setDate} />
      <DoneSection items={data?.done ?? []} onPress={setDetailTodoId} />
      <TodoSection items={data?.todo ?? []} onPress={setDetailTodoId} />
      <FAB onClick={() => setCreateOpen(true)} ariaLabel="새 일 추가" />

      <CreateTodoModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspace={workspace}
        defaultDate={date}
      />
      {detailTodoId && (
        <TodoDetailModal
          open
          onOpenChange={(o) => !o && setDetailTodoId(null)}
          workspace={workspace}
          todoId={detailTodoId}
        />
      )}
    </div>
  );
}
```

## 검증 과정

- [x] `apps/web/src/components/MainDailyView.tsx` 에 `<CreateTodoModal>` + `<TodoDetailModal>` import + 렌더
- [x] FAB onClick 이 `setCreateOpen(true)` 트리거
- [x] TodoItem 클릭 → onPress → `setDetailTodoId(id)`
- [x] `defaultDate={date}` 전달 (현재 선택일 = 메인 뷰의 ?date)
- [x] `apps/web/src/components/TodoItem.tsx` 의 클릭 영역 / 토글 체크박스 영역 분리 (sub-02 산출 — packages/ui/src/TodoItem.tsx 가 이미 onToggle / onPress 분리. 본 task 추가 수정 0)
- [x] `pnpm --filter @todo-list/web typecheck` 통과
- [x] `grep -n "import.*CreateTodoModal\|import.*TodoDetailModal" apps/web/src/components/MainDailyView.tsx` → 2 건

## 주의사항

1. **Sub-02 산출물 의존** — Sub-02 의 task 03 / 07 / 08 가 먼저 머지되어야 함. 본 task 실행 시점에 `<MainDailyView>` / `<TodoItem>` / `<TodoSection>` 모두 존재 가정.
2. **TodoItem 위치** — 본 plan 의 분해 정책상 `apps/web/src/components/TodoItem.tsx` (Sub-02 가 web 에 두었음) 가정. 실제로 `packages/ui` 에 두었다면 본 task 의 수정 대상이 packages/ui 로 바뀜 — Sub-02 산출물 머지 후 정정.
3. **체크박스 vs 본문 클릭 분리** — 체크박스는 `onToggle` (Sub-01 의 `useToggleTodo`), 본문은 `onPress(id)` (모달 open). 이벤트 버블링 차단 (`stopPropagation`) 으로 동시 트리거 방지.
4. **`defaultDate` prop 의무** — Sub-PRD §주의사항 7 — 새 todo 의 dueDate 기본값이 메인 뷰의 현재 선택일이어야 함. `today()` 가 아님.
5. **CRUD 모달 import 0건 이었던 검증 (Sub-02 task 13)** — 본 task 에서 의도적으로 위반. Sub-03 가 이를 채우는 것이 정상 흐름.
6. **두 모달 동시 open 가능성** — Detail 모달이 열려 있을 때 FAB 클릭으로 Create 모달 추가 open 은 비정상 UX. FAB disable 또는 Detail open 시 FAB hide 권장 (선택).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §1 투두 생성, §2 상세·수정·삭제, §주의사항 7
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) — `<MainDailyView>` (task 08), `<TodoItem>` (task 03), `<FAB>` (task 06)
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useToggleTodo`
