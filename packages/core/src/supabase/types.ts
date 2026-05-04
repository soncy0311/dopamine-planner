import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@todo-list/shared/database';

export type AppSupabaseClient = SupabaseClient<Database>;
export type { Database };
