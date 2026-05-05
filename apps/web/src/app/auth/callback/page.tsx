'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    const finish = (next: string) => {
      if (cancelled) return;
      router.replace(next);
    };

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.warn('[auth/callback] exchangeCodeForSession failed:', error);
            finish('/login?error=oauth');
            return;
          }
          finish('/life');
        })
        .catch((err) => {
          console.warn('[auth/callback] exchange threw:', err);
          finish('/login?error=oauth');
        });
    } else {
      finish('/life');
    }

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-periwinkle-400">로그인 처리 중…</p>
    </main>
  );
}
