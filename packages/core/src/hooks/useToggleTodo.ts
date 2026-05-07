import { useMemo } from 'react';
import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { todoService } from '../services/todo';
import { recalcEpicProgress } from '../services/epicProgress';
import type { SubIssue, TodoStatus } from '../domain/todo';

export type ToggleTodoInput = {
  id: string;
  epicId: string;
  nextStatus: TodoStatus;
};

type SnapshotEntry = readonly [readonly unknown[], unknown];
type ToggleContext = { snapshots: SnapshotEntry[] };

export type DebouncedFn<T> = (key: string, arg: T) => void;

export function debounceByEpic<T>(
  ms: number,
  fn: (arg: T) => void,
): DebouncedFn<T> {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  return (key: string, arg: T) => {
    const prev = timers.get(key);
    if (prev) clearTimeout(prev);
    const timer = setTimeout(() => {
      timers.delete(key);
      fn(arg);
    }, ms);
    timers.set(key, timer);
  };
}

function applyOptimisticStatus(
  qc: QueryClient,
  id: string,
  nextStatus: TodoStatus,
): SnapshotEntry[] {
  const snapshots: SnapshotEntry[] = [];
  const entries = qc.getQueriesData({ queryKey: ['todos'] });
  for (const [key, data] of entries) {
    snapshots.push([key, data]);
    if (!data || typeof data !== 'object') continue;
    const next = patchTodoData(data, id, nextStatus);
    if (next !== data) qc.setQueryData(key, next);
  }
  return snapshots;
}

function patchTodoData(
  data: unknown,
  id: string,
  nextStatus: TodoStatus,
): unknown {
  if (Array.isArray(data)) {
    let mutated = false;
    const next = data.map((item) => {
      if (
        item &&
        typeof item === 'object' &&
        (item as { id?: unknown }).id === id
      ) {
        mutated = true;
        return { ...(item as object), status: nextStatus };
      }
      return item;
    });
    return mutated ? next : data;
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    let changed = false;
    const out: Record<string, unknown> = { ...obj };
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (Array.isArray(v)) {
        const patched = patchTodoData(v, id, nextStatus);
        if (patched !== v) {
          out[k] = patched;
          changed = true;
        }
      }
    }
    return changed ? out : data;
  }
  return data;
}

export function useToggleTodo(
  client: AppSupabaseClient,
): UseMutationResult<SubIssue, Error, ToggleTodoInput, ToggleContext> {
  const qc = useQueryClient();
  const debouncedRecalc = useMemo(
    () =>
      debounceByEpic<string>(200, (epicId) => {
        recalcEpicProgress(client, epicId).catch((err) => {
          console.warn('[useToggleTodo] recalcEpicProgress failed:', err);
        });
      }),
    [client],
  );

  return useMutation<SubIssue, Error, ToggleTodoInput, ToggleContext>({
    mutationFn: (input) => todoService.toggle(client, input.id, input.nextStatus),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['todos'] });
      const snapshots = applyOptimisticStatus(qc, input.id, input.nextStatus);
      return { snapshots };
    },
    onError: (_err, _input, ctx) => {
      if (!ctx) return;
      for (const [key, data] of ctx.snapshots) {
        qc.setQueryData(key, data);
      }
    },
    onSuccess: (_data, input) => {
      debouncedRecalc(input.epicId, input.epicId);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['epics'] });
    },
  });
}
