# TASK-03-08: `TodoDetailModal` (조회·수정·삭제 통합)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 08
- **상태**: 대기중
- **의존성**: 01 (의존성), 02 (TodoFormSchema), 03 (FK toast helper), 04 (ConfirmDeleteDialog)

## 작업 목표

기존 sub_issue 의 상세 조회·수정·삭제를 단일 모달에서 처리한다. TodoItem 클릭 시 open 되며, 수정 폼 + 하단 삭제 버튼 → confirm dialog → `useDeleteTodo` 로 이어지는 통합 인터랙션을 제공한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/TodoDetailModal.tsx` | 신설 | `<TodoDetailModal>` 컴포넌트 |

### Props 시그니처

```tsx
type TodoDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: 'life' | 'work';
  todoId: string;  // 모달 open 시 fetch 트리거
};
```

### 구현 세부사항

- 파일 상단 `'use client'`
- Radix Dialog (modal=true), 풀스크린 모바일 + 카드 데스크톱
- 데이터 로드:
  - `useTodoDetail(todoId)` (Sub-01) 또는 동등 단건 조회 훅. 미존재 시 sub_issue 단건 service 호출 + react-query
- 폼:
  - `useForm({ resolver: zodResolver(TodoFormSchema), values: detail })` — `values` 사용으로 detail 도착 시 폼 자동 동기화 (RHF 의 `values` prop)
  - cascading select 동일 (분류 → Epic, 분류 변경 시 epic reset)
- 수정 → `useUpdateTodo({ id: todoId, ...values })` → 성공 토스트 + 닫기
- 삭제:
  - 하단 destructive 버튼 → `<ConfirmDeleteDialog>` (task 04) open
  - confirm → `useDeleteTodo(todoId)` → 성공 시 두 모달 모두 닫기 + 토스트
  - 실패 시 `showFkOrDefaultError(err, '...')` (sub_issue 는 자식이라 FK 23503 거의 발생 안 함, 그래도 helper 통과)

### 참조 코드 골격

```tsx
'use client';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { TodoFormSchema, type TodoFormValues } from '@/lib/forms/schemas';
import { useTodoDetail, useUpdateTodo, useDeleteTodo, useCategories, useEpics } from '@todo-list/core';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';

export function TodoDetailModal({ open, onOpenChange, workspace, todoId }: TodoDetailModalProps) {
  const { data: detail } = useTodoDetail(todoId, { enabled: open });
  const update = useUpdateTodo();
  const remove = useDeleteTodo();

  const values = useMemo<TodoFormValues | undefined>(() => detail && ({
    title: detail.title, description: detail.description ?? '',
    priority: detail.priority, categoryId: detail.categoryId,
    epicId: detail.epicId, dueDate: detail.dueDate,
  }), [detail]);

  const form = useForm<TodoFormValues>({ resolver: zodResolver(TodoFormSchema), values });
  const categoryId = form.watch('categoryId');
  const { data: categories } = useCategories(workspace);
  const { data: epics } = useEpics(categoryId || null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const onSubmit = async (v: TodoFormValues) => {
    try {
      await update.mutateAsync({ id: todoId, ...v });
      toast.success('수정되었어요');
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message ?? '저장 실패');
    }
  };

  const onConfirmDelete = async () => {
    try {
      await remove.mutateAsync(todoId);
      toast.success('삭제되었어요');
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (err) {
      showFkOrDefaultError(err, '연결된 자료가 있어 삭제할 수 없어요.');
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
        {/* form: 제목/설명/우선순위/분류 select/Epic select/dueDate */}
        {/* 하단: [삭제] [취소] [저장] */}
      </Dialog.Root>
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="이 할 일을 삭제할까요?"
        description="이 작업은 되돌릴 수 없어요."
        onConfirm={onConfirmDelete}
        loading={remove.isPending}
      />
    </>
  );
}
```

## 검증 과정

- [ ] `apps/web/src/components/modals/TodoDetailModal.tsx` 파일 존재
- [ ] `'use client'` 디렉티브
- [ ] `TodoFormSchema` + RHF `values` prop 으로 detail 도착 시 자동 동기화
- [ ] cascading select (분류 변경 시 Epic reset)
- [ ] `useUpdateTodo` / `useDeleteTodo` 호출
- [ ] `<ConfirmDeleteDialog>` (task 04) 사용
- [ ] 삭제 실패 시 `showFkOrDefaultError` 사용
- [ ] Radix Dialog `modal={true}` + 풀스크린 모바일 / 카드 데스크톱
- [ ] `pnpm --filter @todo-list/web typecheck` 통과

## 주의사항

1. **detail 미도착 상태 처리** — 모달 열릴 때 fetch. 도착 전엔 폼 비활성 또는 스켈레톤. RHF `values` prop 으로 도착 시점에 폼 자동 동기화.
2. **수정·삭제 단일 컴포넌트** — Sub-PRD §2 가 "수정·삭제 통합" 명시. 별도 EditTodoModal 분리 금지.
3. **삭제 확인 의무** — 직접 삭제 mutation 금지. 반드시 `<ConfirmDeleteDialog>` 경유.
4. **2 단 모달 닫기 순서** — confirm 모달 먼저 닫고 → detail 모달 닫기. 동시 닫기는 Radix 의 focus trap 충돌 가능.
5. **cascading reset 동일** — task 07 와 동일하게 `useEffect` 로 epic reset.
6. **mutation 호출 주체는 apps/web** — react-query 훅 직접 import 허용.
7. **ESC / overlay 닫기** — Radix 기본 유지 (sub-prd §주의사항 1).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) — sub_issue update / delete
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §2 상세·수정·삭제, §주의사항 1·6
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useTodoDetail` (또는 동등) / `useUpdateTodo` / `useDeleteTodo`
