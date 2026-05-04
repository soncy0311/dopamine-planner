import { createClient } from '@todo-list/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const browserStorage: any =
  typeof window !== 'undefined' ? window.localStorage : undefined;

export const supabase = createClient({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  storage: browserStorage,
});
