import { describe, it, expect, vi } from 'vitest';
import type { AppSupabaseClient } from '../supabase/types';
import { cascadeToggleEpic } from '../services/todo';

type FromCall = {
  table: string;
  payload: { status: string; completed_date: string | null };
  id: string;
};

function makeClient(): { client: AppSupabaseClient; calls: FromCall[]; rpc: ReturnType<typeof vi.fn> } {
  const calls: FromCall[] = [];
  const rpc = vi.fn(async () => ({ data: [{ progress: 1 }], error: null }));

  const client = {
    rpc,
    from: (table: string) => ({
      update: (payload: FromCall['payload']) => ({
        eq: (_col: string, id: string) => ({
          select: () => ({
            single: async () => {
              calls.push({ table, payload, id });
              return {
                data: {
                  id,
                  user_id: 'u-1',
                  epic_id: 'ep-1',
                  title: `t-${id}`,
                  description: null,
                  priority: 'normal',
                  status: payload.status,
                  registered_date: '2026-05-06',
                  completed_date: payload.completed_date,
                  carry_over_count: 0,
                  created_at: '2026-05-06T00:00:00Z',
                  updated_at: '2026-05-06T00:00:00Z',
                },
                error: null,
              };
            },
          }),
        }),
      }),
    }),
  } as unknown as AppSupabaseClient;

  return { client, calls, rpc };
}

describe('cascadeToggleEpic', () => {
  it('이미 target 상태인 sub 는 toggle 호출에서 제외된다', async () => {
    const { client, calls, rpc } = makeClient();

    await cascadeToggleEpic(
      client,
      { id: 'ep-1' },
      [
        { id: 's-1', status: 'todo' },
        { id: 's-2', status: 'done' },
        { id: 's-3', status: 'todo' },
      ],
      'done',
    );

    expect(calls).toHaveLength(2);
    expect(calls.map((c) => c.id).sort()).toEqual(['s-1', 's-3']);
    expect(calls.every((c) => c.payload.status === 'done')).toBe(true);
    expect(calls.every((c) => c.payload.completed_date !== null)).toBe(true);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('recalc_epic_progress', { epic_id: 'ep-1' });
  });

  it('target = todo 일 때 completed_date 가 null 로 패치된다', async () => {
    const { client, calls } = makeClient();

    await cascadeToggleEpic(
      client,
      { id: 'ep-2' },
      [
        { id: 's-1', status: 'done' },
        { id: 's-2', status: 'done' },
      ],
      'todo',
    );

    expect(calls).toHaveLength(2);
    expect(calls.every((c) => c.payload.status === 'todo')).toBe(true);
    expect(calls.every((c) => c.payload.completed_date === null)).toBe(true);
  });

  it('모든 sub 가 이미 target 이면 toggle 호출 0회, RPC 1회', async () => {
    const { client, calls, rpc } = makeClient();

    await cascadeToggleEpic(
      client,
      { id: 'ep-3' },
      [
        { id: 's-1', status: 'done' },
        { id: 's-2', status: 'done' },
      ],
      'done',
    );

    expect(calls).toHaveLength(0);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
