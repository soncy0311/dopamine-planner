'use client';

import { Suspense } from 'react';
import { MainDailyView } from '@/components/MainDailyView';

export default function LifePage() {
  return (
    <Suspense fallback={null}>
      <MainDailyView workspace="life" />
    </Suspense>
  );
}
