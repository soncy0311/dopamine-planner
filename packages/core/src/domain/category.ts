import type { Database } from '@todo-list/shared/database';

export type CategoryRow = Database['public']['Tables']['category']['Row'];
export type CategoryInsert = Database['public']['Tables']['category']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['category']['Update'];

export type Workspace = Database['public']['Enums']['workspace'];

export interface Category {
  id: string;
  userId: string;
  workspace: Workspace;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoryView = Category;

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    userId: row.user_id,
    workspace: row.workspace,
    name: row.name,
    color: row.color ?? '',
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
