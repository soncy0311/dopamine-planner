# TASK-03-05: `CategoryFormModal` (생성·수정, 8색 팔레트)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 05
- **상태**: 대기중
- **의존성**: 01 (의존성), 02 (CategoryFormSchema), 03 (FK toast helper)

## 작업 목표

분류 생성·수정 폼 모달을 신설한다. 생성·수정을 단일 컴포넌트로 처리하며, `mode` prop 또는 `initialValue` 유무로 분기한다. 색상은 디자인 시스템 팔레트 8색 중 선택 (자유 입력 금지).

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/CategoryFormModal.tsx` | 신설 | `<CategoryFormModal>` 컴포넌트 |

### Props 시그니처

```tsx
type CategoryFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: 'life' | 'work';
  initial?: { id: string; name: string; color: string };  // 있으면 수정 모드
};
```

### 구현 세부사항

- 파일 상단 `'use client'`
- Radix Dialog (modal=true), 풀스크린 모바일 + 카드 데스크톱 (`sm:max-w-md sm:rounded-lg`)
- `useForm({ resolver: zodResolver(CategoryFormSchema) })` — task 02 의 스키마 사용
- 8색 팔레트 (디자인 시스템 토큰):
  - 예: `['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B']`
  - 라디오 버튼 그룹 또는 클릭 가능한 swatch
- 제출:
  - 생성 모드 → Sub-01 의 `useCreateCategory()` mutation (apps/web 호스트가 react-query 직접 사용 — sub-prd §위험과 완화)
  - 수정 모드 → `useUpdateCategory()` mutation
  - 성공 시 `toast.success(...)` + `onOpenChange(false)`
  - 실패 시 `toast.error(err.message ?? '저장 실패')`
- ESC / overlay 클릭으로 닫기 (Radix 기본)
- 폼 제출 중 (`isSubmitting`) 저장 버튼 disabled + 한글 라벨

### 참조 코드 골격

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { CategoryFormSchema, type CategoryFormValues } from '@/lib/forms/schemas';
import { useCreateCategory, useUpdateCategory } from '@todo-list/core';

const PALETTE = ['#EF4444','#F59E0B','#10B981','#06B6D4','#3B82F6','#8B5CF6','#EC4899','#64748B'] as const;

export function CategoryFormModal({ open, onOpenChange, workspace, initial }: CategoryFormModalProps) {
  const isEdit = !!initial;
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: { name: initial?.name ?? '', color: initial?.color ?? PALETTE[0] },
  });
  const create = useCreateCategory();
  const update = useUpdateCategory();

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (isEdit) await update.mutateAsync({ id: initial!.id, ...values });
      else await create.mutateAsync({ workspace, ...values });
      toast.success(isEdit ? '분류가 수정되었어요' : '분류가 생성되었어요');
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message ?? '저장 실패');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      {/* ... overlay / content / 풀스크린 + 카드 / 폼 / 8색 swatch / 저장 버튼 */}
    </Dialog.Root>
  );
}
```

## 검증 과정

- [ ] `apps/web/src/components/modals/CategoryFormModal.tsx` 파일 존재
- [ ] `'use client'` 디렉티브
- [ ] `CategoryFormSchema` 사용 (task 02)
- [ ] Radix Dialog `modal={true}` + 풀스크린 모바일 / 카드 데스크톱
- [ ] 8색 swatch UI + 자유 입력 금지 (input type=color 미사용)
- [ ] 생성·수정 분기 (`initial` 존재 여부)
- [ ] `useCreateCategory` / `useUpdateCategory` (Sub-01) 호출
- [ ] 성공 시 토스트 + 닫기
- [ ] `pnpm --filter @todo-list/web typecheck` 통과

## 주의사항

1. **색상 자유 입력 금지** — 디자인 시스템 팔레트 8색 안에서만 (sub-prd §주의사항 2). HTML `<input type="color">` 사용 금지.
2. **생성·수정 단일 컴포넌트** — `initial` 유무로 분기. 별도 EditModal 분리 금지 (코드 중복 방지).
3. **mutation 호출 주체는 apps/web** — `packages/ui` 가 아닌 apps/web 의 모달이므로 react-query 훅 직접 import 허용 (sub-prd §위험과 완화 "react-query 의존").
4. **workspace prop 의무** — 생성 모드일 때 service 가 `workspace` 컬럼을 채우려면 컨텍스트 필요. 페이지(task 09) 가 props 로 주입.
5. **PALETTE 토큰 출처** — 8색 hex 는 디자인 시스템 (`docs/base/design-system/tokens`) 의 카테고리 팔레트 대응. 임의 hex 사용 금지.
6. **ESC / overlay 닫기 의무** — Radix 기본 유지 (sub-prd §주의사항 1).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) — categories CRUD
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §3 분류 관리, §주의사항 1·2·3
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useCreateCategory` / `useUpdateCategory`
