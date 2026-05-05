'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useLogout } from '@/lib/auth/logout';

type AccountInfo = { email?: string; displayName?: string };

export default function SettingsPage() {
  const logout = useLogout();
  const [user, setUser] = useState<AccountInfo | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
      const displayName =
        (typeof meta.name === 'string' && meta.name) ||
        (typeof meta.full_name === 'string' && meta.full_name) ||
        undefined;
      setUser({
        email: data.user?.email ?? undefined,
        displayName,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-4">
      <section>
        <h1 className="text-lg font-semibold text-black-900">설정</h1>
        <div className="mt-2 flex flex-col gap-1 text-sm text-indigo-600">
          <div>
            <span className="text-black-900">이메일: </span>
            {user?.email ?? '—'}
          </div>
          <div>
            <span className="text-black-900">이름: </span>
            {user?.displayName ?? '—'}
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-black-900">데이터 관리</h2>
        <Link
          href="/life/categories"
          className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 hover:bg-gray-50"
        >
          라이프 분류 관리
        </Link>
        <Link
          href="/work/categories"
          className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 hover:bg-gray-50"
        >
          워크 분류 관리
        </Link>
        <Link
          href="/life/epics"
          className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 hover:bg-gray-50"
        >
          라이프 Epic 관리
        </Link>
        <Link
          href="/work/epics"
          className="rounded-md border border-lavender-gray-300 bg-white px-3 py-2 text-sm text-black-900 hover:bg-gray-50"
        >
          워크 Epic 관리
        </Link>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-black-900">기타 (준비 중)</h2>
        <div className="rounded-md border border-lavender-gray-300 bg-gray-50 px-3 py-2 text-sm text-periwinkle-300">
          통계 — 준비 중
        </div>
        <div className="rounded-md border border-lavender-gray-300 bg-gray-50 px-3 py-2 text-sm text-periwinkle-300">
          테마 — 준비 중
        </div>
      </section>
      <section>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white"
        >
          로그아웃
        </button>
      </section>
    </div>
  );
}
