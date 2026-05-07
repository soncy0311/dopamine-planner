'use client';

import { useEffect, useRef, useState } from 'react';
import { profileService } from '@todo-list/core';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useLogout } from '@/lib/auth/logout';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.1';

type AccountInfo = {
  userId?: string;
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
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;
      const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
      const appMeta = (data.user.app_metadata ?? {}) as Record<string, unknown>;
      const fallbackName =
        (typeof meta.name === 'string' && meta.name) ||
        (typeof meta.full_name === 'string' && meta.full_name) ||
        undefined;
      const provider =
        (typeof appMeta.provider === 'string' && appMeta.provider) || undefined;

      const profile = await profileService.getById(supabase, data.user.id);
      if (!active) return;

      setUser({
        userId: data.user.id,
        email: data.user.email ?? undefined,
        displayName: profile?.displayName ?? fallbackName,
        provider,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setDraftName(user?.displayName ?? '');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraftName('');
  };

  const saveName = async () => {
    if (!user?.userId) return;
    const trimmed = draftName.trim();
    if (trimmed.length === 0) {
      toast.error('이름을 입력해주세요.');
      return;
    }
    if (trimmed === (user.displayName ?? '')) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const updated = await profileService.updateDisplayName(supabase, user.userId, trimmed);
      setUser((prev) => (prev ? { ...prev, displayName: updated.displayName ?? undefined } : prev));
      setEditing(false);
      toast.success('이름이 변경되었습니다.');
    } catch (err) {
      console.error('[settings] updateDisplayName failed:', err);
      toast.error('이름 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-4">
      <h1 className="text-lg font-semibold text-black-900">설정</h1>

      <section className="flex items-center gap-3 rounded-lg border border-periwinkle-200 bg-white p-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-base font-semibold text-purple-700"
        >
          {user?.displayName?.slice(0, 1) ?? user?.email?.slice(0, 1) ?? '?'}
        </span>
        <div className="flex flex-1 flex-col gap-0.5">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName();
                  if (e.key === 'Escape') cancelEdit();
                }}
                disabled={saving}
                maxLength={40}
                placeholder="이름을 입력하세요"
                className="flex-1 rounded-md border border-periwinkle-300 px-2 py-1 text-sm text-black-900 outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={saveName}
                disabled={saving}
                className="rounded-md bg-purple-500 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                저장
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="rounded-md border border-periwinkle-300 px-2.5 py-1 text-xs font-medium text-periwinkle-500"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-black-900">
                {user?.displayName ?? '이름 미설정'}
              </span>
              <button
                type="button"
                onClick={startEdit}
                disabled={!user}
                className="text-xs font-medium text-purple-500 hover:text-purple-700 disabled:opacity-50"
              >
                변경
              </button>
            </div>
          )}
          <span className="text-xs text-periwinkle-400">{user?.email ?? '—'}</span>
          {user?.provider ? (
            <span className="mt-0.5 text-xs text-periwinkle-300">
              로그인: {user.provider}
            </span>
          ) : null}
        </div>
      </section>

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
