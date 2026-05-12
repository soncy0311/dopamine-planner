import { describe, it, expect, vi } from 'vitest';
import type { QueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateByTable } from '../queryKeys';

describe('queryKeys', () => {
  it('todos 헬퍼는 [tag, { workspace, date }] 튜플을 반환한다', () => {
    expect(queryKeys.todos('life', '2026-05-05')).toEqual([
      'todos',
      { workspace: 'life', date: '2026-05-05' },
    ]);
  });

  it('epics 헬퍼는 워크스페이스 키를 가진다', () => {
    expect(queryKeys.epics('work')).toEqual(['epics', { workspace: 'work' }]);
  });

  it('epicsByCategory 헬퍼는 categoryId 키를 가진다', () => {
    expect(queryKeys.epicsByCategory('cat-1')).toEqual([
      'epics',
      { categoryId: 'cat-1' },
    ]);
  });

  it('uncategorizedEpics 헬퍼는 workspace 와 null categoryId 키를 가진다', () => {
    expect(queryKeys.uncategorizedEpics('life')).toEqual([
      'epics',
      { workspace: 'life', categoryId: null },
    ]);
  });

  it('completedEpics 헬퍼는 완료 Epic 전용 namespace 를 가진다', () => {
    expect(queryKeys.completedEpics('work')).toEqual([
      'completedEpics',
      { workspace: 'work' },
    ]);
  });

  it('completedEpicsByCategoryPeriod 헬퍼는 분류와 월/일 필터를 key 에 포함한다', () => {
    expect(
      queryKeys.completedEpicsByCategoryPeriod(
        'work',
        'cat-1',
        'month',
        '2026-05',
      ),
    ).toEqual([
      'completedEpics',
      { workspace: 'work', categoryId: 'cat-1', mode: 'month', value: '2026-05' },
    ]);
  });

  it('calendarCompletedCounts 헬퍼는 월 단위 key 를 가진다', () => {
    expect(queryKeys.calendarCompletedCounts('life', '2026-05')).toEqual([
      'calendarCompletedCounts',
      { workspace: 'life', month: '2026-05' },
    ]);
  });

  it('categories 헬퍼는 워크스페이스 키를 가진다', () => {
    expect(queryKeys.categories('life')).toEqual([
      'categories',
      { workspace: 'life' },
    ]);
  });

  it('profile 헬퍼는 단일 토큰을 반환한다', () => {
    expect(queryKeys.profile()).toEqual(['profile']);
  });
});

describe('invalidateByTable', () => {
  function makeQc() {
    return {
      invalidateQueries: vi.fn(),
    } as unknown as QueryClient;
  }

  it('sub_issue → todos prefix invalidate', () => {
    const qc = makeQc();
    invalidateByTable(qc, 'sub_issue');
    expect(qc.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['todos'] });
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['completedEpics'],
    });
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['calendarCompletedCounts'],
    });
  });

  it('epic_issue → epics, completedEpics, calendarCompletedCounts prefix invalidate', () => {
    const qc = makeQc();
    invalidateByTable(qc, 'epic_issue');
    expect(qc.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['epics'] });
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['completedEpics'],
    });
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['calendarCompletedCounts'],
    });
  });

  it('category → categories, epics, completedEpics, calendarCompletedCounts, todos prefix invalidate', () => {
    const qc = makeQc();
    invalidateByTable(qc, 'category');
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['categories'],
    });
    expect(qc.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['epics'] });
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['completedEpics'],
    });
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['calendarCompletedCounts'],
    });
    expect(qc.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });

  it('profile → profile prefix invalidate', () => {
    const qc = makeQc();
    invalidateByTable(qc, 'profile');
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['profile'],
    });
  });
});
