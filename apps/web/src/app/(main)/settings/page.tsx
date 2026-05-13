'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  profileService,
  useCategories,
  useCompletedEpicsByCategoryPeriod,
  useDeleteCategory,
  useUpdateCategory,
  type Category,
  type EpicIssue,
  type Workspace,
} from '@todo-list/core';
import { toast } from 'sonner';
import { CategoryFormSchema, PALETTE } from '@/lib/forms/schemas';
import { supabase } from '@/lib/supabase/client';
import { useLogout } from '@/lib/auth/logout';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.1';

type AccountInfo = {
  userId?: string;
  email?: string;
  displayName?: string;
  provider?: string;
};

const PRIORITY_LABEL: Record<EpicIssue['priority'], string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

function formatDate(value: string | null): string {
  if (!value) return '-';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${year}.${month}.${day}` : value;
}

function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-periwinkle-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-black-900">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function CompletedEpicList({ epics }: { epics: EpicIssue[] }) {
  if (epics.length === 0) {
    return (
      <p className="rounded-md bg-periwinkle-50 px-3 py-2 text-xs text-periwinkle-400">
        완료된 Epic 이 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {epics.map((epic) => (
        <li
          key={epic.id}
          className="flex flex-col gap-1 rounded-md bg-periwinkle-50 px-3 py-2"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-sm font-medium text-black-900">
              {epic.title}
            </span>
            <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700">
              100%
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-periwinkle-500">
            <span>우선순위 {PRIORITY_LABEL[epic.priority]}</span>
            <span>완료일 {formatDate(epic.completedDate)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

type CompletedEpicPeriodMode = 'month' | 'day';

function CompletedEpicArchivePanel({
  category,
  periodMode,
  month,
  day,
  epics,
  isLoading,
  isError,
  onPeriodModeChange,
  onMonthChange,
  onDayChange,
  onClose,
}: {
  category: Category;
  periodMode: CompletedEpicPeriodMode;
  month: string;
  day: string;
  epics: EpicIssue[];
  isLoading: boolean;
  isError: boolean;
  onPeriodModeChange: (mode: CompletedEpicPeriodMode) => void;
  onMonthChange: (value: string) => void;
  onDayChange: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-2 flex flex-col gap-3 rounded-md border border-purple-200 bg-purple-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: category.color || '#9CA3AF' }}
          />
          <h3 className="truncate text-sm font-semibold text-black-900">
            {category.name} 완료 Epic
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-xs font-medium text-periwinkle-500 hover:text-black-900"
        >
          닫기
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="grid grid-cols-2 rounded-md border border-periwinkle-200 bg-white p-0.5">
          {(['month', 'day'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onPeriodModeChange(mode)}
              aria-pressed={periodMode === mode}
              className={
                periodMode === mode
                  ? 'rounded px-3 py-1.5 text-xs font-medium bg-purple-500 text-white'
                  : 'rounded px-3 py-1.5 text-xs font-medium text-periwinkle-500 hover:bg-periwinkle-50'
              }
            >
              {mode === 'month' ? '월별' : '일별'}
            </button>
          ))}
        </div>
        {periodMode === 'month' ? (
          <input
            type="month"
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
            className="h-9 rounded-md border border-periwinkle-200 bg-white px-3 text-sm text-black-900 outline-none focus:border-purple-500"
            aria-label="완료 Epic 조회 월"
          />
        ) : (
          <input
            type="date"
            value={day}
            onChange={(event) => onDayChange(event.target.value)}
            className="h-9 rounded-md border border-periwinkle-200 bg-white px-3 text-sm text-black-900 outline-none focus:border-purple-500"
            aria-label="완료 Epic 조회 날짜"
          />
        )}
      </div>

      {isLoading ? (
        <p className="rounded-md bg-white px-3 py-3 text-sm text-periwinkle-500">
          완료 Epic 을 불러오는 중입니다.
        </p>
      ) : isError ? (
        <p className="rounded-md bg-white px-3 py-3 text-sm text-red-500">
          완료 Epic 을 불러오지 못했습니다.
        </p>
      ) : (
        <CompletedEpicList epics={epics} />
      )}
    </div>
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

function CategoryManagementSection({
  workspace,
  title,
}: {
  workspace: Workspace;
  title: string;
}) {
  const { data: categories = [] } = useCategories({ client: supabase, workspace });
  const updateCategory = useUpdateCategory({ client: supabase });
  const deleteCategory = useDeleteCategory({ client: supabase });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState<string>(PALETTE[0]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [periodMode, setPeriodMode] = useState<CompletedEpicPeriodMode>('month');
  const [month, setMonth] = useState(() => todayIso().slice(0, 7));
  const [day, setDay] = useState(() => todayIso());
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );
  const period = useMemo(
    () =>
      periodMode === 'month'
        ? { mode: 'month' as const, value: month || todayIso().slice(0, 7) }
        : { mode: 'day' as const, value: day || todayIso() },
    [periodMode, month, day],
  );
  const {
    data: selectedCompletedEpics = [],
    isLoading: completedEpicsLoading,
    isError: completedEpicsError,
  } = useCompletedEpicsByCategoryPeriod({
    client: supabase,
    workspace,
    categoryId: selectedCategoryId,
    period,
  });

  useEffect(() => {
    if (selectedCategoryId && !selectedCategory) setSelectedCategoryId(null);
  }, [selectedCategoryId, selectedCategory]);

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setDraftName(category.name);
    setDraftColor(category.color || PALETTE[0]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName('');
    setDraftColor(PALETTE[0]);
  };

  const saveEdit = async (category: Category) => {
    const parsed = CategoryFormSchema.safeParse({
      name: draftName.trim(),
      color: draftColor,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? '분류 입력을 확인해주세요.');
      return;
    }
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        patch: parsed.data,
      });
      toast.success('분류가 수정되었습니다.');
      cancelEdit();
    } catch (err) {
      console.error('[settings] update category failed:', err);
      toast.error('분류 수정에 실패했습니다.');
    }
  };

  const confirmDelete = async (category: Category) => {
    const ok = window.confirm(
      `'${category.name}' 분류만 삭제합니다.\n연결된 Epic 과 Sub 는 삭제되지 않고 '분류 없음'으로 전환됩니다.`,
    );
    if (!ok) return;
    try {
      await deleteCategory.mutateAsync({ id: category.id, workspace });
      toast.success('분류가 삭제되었습니다. 연결된 Epic 은 분류 없음으로 전환됩니다.');
      if (editingId === category.id) cancelEdit();
      if (selectedCategoryId === category.id) setSelectedCategoryId(null);
    } catch (err) {
      console.error('[settings] delete category failed:', err);
      toast.error('분류 삭제에 실패했습니다.');
    }
  };

  return (
    <SettingsSection title={title}>
      {categories.length === 0 ? (
        <p className="px-3 py-2 text-sm text-periwinkle-400">등록된 분류가 없습니다.</p>
      ) : (
        <>
          {categories.map((category) => {
          const editing = editingId === category.id;
          return (
            <div
              key={category.id}
              className={
                selectedCategoryId === category.id
                  ? 'flex flex-col gap-3 rounded-md border border-purple-200 bg-purple-50/40 px-3 py-3'
                  : 'flex flex-col gap-3 rounded-md border border-periwinkle-100 px-3 py-3'
              }
            >
              {editing ? (
                <>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    maxLength={50}
                    className="h-9 rounded-md border border-periwinkle-200 px-3 text-sm text-black-900 outline-none focus:border-purple-500"
                    aria-label={`${category.name} 분류 이름`}
                  />
                  <div className="flex flex-wrap gap-2">
                    {PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`${color} 색상 선택`}
                        aria-pressed={draftColor === color}
                        onClick={() => setDraftColor(color)}
                        className={
                          draftColor === color
                            ? 'h-7 w-7 rounded-full border-2 border-black-900'
                            : 'h-7 w-7 rounded-full border border-periwinkle-200'
                        }
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-md border border-periwinkle-300 px-3 py-1.5 text-xs font-medium text-periwinkle-500"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => void saveEdit(category)}
                      disabled={updateCategory.isPending}
                      className="rounded-md bg-purple-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      저장
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    aria-pressed={selectedCategoryId === category.id}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color || '#9CA3AF' }}
                    />
                    <span className="truncate text-sm font-medium text-black-900">
                      {category.name}
                    </span>
                  </button>
                  <span className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="text-xs font-medium text-purple-500 hover:text-purple-700"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => void confirmDelete(category)}
                      disabled={deleteCategory.isPending}
                      className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </span>
                </div>
              )}
            </div>
          );
          })}
          {selectedCategory ? (
            <CompletedEpicArchivePanel
              category={selectedCategory}
              periodMode={periodMode}
              month={month}
              day={day}
              epics={selectedCompletedEpics}
              isLoading={completedEpicsLoading}
              isError={completedEpicsError}
              onPeriodModeChange={setPeriodMode}
              onMonthChange={setMonth}
              onDayChange={setDay}
              onClose={() => setSelectedCategoryId(null)}
            />
          ) : null}
        </>
      )}
    </SettingsSection>
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

      <SettingsSection title="테마">
        <SettingsRow label="화면 모드" value="시스템" disabled />
      </SettingsSection>

      <CategoryManagementSection workspace="life" title="생활 분류" />
      <CategoryManagementSection workspace="work" title="업무 분류" />

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
