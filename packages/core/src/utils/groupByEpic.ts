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
    // 워크스페이스의 모든 epic 을 항상 노출 (sub 0개여도 카드 자체는 보임).
    // 신규 생성한 epic 즉시 가시성 확보 + 일자 필터에 의해 epic 자체가 사라지는 UX 회피.
    epics: epics.map((e) => ({ epic: e, subs: byEpic.get(e.id) ?? [] })),
    standalone,
  };
}
