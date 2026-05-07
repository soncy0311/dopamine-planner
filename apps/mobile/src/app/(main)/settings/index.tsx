import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useLogout } from '@/lib/auth/logout';

const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION ?? '0.0.1';

type AccountInfo = {
  email?: string;
  displayName?: string;
  provider?: string;
};

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-4 px-4">
      <Text className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{title}</Text>
      <View className="overflow-hidden rounded-lg border border-border bg-card">
        {children}
      </View>
    </View>
  );
}

function SettingsRow({
  label,
  value,
  action,
  disabled,
}: {
  label: string;
  value?: string;
  action?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <View
      className={
        disabled
          ? 'flex-row items-center justify-between border-b border-border bg-muted px-4 py-3'
          : 'flex-row items-center justify-between border-b border-border px-4 py-3'
      }
    >
      <Text className={disabled ? 'text-muted-foreground' : 'text-foreground'}>{label}</Text>
      {value !== undefined ? <Text className="text-muted-foreground">{value}</Text> : null}
      {action}
    </View>
  );
}

export default function SettingsScreen() {
  const logout = useLogout();
  const [user, setUser] = useState<AccountInfo | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
      const appMeta = (data.user?.app_metadata ?? {}) as Record<string, unknown>;
      const displayName =
        (typeof meta.name === 'string' && meta.name) ||
        (typeof meta.full_name === 'string' && meta.full_name) ||
        undefined;
      const provider =
        (typeof appMeta.provider === 'string' && appMeta.provider) || undefined;
      setUser({
        email: data.user?.email ?? undefined,
        displayName,
        provider,
      });
    });
  }, []);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="mt-4 px-4">
        <View className="flex-row items-center gap-3 rounded-lg border border-border bg-card p-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Text className="text-base font-semibold text-primary-foreground">
              {user?.displayName?.slice(0, 1) ?? user?.email?.slice(0, 1) ?? '?'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">
              {user?.displayName ?? '이름 미설정'}
            </Text>
            <Text className="text-xs text-muted-foreground">{user?.email ?? '—'}</Text>
            {user?.provider ? (
              <Text className="mt-0.5 text-xs text-muted-foreground">로그인: {user.provider}</Text>
            ) : null}
          </View>
        </View>
      </View>

      <SettingsSection title="계정">
        <SettingsRow label="소셜 계정 연동" value="곧 제공 예정" disabled />
        <SettingsRow label="알림 설정" value="곧 제공 예정" disabled />
      </SettingsSection>

      <SettingsSection title="앱">
        <SettingsRow label="테마" value="곧 제공 예정" disabled />
      </SettingsSection>

      <SettingsSection title="정보">
        <SettingsRow label="버전" value={APP_VERSION} />
        <SettingsRow
          label="로그아웃"
          action={
            <Pressable
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="로그아웃"
              className="rounded-md border border-red-600 px-3 py-1"
            >
              <Text className="text-xs text-red-600">로그아웃</Text>
            </Pressable>
          }
        />
      </SettingsSection>
    </ScrollView>
  );
}
