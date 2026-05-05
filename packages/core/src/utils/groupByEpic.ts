import type { SubIssue, SubIssueWithJoins } from '../domain/todo';
import type { EpicIssue } from '../domain/epic';

export type GroupByEpicEntry<T extends SubIssue = SubIssueWithJoins> = {
  epic: EpicIssue;
  subs: T[];
};

export type GroupByEpicResult<T extends SubIssue = SubIssueWithJoins> = {
  epics: GroupByEpicEntry<T>[];
  standalone: T[];
};

export function groupByEpic<T extends SubIssue = SubIssueWithJoins>(
  todos: readonly T[],
  epics: readonly EpicIssue[],
): GroupByEpicResult<T> {
  const byEpic = new Map<string, T[]>();
  const standalone: T[] = [];

  for (const t of todos) {
    if (t.epicId) {
      const arr = byEpic.get(t.epicId) ?? [];
      arr.push(t);
      byEpic.set(t.epicId, arr);
    } else {
      standalone.push(t);
    }
  }

  return {
    epics: epics
      .filter((e) => byEpic.has(e.id))
      .map((e) => ({ epic: e, subs: byEpic.get(e.id) ?? [] })),
    standalone,
  };
}
