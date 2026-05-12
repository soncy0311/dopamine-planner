import { describe, expect, it } from 'vitest';
import type { AppSupabaseClient } from '../supabase/types';
import {
  groupCompletedEpicsByCategory,
  type EpicIssue,
  type EpicRow,
} from '../domain/epic';
import type { Category } from '../domain/category';
import {
  countCompletedByDateForMonth,
  listCompletedByCategoryPeriod,
  listCompletedByWorkspace,
} from '../services/epic';

const baseEpicRow: EpicRow = {
  id: 'ep-1',
  user_id: 'u-1',
  category_id: 'cat-1',
  title: '완료 Epic',
  description: null,
  priority: 'medium',
  status: 'completed',
  registered_date: '2026-05-01',
  completed_date: '2026-05-05',
  progress: 1,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-05T00:00:00Z',
  workspace: 'life',
};

const baseCategory: Category = {
  id: 'cat-1',
  userId: 'u-1',
  workspace: 'life',
  name: '집안일',
  color: '#ff0000',
  sortOrder: 1,
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
};

function epic(overrides: Partial<EpicIssue> = {}): EpicIssue {
  return {
    id: 'ep-1',
    userId: 'u-1',
    categoryId: 'cat-1',
    workspace: 'life',
    title: '완료 Epic',
    description: null,
    priority: 'medium',
    status: 'completed',
    registeredDate: '2026-05-01',
    completedDate: '2026-05-05',
    progress: 1,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-05T00:00:00Z',
    ...overrides,
  };
}

function makeClient(rows: EpicRow[]) {
  type Filter =
    | { type: 'eq'; column: keyof EpicRow; value: unknown }
    | { type: 'notNull'; column: keyof EpicRow }
    | { type: 'gte'; column: keyof EpicRow; value: string }
    | { type: 'lt'; column: keyof EpicRow; value: string };

  const filters: Filter[] = [];
  const calls: string[] = [];

  const builder = {
    select: (columns: string) => {
      calls.push(`select:${columns}`);
      return builder;
    },
    eq: (column: keyof EpicRow, value: unknown) => {
      filters.push({ type: 'eq', column, value });
      return builder;
    },
    not: (column: keyof EpicRow, operator: string, value: unknown) => {
      if (operator === 'is' && value === null) {
        filters.push({ type: 'notNull', column });
      }
      return builder;
    },
    gte: (column: keyof EpicRow, value: string) => {
      filters.push({ type: 'gte', column, value });
      return builder;
    },
    lt: (column: keyof EpicRow, value: string) => {
      filters.push({ type: 'lt', column, value });
      return builder;
    },
    order: (column: keyof EpicRow) => {
      calls.push(`order:${String(column)}`);
      return builder;
    },
    then: (
      onFulfilled: (result: { data: EpicRow[]; error: null }) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => {
      const data = rows.filter((row) =>
        filters.every((filter) => {
          const value = row[filter.column];
          if (filter.type === 'eq') return value === filter.value;
          if (filter.type === 'notNull') return value !== null;
          if (filter.type === 'gte') return typeof value === 'string' && value >= filter.value;
          if (filter.type === 'lt') return typeof value === 'string' && value < filter.value;
          return true;
        }),
      );
      return Promise.resolve({ data, error: null }).then(onFulfilled, onRejected);
    },
  };

  const client = {
    from: (table: string) => {
      calls.push(`from:${table}`);
      return builder;
    },
  } as unknown as AppSupabaseClient;

  return { client, calls };
}

describe('completed Epic archive service', () => {
  it('status completed 이고 completed_date 가 있는 Epic 만 반환한다', async () => {
    const { client } = makeClient([
      baseEpicRow,
      {
        ...baseEpicRow,
        id: 'active-null',
        status: 'active',
        completed_date: null,
      },
      {
        ...baseEpicRow,
        id: 'completed-null',
        completed_date: null,
      },
      {
        ...baseEpicRow,
        id: 'other-workspace',
        workspace: 'work',
      },
    ]);

    const result = await listCompletedByWorkspace(client, 'life');

    expect(result.map((item) => item.id)).toEqual(['ep-1']);
  });

  it('월 단위 batch 결과를 날짜별 count map 으로 만든다', async () => {
    const { client, calls } = makeClient([
      baseEpicRow,
      { ...baseEpicRow, id: 'ep-2', completed_date: '2026-05-05' },
      { ...baseEpicRow, id: 'ep-3', completed_date: '2026-05-06' },
      { ...baseEpicRow, id: 'active-null', status: 'active', completed_date: null },
      { ...baseEpicRow, id: 'next-month', completed_date: '2026-06-01' },
    ]);

    const result = await countCompletedByDateForMonth(client, 'life', '2026-05');

    expect(calls).toContain('select:completed_date');
    expect(result).toEqual({
      '2026-05-05': 2,
      '2026-05-06': 1,
    });
  });

  it('선택 분류의 완료 Epic 을 월별로 조회한다', async () => {
    const { client } = makeClient([
      baseEpicRow,
      { ...baseEpicRow, id: 'cat-1-next-day', completed_date: '2026-05-06' },
      { ...baseEpicRow, id: 'cat-2', category_id: 'cat-2' },
      { ...baseEpicRow, id: 'next-month', completed_date: '2026-06-01' },
      { ...baseEpicRow, id: 'active-null', status: 'active', completed_date: null },
    ]);

    const result = await listCompletedByCategoryPeriod(client, 'life', 'cat-1', {
      mode: 'month',
      value: '2026-05',
    });

    expect(result.map((item) => item.id)).toEqual(['ep-1', 'cat-1-next-day']);
  });

  it('선택 분류의 완료 Epic 을 일별로 조회한다', async () => {
    const { client } = makeClient([
      baseEpicRow,
      { ...baseEpicRow, id: 'same-category-next-day', completed_date: '2026-05-06' },
      { ...baseEpicRow, id: 'other-category', category_id: 'cat-2' },
    ]);

    const result = await listCompletedByCategoryPeriod(client, 'life', 'cat-1', {
      mode: 'day',
      value: '2026-05-05',
    });

    expect(result.map((item) => item.id)).toEqual(['ep-1']);
  });
});

describe('groupCompletedEpicsByCategory', () => {
  it('category sortOrder 를 따르고 분류 없음 group 을 마지막에 둔다', () => {
    const groups = groupCompletedEpicsByCategory(
      [
        epic({ id: 'uncat', categoryId: null, title: '무분류' }),
        epic({ id: 'cat-2-epic', categoryId: 'cat-2', title: '업무' }),
        epic({ id: 'active', categoryId: 'cat-1', status: 'active', completedDate: null }),
      ],
      [
        { ...baseCategory, id: 'cat-2', name: '업무', sortOrder: 2 },
        { ...baseCategory, id: 'cat-1', name: '생활', sortOrder: 1 },
      ],
    );

    expect(groups.map((group) => group.categoryName)).toEqual([
      '생활',
      '업무',
      '분류 없음',
    ]);
    expect(groups[0].epics).toHaveLength(0);
    expect(groups[1].epics.map((item) => item.id)).toEqual(['cat-2-epic']);
    expect(groups[2]).toMatchObject({
      categoryId: null,
      categoryName: '분류 없음',
    });
    expect(groups[2].epics.map((item) => item.id)).toEqual(['uncat']);
  });
});
