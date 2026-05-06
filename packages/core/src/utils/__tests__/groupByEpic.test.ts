import { describe, it, expect } from 'vitest';
import { groupByEpic } from '../groupByEpic';
import type { SubIssueWithJoins } from '../../domain/todo';
import type { EpicIssue } from '../../domain/epic';

function makeEpic(id: string, overrides: Partial<EpicIssue> = {}): EpicIssue {
  return {
    id,
    userId: 'u-1',
    categoryId: 'cat-1',
    title: `epic-${id}`,
    description: null,
    status: 'active',
    registeredDate: null,
    completedDate: null,
    progress: 0,
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    ...overrides,
  };
}

function makeTodo(
  id: string,
  epicId: string,
  overrides: Partial<SubIssueWithJoins> = {},
): SubIssueWithJoins {
  return {
    id,
    userId: 'u-1',
    epicId,
    title: `todo-${id}`,
    description: null,
    priority: 'normal',
    status: 'todo',
    registeredDate: '2026-05-06',
    completedDate: null,
    carryOverCount: 0,
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    epic: { id: epicId, title: `epic-${epicId}`, progress: 0 },
    category: { id: 'cat-1', name: '집안일', color: '#fff' },
    ...overrides,
  };
}

describe('groupByEpic', () => {
  it('빈 배열을 입력하면 빈 결과를 반환한다', () => {
    expect(groupByEpic([], [])).toEqual({ epics: [], standalone: [] });
  });

  it('epic 1개에 sub 다수가 매핑된다', () => {
    const epics = [makeEpic('e1')];
    const todos = [makeTodo('t1', 'e1'), makeTodo('t2', 'e1'), makeTodo('t3', 'e1')];
    const result = groupByEpic(todos, epics);
    expect(result.epics).toHaveLength(1);
    expect(result.epics[0].epic.id).toBe('e1');
    expect(result.epics[0].subs).toHaveLength(3);
    expect(result.standalone).toEqual([]);
  });

  it('epic 다수 + 각자 sub 가 분리된다', () => {
    const epics = [makeEpic('e1'), makeEpic('e2')];
    const todos = [
      makeTodo('t1', 'e1'),
      makeTodo('t2', 'e2'),
      makeTodo('t3', 'e1'),
      makeTodo('t4', 'e2'),
    ];
    const result = groupByEpic(todos, epics);
    expect(result.epics).toHaveLength(2);
    expect(result.epics[0].subs).toHaveLength(2);
    expect(result.epics[1].subs).toHaveLength(2);
  });

  it('epicId 가 빈 문자열인 todo 는 standalone 으로 분리된다', () => {
    const todos = [
      makeTodo('t1', ''),
      makeTodo('t2', ''),
      makeTodo('t3', ''),
      makeTodo('t4', ''),
      makeTodo('t5', ''),
    ];
    const result = groupByEpic(todos, []);
    expect(result.epics).toEqual([]);
    expect(result.standalone).toHaveLength(5);
  });

  it('epics 인자에 없는 epic 의 sub 는 결과에서 drop 된다 (orphan)', () => {
    const epics = [makeEpic('e1')];
    const todos = [makeTodo('t1', 'e1'), makeTodo('t-orphan', 'e-missing')];
    const result = groupByEpic(todos, epics);
    expect(result.epics).toHaveLength(1);
    expect(result.epics[0].subs.map((s) => s.id)).toEqual(['t1']);
    expect(result.standalone).toEqual([]);
  });

  it('subs 배열은 입력 todos 순서를 보존한다', () => {
    const epics = [makeEpic('e1')];
    const todos = [makeTodo('t3', 'e1'), makeTodo('t1', 'e1'), makeTodo('t2', 'e1')];
    const result = groupByEpic(todos, epics);
    expect(result.epics[0].subs.map((s) => s.id)).toEqual(['t3', 't1', 't2']);
  });
});
