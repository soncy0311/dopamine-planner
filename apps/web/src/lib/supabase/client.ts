'use client';

import { createClient } from '@todo-list/core';

// SSG prerender 단계에서 env 미주입 시 빌드 실패 방지용 fallback.
// 실제 배포(Vercel)·dev 환경에서는 env 주입으로 placeholder 가 치환된다.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-placeholder-anon-key';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const browserStorage: any =
  typeof window !== 'undefined' ? window.localStorage : undefined;

export const supabase = createClient({
  url,
  anonKey,
  storage: browserStorage,
});
