'use client';

import { Suspense } from 'react';
import { MainDailyView } from '@/components/MainDailyView';

export default function WorkPage() {
  return (
    <Suspense fallback={null}>
      <MainDailyView workspace="work" />
    </Suspense>
  );
}
