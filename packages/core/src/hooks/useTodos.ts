import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AppSupabaseClient } from '../supabase/types';
import { todoService } from '../services/todo';
import type { TodoDailyView } from '../domain/todo';
import type { Workspace } from '../domain/category';
import { queryKeys } from '../queryKeys';

export type UseTodosArgs = {
  client: AppSupabaseClient;
  workspace: Workspace;
  date: string;
};

export function useTodos(args: UseTodosArgs): UseQueryResult<TodoDailyView> {
  const { client, workspace, date } = args;
  // 자동 이월 (carryOverTodos) 은 사용자가 sub 의 등록일을 수동으로 과거 날짜로 옮긴
  // 경우에도 그 sub 를 오늘로 다시 끌어오는 부작용이 있어 비활성화한다.
  // 진행 중 sub 는 사용자가 지정한 등록일에 그대로 머물러야 한다 (sub-prd-10 §일자 뷰 정합).
  return useQuery<TodoDailyView>({
    queryKey: queryKeys.todos(workspace, date),
    queryFn: () => todoService.listByDate(client, workspace, date),
  });
}
