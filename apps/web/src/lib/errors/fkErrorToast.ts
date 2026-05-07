import { toast } from 'sonner';

type Pgish = { code?: string; message?: string };

export function showFkOrDefaultError(err: unknown, fkMessage: string) {
  const e = err as Pgish;
  if (e?.code === '23503') {
    toast.error(fkMessage);
    return;
  }
  toast.error(e?.message ?? '작업 실패');
}
