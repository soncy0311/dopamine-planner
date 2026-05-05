import type { Database } from '@todo-list/shared/database';

export type CategoryRow = Database['public']['Tables']['category']['Row'];
export type CategoryInsert = Database['public']['Tables']['category']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['category']['Update'];

export type CategoryView = CategoryRow;
