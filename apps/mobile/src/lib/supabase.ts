import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@todo-list/core';

export const supabase = createClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  storage: AsyncStorage,
});
