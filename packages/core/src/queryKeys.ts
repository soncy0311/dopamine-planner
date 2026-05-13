import type { QueryClient } from '@tanstack/react-query';
import type { Workspace } from './domain/category';

export type RealtimeTable = 'profile' | 'category' | 'epic_issue' | 'sub_issue';

export const queryKeys = {
  todos: (workspace: Workspace, date: string) =>
    ['todos', { workspace, date }] as const,
  epics: (workspace: Workspace) => ['epics', { workspace }] as const,
  epicsByCategory: (categoryId: string) =>
    ['epics', { categoryId }] as const,
  uncategorizedEpics: (workspace: Workspace) =>
    ['epics', { workspace, categoryId: null }] as const,
  completedEpics: (workspace: Workspace) =>
    ['completedEpics', { workspace }] as const,
  completedEpicsByCategoryPeriod: (
    workspace: Workspace,
    categoryId: string,
    mode: 'month' | 'day',
    value: string,
  ) => ['completedEpics', { workspace, categoryId, mode, value }] as const,
  calendarCompletedCounts: (workspace: Workspace, month: string) =>
    ['calendarCompletedCounts', { workspace, month }] as const,
  categories: (workspace: Workspace) =>
    ['categories', { workspace }] as const,
  profile: () => ['profile'] as const,
};

export function invalidateByTable(qc: QueryClient, table: RealtimeTable): void {
  switch (table) {
    case 'sub_issue':
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['completedEpics'] });
      qc.invalidateQueries({ queryKey: ['calendarCompletedCounts'] });
      return;
    case 'epic_issue':
      qc.invalidateQueries({ queryKey: ['epics'] });
      qc.invalidateQueries({ queryKey: ['completedEpics'] });
      qc.invalidateQueries({ queryKey: ['calendarCompletedCounts'] });
      return;
    case 'category':
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['epics'] });
      qc.invalidateQueries({ queryKey: ['completedEpics'] });
      qc.invalidateQueries({ queryKey: ['calendarCompletedCounts'] });
      qc.invalidateQueries({ queryKey: ['todos'] });
      return;
    case 'profile':
      qc.invalidateQueries({ queryKey: ['profile'] });
      return;
  }
}
