import type { Database } from '@todo-list/shared/database';

export type ProfileRow = Database['public']['Tables']['profile']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profile']['Update'];

export interface Profile {
  id: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
