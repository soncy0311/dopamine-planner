'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useLogout } from '@/lib/auth/logout';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.1';

type AccountInfo = {
  email?: string;
  displayName?: string;
  provider?: string;
};

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-periwinkle-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-black-900">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function SettingsRow({
  label,
  value,
  action,
  disabled,
}: {
  label: string;
  value?: React.ReactNode;
  action?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div
      className={
        disabled
          ? 'flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-periwinkle-300'
          : 'flex items-center justify-between rounded-md px-3 py-2 text-sm text-black-900'
      }
    >
      <span>{label}</span>
      <span className="flex items-center gap-2">
        {value !== undefined ? <span>{value}</span> : null}
        {action}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const logout = useLogout();
  const [user, setUser] = useState<AccountInfo | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
      const appMeta = (data.user?.app_metadata ?? {}) as Record<string, unknown>;
      const displayName =
        (typeof meta.name === 'string' && meta.name) ||
        (typeof meta.full_name === 'string' && meta.full_name) ||
        undefined;
      const provider =
        (typeof appMeta.provider === 'string' && appMeta.provider) || undefined;
      setUser({
        email: data.user?.email ?? undefined,
        displayName,
        provider,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-4">
      <h1 className="text-lg font-semibold text-black-900">설정</h1>

      <section className="flex items-center gap-3 rounded-lg border border-periwinkle-200 bg-white p-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-base font-semibold text-purple-700"
        >
          {user?.displayName?.slice(0, 1) ?? user?.email?.slice(0, 1) ?? '?'}
        </span>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-semibold text-black-900">
            {user?.displayName ?? '이름 미설정'}
          </span>
          <span className="text-xs text-periwinkle-400">{user?.email ?? '—'}</span>
          {user?.provider ? (
            <span className="mt-0.5 text-xs text-periwinkle-300">
              로그인: {user.provider}
            </span>
          ) : null}
        </div>
      </section>

      <SettingsSection title="계정">
        <SettingsRow label="소셜 계정 연동" value="곧 제공 예정" disabled />
        <SettingsRow label="알림 설정" value="곧 제공 예정" disabled />
      </SettingsSection>

      <SettingsSection title="앱">
        <SettingsRow label="테마" value="곧 제공 예정" disabled />
      </SettingsSection>

      <SettingsSection title="정보">
        <SettingsRow label="버전" value={APP_VERSION} />
        <SettingsRow
          label="로그아웃"
          action={
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white"
            >
              로그아웃
            </button>
          }
        />
      </SettingsSection>
    </div>
  );
}
