import { Tabs, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MainLayout() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (authed === null) return null;
  if (!authed) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs>
      <Tabs.Screen name="life/index" options={{ title: 'Life' }} />
      <Tabs.Screen name="work/index" options={{ title: 'Work' }} />
      <Tabs.Screen name="settings/index" options={{ title: '설정' }} />
    </Tabs>
  );
}
