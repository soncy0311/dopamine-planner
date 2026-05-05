# TASK-03-06: `EpicFormModal` (분류 cascading + 진행률 표시)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 06
- **상태**: 완료
- **의존성**: 01 (의존성), 02 (EpicFormSchema), 03 (FK toast helper)

## 작업 목표

Epic 생성·수정 폼 모달을 신설한다. 분류 select 는 `useCategories(workspace)` 로 채우고, 수정 모드에서는 진행률 (`epic_progress` view 또는 Sub-01 의 progress 훅) 을 표시한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/EpicFormModal.tsx` | 신설 | `<EpicFormModal>` 컴포넌트 |

### Props 시그니처

```tsx
type EpicFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: 'life' | 'work';
  initial?: { id: string; categoryId: string; title: string; description?: string };
};
```

### 구현 세부사항

- 파일 상단 `'use client'`
- Radix Dialog (modal=true), 풀스크린 모바일 + 카드 데스크톱
- `useForm({ resolver: zodResolver(EpicFormSchema) })` — task 02 의 스키마
- 필드:
  - 분류 select — `useCategories(workspace)` 결과로 옵션 렌더 (apps/web 호스트라 직접 import OK)
  - 제목 / 설명
- 수정 모드 한정:
  - 상단에 진행률 segmented progress bar (Sub-02 task 04 의 `<EpicProgressBar>` 가 packages/ui 에 있다면 import, 아직 미신설이면 간이 표시)
  - `epicService.getProgress(epicId)` 또는 Sub-01 의 hook (예: `useEpicProgress(epicId)`)
- 제출:
  - 생성 → `useCreateEpic({ workspace, categoryId, title, description })`
  - 수정 → `useUpdateEpic({ id, ...values })`
  - 성공 토스트 + 닫기

### 참조 코드 골격

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { EpicFormSchema, type EpicFormValues } from '@/lib/forms/schemas';
import {
  useCategories,
  useCreateEpic,
  useUpdateEpic,
  useEpicProgress,
} from '@todo-list/core';

export function EpicFormModal({ open, onOpenChange, workspace, initial }: EpicFormModalProps) {
  const isEdit = !!initial;
  const { data: categories } = useCategories(workspace);
  const form = useForm<EpicFormValues>({
    resolver: zodResolver(EpicFormSchema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      categoryId: initial?.categoryId ?? '',
    },
  });
  const create = useCreateEpic();
  const update = useUpdateEpic();
  const { data: progress } = useEpicProgress(initial?.id);  // 수정 모드 한정 의미

  const onSubmit = async (values: EpicFormValues) => {
    try {
      if (isEdit) await update.mutateAsync({ id: initial!.id, ...values });
      else await create.mutateAsync({ workspace, ...values });
      toast.success(isEdit ? 'Epic 이 수정되었어요' : 'Epic 이 생성되었어요');
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message ?? '저장 실패');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      {/* overlay / content / 풀스크린 + 카드 */}
      {/* 수정 모드: <EpicProgressBar progress={progress} /> 또는 간이 표시 */}
      {/* 분류 select: categories?.map(...) */}
      {/* title / description */}
    </Dialog.Root>
  );
}
```

## 검증 과정

- [x] `apps/web/src/components/modals/EpicFormModal.tsx` 파일 존재
- [x] `'use client'` 디렉티브
- [x] `EpicFormSchema` 사용 (task 02)
- [x] `useCategories(workspace)` 호출 + 옵션 렌더
- [ ] 수정 모드에서 진행률 표시 (`useEpicProgress` 또는 등가) — core 훅 미존재로 본 sub 에서는 미사용 (plan §위험과 완화). 후속 sub 에서 `useEpicProgress` 추가 후 표시.
- [x] `useCreateEpic` / `useUpdateEpic` mutation 호출
- [x] Radix Dialog `modal={true}` + 풀스크린 모바일 / 카드 데스크톱
- [x] `pnpm --filter @todo-list/web typecheck` 통과

## 주의사항

1. **진행률 표시는 수정 모드 한정** — 생성 모드엔 epicId 가 없어 표시 불가. `initial` 없을 때 progress 영역 hide.
2. **`<EpicProgressBar>` 의존성** — Sub-02 task 04 의 산출물 (`packages/ui`). 본 task 13 (모달 연결) 시점에는 이미 존재 가정. 미신설 상태이면 간이 `<div>{progress.completed}/{progress.total}</div>` 로 placeholder.
3. **분류 cascading 초기화** — Epic 폼은 분류 변경이 있어도 reset 할 하위 select 가 없으므로 cascading reset 비대상. (CreateTodoModal 만 해당 — task 07).
4. **진행률 훅명** — Sub-01 에서 `useEpicProgress(epicId)` 로 export 가정. 실제 export 명이 다르면 task 06 본문 수정 (현재 plan 단계엔 영향 없음).
5. **ESC / overlay 닫기** — Radix 기본 유지 (sub-prd §주의사항 1).
6. **mutation 호출 주체는 apps/web** — react-query 훅 직접 import 허용.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) — epics CRUD / `epic_progress`
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §4 Epic 관리, §주의사항 1·3
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useCategories` / `useCreateEpic` / `useUpdateEpic` / Epic progress
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) §EpicProgressBar
