import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@todo-list/core';

export const supabase = createClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  storage: AsyncStorage,
});
