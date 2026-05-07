import { useEffect } from 'react';
import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { todoService } from '../services/todo';
import type { TodoDailyView } from '../domain/todo';
import type { Workspace } from '../domain/category';
import { queryKeys } from '../queryKeys';
import { carryOverTodos } from '../services/carryOver';

export type UseTodosArgs = {
  client: AppSupabaseClient;
  workspace: Workspace;
  date: string;
};

function todayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useTodos(args: UseTodosArgs): UseQueryResult<TodoDailyView> {
  const { client, workspace, date } = args;
  const qc = useQueryClient();
  const query = useQuery<TodoDailyView>({
    queryKey: queryKeys.todos(workspace, date),
    queryFn: () => todoService.listByDate(client, workspace, date),
  });

  useEffect(() => {
    const today = todayLocal();
    if (date !== today) return;
    let cancelled = false;
    carryOverTodos(client, today)
      .then((moved) => {
        if (cancelled) return;
        if (moved > 0) {
          qc.invalidateQueries({ queryKey: queryKeys.todos(workspace, today) });
        }
      })
      .catch((err) => {
        console.warn('[useTodos] carryOverTodos failed:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [client, workspace, date, qc]);

  return query;
}
