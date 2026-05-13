import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { AppSupabaseClient } from '../supabase/types';
import { carryOverTodos } from '../services/carryOver';
import { categoryService } from '../services/category';
import { recalcEpicProgress } from '../services/epicProgress';

const deleteCategoryDetachSql = readFileSync(
  new URL(
    '../../../../supabase/migrations/015_delete_category_detach_epics_rpc.sql',
    import.meta.url,
  ),
  'utf8',
);
const categorySetNullSql = readFileSync(
  new URL(
    '../../../../supabase/migrations/014_category_nullable_set_null.sql',
    import.meta.url,
  ),
  'utf8',
);

function clientWithRpc(result: { data: unknown; error: unknown }) {
  return {
    rpc: vi.fn(async () => result),
  } as unknown as AppSupabaseClient;
}

describe('carryOverTodos', () => {
  it('단일 row 배열 첫 항목의 moved_count 를 추출한다', async () => {
    const client = clientWithRpc({ data: [{ moved_count: 7 }], error: null });
    await expect(carryOverTodos(client, '2026-05-05')).resolves.toBe(7);
  });

  it('빈 배열은 0 으로 fallback', async () => {
    const client = clientWithRpc({ data: [], error: null });
    await expect(carryOverTodos(client, '2026-05-05')).resolves.toBe(0);
  });

  it('null 데이터도 0 으로 fallback', async () => {
    const client = clientWithRpc({ data: null, error: null });
    await expect(carryOverTodos(client, '2026-05-05')).resolves.toBe(0);
  });

  it('error 발생 시 throw', async () => {
    const client = clientWithRpc({ data: null, error: new Error('boom') });
    await expect(carryOverTodos(client, '2026-05-05')).rejects.toThrow('boom');
  });
});

describe('recalcEpicProgress', () => {
  it('단일 row 배열 첫 항목의 progress 를 추출한다', async () => {
    const client = clientWithRpc({ data: [{ progress: 42 }], error: null });
    await expect(recalcEpicProgress(client, 'ep-1')).resolves.toBe(42);
  });

  it('빈 배열은 0 으로 fallback', async () => {
    const client = clientWithRpc({ data: [], error: null });
    await expect(recalcEpicProgress(client, 'ep-1')).resolves.toBe(0);
  });
});

describe('categoryService.remove', () => {
  it('delete_category_detach_epics RPC 로 category 삭제를 위임한다', async () => {
    const client = clientWithRpc({ data: null, error: null });
    await expect(categoryService.remove(client, 'cat-1')).resolves.toBeUndefined();
    expect(client.rpc).toHaveBeenCalledWith('delete_category_detach_epics', {
      p_category_id: 'cat-1',
    });
  });

  it('RPC error 발생 시 throw', async () => {
    const client = clientWithRpc({ data: null, error: new Error('forbidden') });
    await expect(categoryService.remove(client, 'cat-1')).rejects.toThrow('forbidden');
  });

  it('DB migration 이 Epic 을 먼저 null 로 detach 한 뒤 category row 만 삭제한다', () => {
    expect(categorySetNullSql).toContain('alter column category_id drop not null');
    expect(categorySetNullSql).toContain('on delete set null');
    expect(deleteCategoryDetachSql).toContain('security definer');
    expect(deleteCategoryDetachSql).toContain('set category_id = null');
    expect(deleteCategoryDetachSql).toContain('and user_id = auth.uid()');
    expect(deleteCategoryDetachSql.indexOf('set category_id = null')).toBeLessThan(
      deleteCategoryDetachSql.indexOf('delete from public.category'),
    );
  });

  it('DB migration 이 미인증/타 사용자 category 삭제를 차단한다', () => {
    expect(deleteCategoryDetachSql).toContain('requires an authenticated user');
    expect(deleteCategoryDetachSql).toContain('v_user_id <> auth.uid()');
    expect(deleteCategoryDetachSql).toContain('category does not belong to current user');
    expect(deleteCategoryDetachSql).toContain(
      'grant execute on function public.delete_category_detach_epics(uuid) to authenticated',
    );
  });
});
