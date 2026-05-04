import * as AuthSession from 'expo-auth-session';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async () => {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'dopamine-planner',
      path: 'auth/callback',
    });
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUri, skipBrowserRedirect: true },
    });
    const result = await AuthSession.startAsync({ authUrl: data.url! });
    if (result.type === 'success' && result.params.code) {
      await supabase.auth.exchangeCodeForSession(result.params.code);
      router.replace('/(main)/life');
    }
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Pressable onPress={handleLogin} className="rounded-md bg-primary px-4 py-2">
        <Text className="text-primary-foreground">Google 로그인</Text>
      </Pressable>
    </View>
  );
}
