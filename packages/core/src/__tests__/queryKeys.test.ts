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
  });

  it('epic_issue → epics prefix invalidate', () => {
    const qc = makeQc();
    invalidateByTable(qc, 'epic_issue');
    expect(qc.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['epics'] });
  });

  it('category → categories, epics, todos prefix invalidate', () => {
    const qc = makeQc();
    invalidateByTable(qc, 'category');
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['categories'],
    });
    expect(qc.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['epics'] });
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
