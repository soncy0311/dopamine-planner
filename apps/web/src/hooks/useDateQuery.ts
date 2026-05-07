'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

export function useDateQuery(): [string, (d: string) => void] {
  const router = useRouter();
  const params = useSearchParams();
  const date = params.get('date') ?? todayISO();
  const setDate = useCallback(
    (d: string) => router.replace(`?date=${d}`, { scroll: false }),
    [router],
  );
  return [date, setDate];
}
