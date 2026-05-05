# TASK-03-09: 분류 관리 페이지 묶음 (`/life/categories` + `/work/categories`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 09
- **상태**: 대기중
- **의존성**: 04 (ConfirmDeleteDialog), 05 (CategoryFormModal), 03 (FK toast helper)

## 작업 목표

워크스페이스별 분류 관리 페이지 2 종을 신설한다. 두 페이지는 동일 패턴의 얇은 wrapper 이며, `<CategoriesView workspace="life" />` 같은 공용 뷰를 두 페이지가 import 하는 구조로 중복을 최소화한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/CategoriesView.tsx` | 신설 | 워크스페이스 분류 리스트 뷰 (공용) |
| `apps/web/src/app/(main)/life/categories/page.tsx` | 신설 | `<CategoriesView workspace="life" />` |
| `apps/web/src/app/(main)/work/categories/page.tsx` | 신설 | `<CategoriesView workspace="work" />` |

### 구현 세부사항

#### `CategoriesView.tsx`

- 파일 상단 `'use client'`
- props: `{ workspace: 'life' | 'work' }`
- 데이터: `useCategories(workspace)` (Sub-01)
- 렌더:
  - 헤더: "분류 관리 (라이프|워크)" + "분류 추가" 버튼
  - 리스트: `sort_order` 순 (서비스단에서 정렬됨), 각 row 에 색 swatch + 이름 + 수정·삭제 아이콘
  - 빈 상태 메시지
- 인터랙션:
  - "분류 추가" → `<CategoryFormModal workspace={workspace} />` open (생성 모드)
  - 수정 아이콘 → `<CategoryFormModal initial={...} />` open (수정 모드)
  - 삭제 아이콘 → `<ConfirmDeleteDialog>` open → confirm 시 `useDeleteCategory(id)` mutation
- 삭제 mutation `onError` 에서 `showFkOrDefaultError(err, '이 분류에 Epic 이 있어 삭제할 수 없어요. 먼저 Epic 을 정리해주세요.')` 호출 (task 03)

#### 페이지 wrappers

```tsx
// apps/web/src/app/(main)/life/categories/page.tsx
'use client';
import { CategoriesView } from '@/components/CategoriesView';
export default function Page() {
  return <CategoriesView workspace="life" />;
}
```

`/work/categories/page.tsx` 도 동일 (`workspace="work"`).

### 참조 코드 골격

```tsx
'use client';
import { useState } from 'react';
import { useCategories, useDeleteCategory } from '@todo-list/core';
import { CategoryFormModal } from './modals/CategoryFormModal';
import { ConfirmDeleteDialog } from './modals/ConfirmDeleteDialog';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';
import { toast } from 'sonner';

export function CategoriesView({ workspace }: { workspace: 'life' | 'work' }) {
  const { data: categories } = useCategories(workspace);
  const remove = useDeleteCategory();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; color: string } | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      toast.success('삭제되었어요');
      setDeleteId(null);
    } catch (err) {
      showFkOrDefaultError(err, '이 분류에 Epic 이 있어 삭제할 수 없어요. 먼저 Epic 을 정리해주세요.');
    }
  };

  return (
    <div className="p-4">
      {/* 헤더 + 분류 추가 버튼 → setFormOpen(true), setEditing(undefined) */}
      {/* 리스트: categories?.map(c => row) */}
      <CategoryFormModal open={formOpen} onOpenChange={setFormOpen} workspace={workspace} initial={editing} />
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="이 분류를 삭제할까요?"
        onConfirm={onDelete}
        loading={remove.isPending}
      />
    </div>
  );
}
```

## 검증 과정

- [ ] `apps/web/src/components/CategoriesView.tsx` 파일 존재
- [ ] `apps/web/src/app/(main)/life/categories/page.tsx` 신설 + `<CategoriesView workspace="life" />`
- [ ] `apps/web/src/app/(main)/work/categories/page.tsx` 신설 + `<CategoriesView workspace="work" />`
- [ ] 두 페이지 모두 `'use client'` + 동적 라우트 미사용 (`output: 'export'` 호환)
- [ ] `useCategories(workspace)` 호출
- [ ] 추가/수정/삭제 3 인터랙션 연결
- [ ] 삭제 mutation `onError` 가 `showFkOrDefaultError` 사용 (task 03)
- [ ] `pnpm --filter @todo-list/web typecheck` 통과
- [ ] `pnpm --filter @todo-list/web build` 통과 (export 정합)

## 주의사항

1. **`output: 'export'` 호환** — 두 페이지 모두 동적 세그먼트 미사용. 정적 export 가능.
2. **두 페이지 중복 최소화** — `CategoriesView` 공용 컴포넌트로 추출. 페이지는 wrapper 만.
3. **FK 23503 친화 토스트 의무** — `showFkOrDefaultError` 만 사용. inline 분기 금지 (sub-prd §주의사항 4).
4. **수정 모드 진입** — 한 row 의 수정 클릭 시 `setEditing(c)` + `setFormOpen(true)` 동시. 모달 닫힐 때 `setEditing(undefined)` 정리.
5. **sort_order 신뢰** — `useCategories` 의 결과는 이미 sort_order 정렬 (Sub-01 의 service 책임). 본 뷰에서 재정렬 금지.
6. **mutation 호출 주체는 apps/web** — react-query 훅 직접 import 허용.
7. **컴포넌트 위치** — `apps/web/src/components/CategoriesView.tsx` (modals/ 가 아님 — 페이지 뷰).

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) — categories CRUD
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §3 분류 관리, §주의사항 4
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useCategories` / `useDeleteCategory`
