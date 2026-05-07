import { describe, it, expect } from 'vitest';
import { mapCategoryRow, type CategoryRow } from '../domain/category';
import { mapEpicRow, type EpicRow } from '../domain/epic';
import { mapSubIssueRow, mapTodoDailyView, type TodoRow } from '../domain/todo';

const categoryRow: CategoryRow = {
  id: 'cat-1',
  user_id: 'u-1',
  workspace: 'life',
  name: '집안일',
  color: '#ff0000',
  sort_order: 1,
  created_at: '2026-05-05T00:00:00Z',
  updated_at: '2026-05-05T00:00:00Z',
};

const epicRow: EpicRow = {
  id: 'ep-1',
  user_id: 'u-1',
  category_id: 'cat-1',
  title: '5월 정리',
  description: null,
  status: 'active',
  registered_date: null,
  completed_date: null,
  progress: 0,
  created_at: '2026-05-05T00:00:00Z',
  updated_at: '2026-05-05T00:00:00Z',
};

function todoRow(overrides: Partial<TodoRow> = {}): TodoRow {
  return {
    id: 't-1',
    user_id: 'u-1',
    epic_id: 'ep-1',
    title: '장보기',
    description: null,
    priority: 'medium',
    status: 'todo',
    registered_date: '2026-05-05',
    completed_date: null,
    carry_over_count: 0,
    created_at: '2026-05-05T00:00:00Z',
    updated_at: '2026-05-05T00:00:00Z',
    ...overrides,
  };
}

describe('mapCategoryRow', () => {
  it('snake_case row 를 camelCase Category 로 변환한다', () => {
    expect(mapCategoryRow(categoryRow)).toEqual({
      id: 'cat-1',
      userId: 'u-1',
      workspace: 'life',
      name: '집안일',
      color: '#ff0000',
      sortOrder: 1,
      createdAt: '2026-05-05T00:00:00Z',
      updatedAt: '2026-05-05T00:00:00Z',
    });
  });

  it('color null 인 경우 빈 문자열로 매핑한다', () => {
    expect(mapCategoryRow({ ...categoryRow, color: null }).color).toBe('');
  });
});

describe('mapEpicRow', () => {
  it('snake_case row 를 camelCase EpicIssue 로 변환한다', () => {
    expect(mapEpicRow(epicRow)).toEqual({
      id: 'ep-1',
      userId: 'u-1',
      categoryId: 'cat-1',
      title: '5월 정리',
      description: null,
      status: 'active',
      registeredDate: null,
      completedDate: null,
      progress: 0,
      createdAt: '2026-05-05T00:00:00Z',
      updatedAt: '2026-05-05T00:00:00Z',
    });
  });
});

describe('mapSubIssueRow', () => {
  it('snake_case row 를 camelCase SubIssue 로 변환한다', () => {
    const result = mapSubIssueRow(todoRow());
    expect(result.epicId).toBe('ep-1');
    expect(result.registeredDate).toBe('2026-05-05');
    expect(result.carryOverCount).toBe(0);
  });
});

describe('mapTodoDailyView', () => {
  it('status === "done" 만 done 배열로 분리한다', () => {
    const rows = [
      todoRow({ id: 't-1', status: 'todo' }),
      todoRow({ id: 't-2', status: 'done' }),
      todoRow({ id: 't-3', status: 'done' }),
    ];
    const view = mapTodoDailyView(rows, '2026-05-05');
    expect(view.date).toBe('2026-05-05');
    expect(view.done.map((s) => s.id)).toEqual(['t-2', 't-3']);
    expect(view.todo.map((s) => s.id)).toEqual(['t-1']);
  });

  it('nested epic + category JOIN 결과를 평탄화한다', () => {
    const rows = [
      {
        ...todoRow({ id: 't-1' }),
        epic: {
          id: 'ep-1',
          title: '5월 정리',
          progress: 0.5,
          category: { id: 'cat-1', name: '집안일', color: '#ff0000' },
        },
      },
    ];
    const view = mapTodoDailyView(rows, '2026-05-05');
    expect(view.todo[0]?.epic).toEqual({
      id: 'ep-1',
      title: '5월 정리',
      progress: 0.5,
    });
    expect(view.todo[0]?.category).toEqual({
      id: 'cat-1',
      name: '집안일',
      color: '#ff0000',
    });
  });
});
