import type { Database } from '@todo-list/shared/database';
import type { Category } from './category';
import type { EpicIssue } from './epic';

export type TodoRow = Database['public']['Tables']['sub_issue']['Row'];
export type TodoInsert = Database['public']['Tables']['sub_issue']['Insert'];
export type TodoUpdate = Database['public']['Tables']['sub_issue']['Update'];

export type TodoStatus = Database['public']['Enums']['todo_status'];
export type Priority = Database['public']['Enums']['priority'];

export interface SubIssue {
  id: string;
  userId: string;
  epicId: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TodoStatus;
  registeredDate: string | null;
  completedDate: string | null;
  carryOverCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TodoView = SubIssue;

export type SubIssueWithJoins = SubIssue & {
  epic: Pick<EpicIssue, 'id' | 'title' | 'progress'>;
  category: Pick<Category, 'id' | 'name' | 'color'>;
};

export interface TodoDailyView {
  date: string;
  done: SubIssueWithJoins[];
  todo: SubIssueWithJoins[];
}

type EpicJoinShape = {
  id: string;
  title: string;
  progress?: number | null;
  category?:
    | {
        id: string;
        name: string;
        color: string | null;
      }
    | null;
};

type SubIssueRowWithJoins = TodoRow & {
  epic?: EpicJoinShape | null;
  epic_issue?: EpicJoinShape | null;
};

export function mapSubIssueRow(row: TodoRow): SubIssue {
  return {
    id: row.id,
    userId: row.user_id,
    epicId: row.epic_id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    registeredDate: row.registered_date,
    completedDate: row.completed_date,
    carryOverCount: row.carry_over_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function flattenJoined(row: SubIssueRowWithJoins): SubIssueWithJoins {
  const base = mapSubIssueRow(row);
  const epicJoin = row.epic ?? row.epic_issue ?? null;
  const cat = epicJoin?.category ?? null;
  return {
    ...base,
    epic: {
      id: epicJoin?.id ?? '',
      title: epicJoin?.title ?? '',
      progress: epicJoin?.progress ?? 0,
    },
    category: {
      id: cat?.id ?? '',
      name: cat?.name ?? '',
      color: cat?.color ?? '',
    },
  };
}

export function mapTodoDailyView(
  rows: readonly SubIssueRowWithJoins[],
  date: string,
): TodoDailyView {
  const done: SubIssueWithJoins[] = [];
  const todo: SubIssueWithJoins[] = [];
  for (const row of rows) {
    const view = flattenJoined(row);
    if (view.status === 'done') done.push(view);
    else todo.push(view);
  }
  return { date, done, todo };
}
