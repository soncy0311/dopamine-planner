import type { Database } from '@todo-list/shared/database';

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
