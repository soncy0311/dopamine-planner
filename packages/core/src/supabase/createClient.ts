import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@todo-list/shared/database';

export type StorageAdapter = {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
};

export type CreateClientOptions = {
  url: string;
  publishableKey: string;
  storage: StorageAdapter;
};

export function createClient(opts: CreateClientOptions): SupabaseClient<Database> {
  return createSupabaseClient<Database>(opts.url, opts.publishableKey, {
    auth: { storage: opts.storage as any, persistSession: true, autoRefreshToken: true },
  });
}
