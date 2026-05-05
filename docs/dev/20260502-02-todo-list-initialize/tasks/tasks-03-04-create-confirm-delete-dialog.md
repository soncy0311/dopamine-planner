# TASK-03-04: `ConfirmDeleteDialog` 공용 confirm 모달

## 기본 정보

- **Sub-PRD**: [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md)
- **작업 번호**: 04
- **상태**: 대기중
- **의존성**: 01 (@radix-ui/react-dialog 설치 완료)

## 작업 목표

투두·분류·Epic 삭제 전 사용자 확인을 받는 공용 confirm 모달을 신설한다. 모든 삭제 진입점 (TodoDetailModal / 분류 페이지 / Epic 페이지) 이 본 컴포넌트를 재사용한다.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/web/src/components/modals/ConfirmDeleteDialog.tsx` | 신설 | `<ConfirmDeleteDialog>` 컴포넌트 |

### Props 시그니처

```tsx
type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;          // 예: '이 분류를 삭제할까요?'
  description?: string;   // 예: '이 작업은 되돌릴 수 없어요.'
  confirmLabel?: string;  // 기본값 '삭제'
  cancelLabel?: string;   // 기본값 '취소'
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};
```

### 구현 세부사항

- 파일 상단 `'use client'`
- Radix Dialog (`@radix-ui/react-dialog`) 의 `Dialog.Root` / `Dialog.Portal` / `Dialog.Overlay` / `Dialog.Content` 조립
- `modal={true}` 명시 (sub-prd §주의사항 1) — ESC / overlay 클릭으로 닫기 동작
- 데스크톱: `sm:max-w-sm sm:rounded-lg` 카드 레이아웃 / 모바일: 풀스크린 (sub-prd §주의사항 3)
- 확인 버튼은 `bg-destructive text-destructive-foreground` (디자인 시스템 토큰)
- 확인 클릭 → `onConfirm()` 호출 → 호출 측에서 `onOpenChange(false)` 까지 책임 (본 컴포넌트는 자동 닫기 안 함, mutation 성공 후에만 닫도록 호출 측 제어)
- `loading` true 면 confirm 버튼 disabled + 스피너

### 참조 코드 (Radix Dialog 패턴)

```tsx
'use client';
import * as Dialog from '@radix-ui/react-dialog';

export function ConfirmDeleteDialog({
  open, onOpenChange, title, description,
  confirmLabel = '삭제', cancelLabel = '취소',
  onConfirm, loading,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content
          className="fixed inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm sm:rounded-lg bg-background p-6"
        >
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          {description && <Dialog.Description className="mt-2 text-sm text-muted-foreground">{description}</Dialog.Description>}
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close className="px-4 py-2 rounded">{cancelLabel}</Dialog.Close>
            <button
              className="px-4 py-2 rounded bg-destructive text-destructive-foreground disabled:opacity-50"
              disabled={loading}
              onClick={() => onConfirm()}
            >
              {loading ? '처리 중…' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## 검증 과정

- [ ] `apps/web/src/components/modals/ConfirmDeleteDialog.tsx` 파일 존재
- [ ] `'use client'` 디렉티브
- [ ] Radix `Dialog.Root` 의 `modal={true}` 명시
- [ ] 모바일 풀스크린 + 데스크톱 카드 (`sm:max-w-sm sm:rounded-lg`)
- [ ] confirm 버튼 destructive 톤
- [ ] `loading` 상태 시 disabled + 한글 처리 중 라벨
- [ ] `pnpm --filter @todo-list/web typecheck` 통과

## 주의사항

1. **자동 닫기 금지** — `onConfirm` 후 mutation 성공/실패 분기 책임은 호출 측. 본 컴포넌트는 닫기 의무 없음 (호출 측이 `onOpenChange(false)` 호출).
2. **ESC / overlay 닫기 의무** — Radix 기본 동작 유지. `onPointerDownOutside` / `onEscapeKeyDown` 막지 말 것 (sub-prd §주의사항 1).
3. **풀스크린 모바일** — `sm:` breakpoint 미만에서 `inset-0` 이 풀스크린을 만든다. p-6 패딩 유지.
4. **destructive 토큰** — `bg-destructive` 는 `packages/config` Tailwind preset 의 디자인 토큰 (`docs/base/design-system/`). 자유 색상 금지.
5. **본 컴포넌트의 Sub-03 외 의존자** — 향후 다른 sub 에서도 재사용 가능한 공용 컴포넌트. 도메인 종속 텍스트는 props 주입.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-03-feat-web-management.md`](../sub-prd-03-feat-web-management.md) §주의사항 1, 3
- `docs/base/design-system/` — destructive / 모달 패턴 토큰
