import type { Database } from '@todo-list/shared/database';

export type EpicRow = Database['public']['Tables']['epic']['Row'];
export type EpicInsert = Database['public']['Tables']['epic']['Insert'];
export type EpicUpdate = Database['public']['Tables']['epic']['Update'];

export type EpicView = EpicRow;
