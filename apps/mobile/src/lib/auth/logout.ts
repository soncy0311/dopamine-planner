import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return async function logout() {
    await supabase.auth.signOut();
    qc.clear();
    router.replace('/(auth)/login');
  };
}
