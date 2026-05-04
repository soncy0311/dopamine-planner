import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeTodos } from '@todo-list/core';
import { supabase } from '@/lib/supabase';

export default function LifeScreen() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeTodos(supabase, 'life', () =>
      qc.invalidateQueries({ queryKey: ['todos', { workspace: 'life' }] }),
    );
    return () => unsubscribe();
  }, [qc]);

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-foreground">Life 일자 뷰 (stub)</Text>
    </View>
  );
}
