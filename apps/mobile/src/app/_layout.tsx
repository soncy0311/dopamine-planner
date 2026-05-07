import 'react-native-gesture-handler';
import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const handleUrl = async (url: string) => {
      const parsed = Linking.parse(url);
      const code = parsed.queryParams?.code;
      if (typeof code === 'string') {
        await supabase.auth.exchangeCodeForSession(code).catch(() => {
          // idempotent 아님 — 중복 호출 시 silent
        });
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen
            name="epic-form"
            options={{ presentation: 'modal', title: 'Epic 추가' }}
          />
          <Stack.Screen
            name="sub-issue-form"
            options={{ presentation: 'modal', title: '서브 이슈 추가' }}
          />
          <Stack.Screen
            name="todo/[id]"
            options={{ presentation: 'modal', title: '투두 수정' }}
          />
          <Stack.Screen
            name="create-todo"
            options={{ presentation: 'modal', headerShown: false }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
