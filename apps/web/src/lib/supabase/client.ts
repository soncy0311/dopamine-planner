import { createClient } from '@todo-list/core';

type SupabaseInstance = ReturnType<typeof createClient>;

let _instance: SupabaseInstance | null = null;

const getInstance = (): SupabaseInstance => {
  if (_instance) return _instance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const browserStorage: any = typeof window !== 'undefined' ? window.localStorage : undefined;
  _instance = createClient({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    storage: browserStorage,
  });
  return _instance;
};

export const supabase = new Proxy({} as SupabaseInstance, {
  get: (_target, prop) => {
    const value = getInstance()[prop as keyof SupabaseInstance];
    return typeof value === 'function' ? value.bind(getInstance()) : value;
  },
});
