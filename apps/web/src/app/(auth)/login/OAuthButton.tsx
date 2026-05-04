'use client';

import { supabase } from '@/lib/supabase/client';

export function OAuthButton() {
  const handleClick = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button onClick={handleClick} className="rounded bg-black px-4 py-2 text-white">
      Google 로 시작하기
    </button>
  );
}
