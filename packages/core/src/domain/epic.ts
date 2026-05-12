import type { Database } from '@todo-list/shared/database';
import type { Category } from './category';

export type EpicRow = Database['public']['Tables']['epic_issue']['Row'];
export type EpicInsert = Database['public']['Tables']['epic_issue']['Insert'];
export type EpicUpdate = Database['public']['Tables']['epic_issue']['Update'];

export type EpicStatus = Database['public']['Enums']['epic_status'];
export type Priority = Database['public']['Enums']['priority'];

export interface EpicIssue {
  id: string;
  userId: string;
  categoryId: string | null;
  workspace: Database['public']['Enums']['workspace'];
  title: string;
  description: string | null;
  priority: Priority;
  status: EpicStatus;
  registeredDate: string | null;
  completedDate: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export type EpicView = EpicIssue;

export type CompletedEpicArchiveGroup = {
  categoryId: string | null;
  categoryName: string;
  categoryColor: string | null;
  epics: EpicIssue[];
};

export const UNCATEGORIZED_CATEGORY_NAME = '분류 없음';
export const UNCATEGORIZED_CATEGORY_COLOR = '#9CA3AF';

export function mapEpicRow(row: EpicRow): EpicIssue {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    workspace: row.workspace,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    registeredDate: row.registered_date,
    completedDate: row.completed_date,
    progress: row.progress,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function groupCompletedEpicsByCategory(
  epics: readonly EpicIssue[],
  categories: readonly Category[],
): CompletedEpicArchiveGroup[] {
  const completed = epics.filter(
    (epic) => epic.status === 'completed' && epic.completedDate !== null,
  );
  const epicsByCategory = new Map<string, EpicIssue[]>();
  const uncategorized: EpicIssue[] = [];

  for (const epic of completed) {
    if (epic.categoryId === null) {
      uncategorized.push(epic);
      continue;
    }
    const bucket = epicsByCategory.get(epic.categoryId) ?? [];
    bucket.push(epic);
    epicsByCategory.set(epic.categoryId, bucket);
  }

  const sortEpics = (items: EpicIssue[]) =>
    [...items].sort((a, b) => {
      const aDate = a.completedDate ?? '';
      const bDate = b.completedDate ?? '';
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return a.title.localeCompare(b.title);
    });

  const categoryGroups = [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      categoryColor: category.color || null,
      epics: sortEpics(epicsByCategory.get(category.id) ?? []),
    }));

  return [
    ...categoryGroups,
    {
      categoryId: null,
      categoryName: UNCATEGORIZED_CATEGORY_NAME,
      categoryColor: UNCATEGORIZED_CATEGORY_COLOR,
      epics: sortEpics(uncategorized),
    },
  ];
}
