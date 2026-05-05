import type { Database } from '@todo-list/shared/database';

export type EpicRow = Database['public']['Tables']['epic_issue']['Row'];
export type EpicInsert = Database['public']['Tables']['epic_issue']['Insert'];
export type EpicUpdate = Database['public']['Tables']['epic_issue']['Update'];

export type EpicView = EpicRow;
