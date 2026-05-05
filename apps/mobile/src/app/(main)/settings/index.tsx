import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useLogout } from '@/lib/auth/logout';

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useLogout();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="border-b border-border bg-card px-4 py-4">
        <Text className="text-xs text-muted-foreground">계정</Text>
        <Text className="mt-1 text-base text-foreground">{email ?? '-'}</Text>
      </View>

      <View className="mt-6">
        <Pressable
          onPress={() => router.push('/categories')}
          className="flex-row items-center justify-between border-b border-border bg-card px-4 py-4"
          accessibilityRole="button"
          accessibilityLabel="분류 관리"
        >
          <Text className="text-base text-foreground">분류 관리</Text>
          <Text className="text-muted-foreground">›</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/epics')}
          className="flex-row items-center justify-between border-b border-border bg-card px-4 py-4"
          accessibilityRole="button"
          accessibilityLabel="Epic 관리"
        >
          <Text className="text-base text-foreground">Epic 관리</Text>
          <Text className="text-muted-foreground">›</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleLogout}
        className="mx-4 mt-10 items-center rounded-md border border-red-600 py-3"
        accessibilityRole="button"
        accessibilityLabel="로그아웃"
      >
        <Text className="text-red-600">로그아웃</Text>
      </Pressable>
    </ScrollView>
  );
}
