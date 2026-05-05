# TASK-03-10: Epic 관리 페이지 묶음 (`/life/epics` + `/work/epics`)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 10
- **상태**: 대기중
- **의존성**: 04 (ConfirmDeleteDialog), 06 (EpicFormModal), 03 (FK toast helper)

## 작업 목표

워크스페이스별 Epic 관리 페이지 2 종을 신설한다. 분류별 그룹 리스트 + 진행률 세그먼트 + 메인 체크박스 일괄 토글 동작을 포함한다. 두 페이지는 공용 `<EpicsView>` 뷰의 wrapper.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/EpicsView.tsx` | 신설 | 워크스페이스 Epic 리스트 뷰 (공용) |
| `apps/web/src/app/(main)/life/epics/page.tsx` | 신설 | `<EpicsView workspace="life" />` |
| `apps/web/src/app/(main)/work/epics/page.tsx` | 신설 | `<EpicsView workspace="work" />` |

### 구현 세부사항

#### `EpicsView.tsx`

- 파일 상단 `'use client'`
- props: `{ workspace: 'life' | 'work' }`
- 데이터:
  - `useCategories(workspace)` — 그룹핑 헤더용
  - `useEpics({ workspace })` 또는 카테고리별 `useEpics(categoryId)` 다중 호출 (Sub-01 의 export 형태에 따라 결정 — 이미 일괄 조회 hook 가 있다면 우선 사용)
  - 각 Epic 의 진행률은 `epic_progress` view 또는 `useEpicProgress(epicId)` 일괄 훅
- 렌더:
  - 헤더: "Epic 관리 (라이프|워크)" + "Epic 추가" 버튼
  - 분류별 그룹 (collapsible 또는 단순 섹션)
  - 각 Epic row:
    - 메인 체크박스 (전체 Sub 일괄 토글 트리거)
    - 제목
    - 진행률 세그먼트 프로그레스바 (`<EpicProgressBar>` Sub-02 task 04 산출물)
    - 수정·삭제 아이콘
- 인터랙션:
  - "Epic 추가" → `<EpicFormModal workspace={workspace} />` open
  - 수정 → `<EpicFormModal initial={...} />` open
  - 삭제 → `<ConfirmDeleteDialog>` → `useDeleteEpic(id)`, FK 23503 → 친화 토스트
  - 메인 체크박스 토글 → `useToggleEpicAllSubs(epicId, nextStatus)` 또는 service 의 `from('sub_issue').update().in('id', subIds)` 단일 트랜잭션 (Sub-01 §일괄 토글)
- 삭제 mutation `onError` → `showFkOrDefaultError(err, 'Epic 에 하위 할 일이 있어 삭제할 수 없어요. 먼저 할 일을 정리해주세요.')`

### 참조 코드 골격

```tsx
'use client';
import { useState } from 'react';
import {
  useCategories, useEpics, useDeleteEpic, useToggleEpicAllSubs,
} from '@todo-list/core';
import { EpicFormModal } from './modals/EpicFormModal';
import { ConfirmDeleteDialog } from './modals/ConfirmDeleteDialog';
import { EpicProgressBar } from '@todo-list/ui';
import { showFkOrDefaultError } from '@/lib/errors/fkErrorToast';
import { toast } from 'sonner';

export function EpicsView({ workspace }: { workspace: 'life' | 'work' }) {
  const { data: categories } = useCategories(workspace);
  // 카테고리별로 useEpics 호출 또는 일괄 훅 사용
  const remove = useDeleteEpic();
  const toggleAll = useToggleEpicAllSubs();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EpicInitial | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      toast.success('삭제되었어요');
      setDeleteId(null);
    } catch (err) {
      showFkOrDefaultError(err, 'Epic 에 하위 할 일이 있어 삭제할 수 없어요. 먼저 할 일을 정리해주세요.');
    }
  };

  return (
    <div className="p-4">
      {/* 헤더 + Epic 추가 */}
      {/* categories?.map(c => <Group> <epics 리스트> </Group>) */}
      {/* 각 Epic row: [체크박스] [제목] [<EpicProgressBar />] [수정] [삭제] */}
      <EpicFormModal open={formOpen} onOpenChange={setFormOpen} workspace={workspace} initial={editing} />
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="이 Epic 을 삭제할까요?"
        onConfirm={onDelete}
        loading={remove.isPending}
      />
    </div>
  );
}
```

#### 페이지 wrappers

```tsx
// apps/web/src/app/(main)/life/epics/page.tsx
'use client';
import { EpicsView } from '@/components/EpicsView';
export default function Page() {
  return <EpicsView workspace="life" />;
}
```

## 검증 과정

- [ ] `apps/web/src/components/EpicsView.tsx` 파일 존재
- [ ] `/life/epics/page.tsx` + `/work/epics/page.tsx` 신설
- [ ] 두 페이지 모두 `'use client'` + 동적 라우트 미사용 (export 호환)
- [ ] 분류별 그룹 렌더
- [ ] `<EpicProgressBar>` (Sub-02 task 04) 사용
- [ ] 메인 체크박스 → 일괄 토글 호출
- [ ] 삭제 → ConfirmDeleteDialog → useDeleteEpic → FK 23503 친화 토스트
- [ ] 추가/수정 → EpicFormModal
- [ ] `pnpm --filter @todo-list/web typecheck` 통과
- [ ] `pnpm --filter @todo-list/web build` 통과 (export 정합)

## 주의사항

1. **일괄 토글 단일 트랜잭션** — sub-prd §주의사항 8 — `from('sub_issue').update().in('id', subIds)` 1회. 클라이언트 루프 update 금지. Sub-01 의 service 가 일괄 update 보장.
2. **진행률 표시 즉시 갱신** — 일괄 토글 후 `epic_progress` 캐시 invalidate (Sub-01 mutation hook 책임). 본 뷰에서 직접 invalidate 금지.
3. **FK 23503 친화 토스트 의무** — `showFkOrDefaultError` 사용 (sub-prd §주의사항 4).
4. **`output: 'export'` 호환** — 동적 세그먼트 미사용.
5. **`<EpicProgressBar>` 의존** — `packages/ui` 의 Sub-02 task 04 산출물. 미신설 상태이면 본 task 가 task 13 이전에 실행되지 않도록 의존 순서 주의.
6. **mutation 호출 주체는 apps/web** — react-query 훅 직접 import 허용.
7. **메인 체크박스의 indeterminate 상태** — 부분 완료 시 indeterminate 표시 권장. MVP 에서는 `완료/0%` 두 상태만이라도 OK.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../API_CONTRACT.md`](../API_CONTRACT.md) — epics CRUD / `epic_progress` / sub_issue 일괄 update
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §4 Epic 관리, §주의사항 4·8
- [`../sub-prd-01-feat-core-services.md`](../sub-prd-01-feat-core-services.md) — `useEpics` / `useDeleteEpic` / 일괄 토글 service / `useEpicProgress`
- [`../sub-prd-02-feat-web-main-view.md`](../sub-prd-02-feat-web-main-view.md) — `<EpicProgressBar>` (task 04)
