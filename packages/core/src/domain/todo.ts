import type { Database } from '@todo-list/shared/database';

export type TodoRow = Database['public']['Tables']['sub_issue']['Row'];
export type TodoInsert = Database['public']['Tables']['sub_issue']['Insert'];
export type TodoUpdate = Database['public']['Tables']['sub_issue']['Update'];

export type TodoView = TodoRow;
