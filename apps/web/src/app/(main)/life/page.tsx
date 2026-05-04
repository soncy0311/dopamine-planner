'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeTodos } from '@todo-list/core';
import { supabase } from '@/lib/supabase/client';

function useLifeRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const unsub = subscribeTodos(supabase, 'life', () => {
      qc.invalidateQueries({ queryKey: ['todos', { workspace: 'life' }] });
    });
    return unsub;
  }, [qc]);
}

export default function LifePage() {
  useLifeRealtime();
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Life</h1>
      <p className="text-sm text-muted-foreground">Life 일자 뷰 (구현 예정)</p>
    </main>
  );
}
