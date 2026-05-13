import type { Category } from '../domain/category';
import type { EpicIssue, EpicRow } from '../domain/epic';

export const qaCategory: Category = {
  id: 'qa-cat-life',
  userId: 'qa-user',
  workspace: 'life',
  name: 'QA 분류',
  color: '#7C3AED',
  sortOrder: 1,
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
};

export const qaEpicRow: EpicRow = {
  id: 'qa-epic',
  user_id: 'qa-user',
  category_id: qaCategory.id,
  workspace: 'life',
  title: 'QA Epic',
  description: null,
  priority: 'medium',
  status: 'active',
  registered_date: '2026-05-01',
  completed_date: null,
  progress: 0,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

export function qaEpic(overrides: Partial<EpicIssue> = {}): EpicIssue {
  return {
    id: 'qa-epic',
    userId: 'qa-user',
    categoryId: qaCategory.id,
    workspace: 'life',
    title: 'QA Epic',
    description: null,
    priority: 'medium',
    status: 'active',
    registeredDate: '2026-05-01',
    completedDate: null,
    progress: 0,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    ...overrides,
  };
}

export const qaCalendarCountCases = {
  none: { date: '2026-05-01', count: 0 },
  one: { date: '2026-05-02', count: 1 },
  four: { date: '2026-05-03', count: 4 },
  five: { date: '2026-05-04', count: 5 },
  six: { date: '2026-05-05', count: 6 },
  ten: { date: '2026-05-06', count: 10 },
} as const;
