'use client';

import * as Dialog from '@radix-ui/react-dialog';

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '삭제',
  cancelLabel = '취소',
  onConfirm,
  loading,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black-900/40" />
        <Dialog.Content className="fixed inset-0 bg-white p-6 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg">
          <Dialog.Title className="text-lg font-semibold text-black-900">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="mt-2 text-sm text-indigo-600">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close className="rounded-md px-4 py-2 text-sm text-black-900 hover:bg-gray-50">
              {cancelLabel}
            </Dialog.Close>
            <button
              type="button"
              className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
