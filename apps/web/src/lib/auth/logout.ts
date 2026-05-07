'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return async function logout() {
    await supabase.auth.signOut();
    qc.clear();
    router.replace('/login');
  };
}
