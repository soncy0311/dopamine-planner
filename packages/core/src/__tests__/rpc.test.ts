import { describe, it, expect, vi } from 'vitest';
import type { AppSupabaseClient } from '../supabase/types';
import { carryOverTodos } from '../services/carryOver';
import { categoryService } from '../services/category';
import { recalcEpicProgress } from '../services/epicProgress';

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
});
