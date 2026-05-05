# TASK-03-07: `CreateTodoModal` (분류→Epic cascading)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 07
- **상태**: 대기중
- **의존성**: 01 (의존성), 02 (TodoFormSchema), 03 (FK toast helper)

## 작업 목표

투두 (sub_issue) 신규 생성 모달을 신설한다. 분류 → Epic cascading select 와 due_date 기본값 = 현재 선택일 (메인 뷰의 `?date=`) 이라는 두 핵심 동작을 정확히 구현한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/CreateTodoModal.tsx` | 신설 | `<CreateTodoModal>` 컴포넌트 |

### Props 시그니처

```tsx
type CreateTodoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: 'life' | 'work';
  defaultDate: string;  // 현재 선택일 (YYYY-MM-DD), 메인 뷰의 ?date= 와 일치
};
```

### 구현 세부사항

- 파일 상단 `'use client'`
- Radix Dialog (modal=true), 풀스크린 모바일 + 카드 데스크톱 (`sm:max-w-lg sm:rounded-lg`)
- `useForm({ resolver: zodResolver(TodoFormSchema) })` — task 02
- 기본값:
  - `priority: 'medium'`
  - `dueDate: defaultDate` (today 가 아니라 현재 선택일 — sub-prd §주의사항 7)
- cascading select (sub-prd §핵심 구현 로직 그대로):
  - `useCategories(workspace)` → 분류 select
  - `useEpics(form.watch('categoryId'))` → Epic select (categoryId 있을 때만 enabled)
  - 분류 변경 시 `form.setValue('epicId', '' as any)` 로 reset (sub-prd §주의사항 6)
- 제출 → `useCreateTodo({ workspace, ...values })` → 성공 시 토스트 + 닫기

### 참조 코드 (sub-prd-03 §핵심 구현 로직 cascading 그대로)

```tsx
'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { TodoFormSchema, type TodoFormValues } from '@/lib/forms/schemas';
import { useCategories, useEpics, useCreateTodo } from '@todo-list/core';

export function CreateTodoModal({ open, onOpenChange, workspace, defaultDate }: CreateTodoModalProps) {
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(TodoFormSchema),
    defaultValues: {
      title: '', description: '', priority: 'medium',
      categoryId: '' as any, epicId: '' as any, dueDate: defaultDate,
    },
  });
  const categoryId = form.watch('categoryId');
  const { data: categories } = useCategories(workspace);
  const { data: epics } = useEpics(categoryId || null);
  const create = useCreateTodo();

  // cascading reset
  useEffect(() => {
    form.setValue('epicId', '' as any);
  }, [categoryId, form]);

  const onSubmit = async (values: TodoFormValues) => {
    try {
      await create.mutateAsync({ workspace, ...values });
      toast.success('할 일이 생성되었어요');
      onOpenChange(false);
      form.reset({ ...form.formState.defaultValues, dueDate: defaultDate });
    } catch (err) {
      toast.error((err as Error).message ?? '저장 실패');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      {/* overlay / content / 폼 — 제목/설명/우선순위/분류 select/Epic select/dueDate */}
    </Dialog.Root>
  );
}
```

## 검증 과정

- [ ] `apps/web/src/components/modals/CreateTodoModal.tsx` 파일 존재
- [ ] `'use client'` 디렉티브
- [ ] `TodoFormSchema` 사용 (task 02)
- [ ] `useCategories(workspace)` + `useEpics(categoryId)` cascading
- [ ] 분류 변경 → Epic 선택값 reset (`useEffect` 또는 `onChange`)
- [ ] Epic select 는 categoryId 없을 때 disabled
- [ ] dueDate 기본값 = `defaultDate` prop (today 가 아님)
- [ ] `useCreateTodo` mutation 호출
- [ ] Radix Dialog `modal={true}` + 풀스크린 모바일 / 카드 데스크톱
- [ ] `pnpm --filter @todo-list/web typecheck` 통과

## 주의사항

1. **cascading reset 의무** — 분류 변경 시 Epic 선택값을 빈 문자열 (또는 null) 로 강제 reset. 미구현 시 이전 분류의 Epic uuid 가 그대로 제출되어 FK 위반 (sub-prd §주의사항 6).
2. **dueDate 기본값 = defaultDate prop** — `today()` 가 아니라 메인 뷰의 `?date=` 그대로. 사용자가 "어제 일자" 를 보고 있을 때 FAB 누르면 새 todo 도 어제 날짜로 생성 (sub-prd §주의사항 7).
3. **Epic select disabled 조건** — `!categoryId` 일 때 disabled. 빈 옵션 노출 금지.
4. **mutation 호출 주체는 apps/web** — `useEpics` / `useCategories` / `useCreateTodo` 직접 import 허용.
5. **uuid 빈문자열 처리** — 빈 string 을 default 로 두면 zod uuid 검증이 친화 메시지로 잡지만, type 어서션 (`'' as any`) 으로 우회 필요. 또는 default 를 `undefined` 로 두고 `as any`.
6. **ESC / overlay 닫기 의무** — Radix 기본 유지 (sub-prd §주의사항 1).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) — sub_issue insert
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §1 투두 생성, §핵심 구현 로직 cascading, §주의사항 6·7
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useCategories` / `useEpics` / `useCreateTodo`
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) — `?date=` 쿼리 의미
