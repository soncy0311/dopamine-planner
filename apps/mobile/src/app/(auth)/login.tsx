import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'dopamine-planner',
        path: 'auth/callback',
      });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error('로그인 URL 생성 실패');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (result.type === 'cancel' || result.type === 'dismiss') return;
      if (result.type !== 'success' || !result.url) throw new Error('OAuth 응답 오류');

      const parsed = Linking.parse(result.url);
      const code = parsed.queryParams?.code;
      if (typeof code !== 'string') throw new Error('OAuth code 누락');

      const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
      if (exErr) throw exErr;

      router.replace('/(main)/life');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '다시 시도해 주세요.';
      Alert.alert('로그인 실패', msg);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="mb-8 text-2xl font-bold text-foreground">투두 리스트</Text>
      <Pressable
        onPress={handleLogin}
        className="rounded-md bg-primary px-6 py-3 active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="Google 로 로그인"
      >
        <Text className="text-base font-medium text-primary-foreground">Google 로 계속하기</Text>
      </Pressable>
    </View>
  );
}
