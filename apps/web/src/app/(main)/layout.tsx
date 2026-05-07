'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { SideNav } from '@/components/SideNav';
import { MobileTabBar } from '@/components/MobileTabBar';

type SessionState = 'pending' | 'authenticated' | 'unauthenticated';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<SessionState>('pending');

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        setState('authenticated');
      } else {
        setState('unauthenticated');
        router.replace('/login');
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) {
        setState('authenticated');
      } else {
        setState('unauthenticated');
        router.replace('/login');
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (state !== 'authenticated') {
    return null;
  }

  return (
    <>
      <SideNav />
      <main className="min-h-screen pb-20 md:ml-60 md:pb-0">{children}</main>
      <MobileTabBar />
    </>
  );
}
