'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  useCategories,
  useCreateCategory,
  type Workspace,
} from '@todo-list/core';
import { supabase } from '@/lib/supabase/client';

export type CategoryComboboxValue = {
  id: string;
  name: string;
  color?: string;
};

export type CategoryComboboxCreateProps = {
  workspace: Workspace;
  value: CategoryComboboxValue | null;
  onChange: (category: CategoryComboboxValue) => void;
  placeholder?: string;
  ariaLabel?: string;
};

export function CategoryComboboxCreate({
  workspace,
  value,
  onChange,
  placeholder = '분류 선택 또는 새로 만들기',
  ariaLabel = '분류',
}: CategoryComboboxCreateProps) {
  const { data: categories, isLoading } = useCategories({ client: supabase, workspace });
  const create = useCreateCategory({ client: supabase });

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const optionIdPrefix = useId();

  const options = categories ?? [];
  const trimmed = filter.trim();

  const filtered = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [trimmed, options]);

  const exactMatch = trimmed
    ? options.some((o) => o.name.toLowerCase() === trimmed.toLowerCase())
    : true;
  const showCreateOption = !!trimmed && !exactMatch;
  const totalItems = filtered.length + (showCreateOption ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  useEffect(() => {
    if (activeIndex > totalItems - 1) setActiveIndex(Math.max(0, totalItems - 1));
  }, [totalItems, activeIndex]);

  const selectedLabel = value ? value.name : '';
  const inputValue = open ? filter : selectedLabel;

  const selectExisting = (opt: (typeof options)[number]) => {
    onChange({ id: opt.id, name: opt.name, color: opt.color ?? undefined });
    setFilter('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const selectCreate = async () => {
    if (!trimmed) return;
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        toast.error('로그인 세션이 만료되었어요. 다시 로그인 해주세요.');
        return;
      }
      const created = await create.mutateAsync({
        user_id: userRes.user.id,
        workspace,
        name: trimmed,
      });
      onChange({ id: created.id, name: created.name, color: created.color ?? undefined });
      setFilter('');
      setOpen(false);
      inputRef.current?.blur();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '분류 생성에 실패했어요.';
      toast.error(msg.includes('duplicate') ? '같은 이름의 분류가 이미 있어요.' : msg);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex < filtered.length) {
        const opt = filtered[activeIndex];
        if (opt) selectExisting(opt);
      } else if (showCreateOption) {
        void selectCreate();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  const activeId =
    activeIndex < filtered.length && filtered[activeIndex]
      ? `${optionIdPrefix}-${filtered[activeIndex].id}`
      : showCreateOption && activeIndex === filtered.length
        ? `${optionIdPrefix}-create`
        : undefined;

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-2">
        {value?.color ? (
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: value.color }}
          />
        ) : null}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={open ? activeId : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={inputValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setFilter(e.target.value);
            setActiveIndex(0);
            if (!open) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="flex h-10 w-full items-center rounded-md border border-periwinkle-200 bg-white px-3 text-sm text-periwinkle-500 outline-none focus:border-purple-500"
        />
      </div>
      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-md border border-periwinkle-200 bg-white shadow-lg"
        >
          {isLoading ? (
            <li className="px-3 py-2 text-sm text-periwinkle-300">불러오는 중…</li>
          ) : null}
          {!isLoading && filtered.length === 0 && !showCreateOption ? (
            <li className="px-3 py-2 text-sm text-periwinkle-300">결과 없음</li>
          ) : null}
          {filtered.map((opt, idx) => {
            const selected = value !== null && value.id === opt.id;
            const active = idx === activeIndex;
            const cls = active
              ? 'flex h-9 cursor-pointer items-center gap-2 bg-periwinkle-100 px-3 text-sm text-periwinkle-500'
              : 'flex h-9 cursor-pointer items-center gap-2 px-3 text-sm text-periwinkle-500 hover:bg-periwinkle-100';
            return (
              <li
                key={opt.id}
                id={`${optionIdPrefix}-${opt.id}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectExisting(opt);
                }}
                className={selected ? `${cls} font-semibold text-purple-700` : cls}
              >
                {opt.color ? (
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: opt.color }}
                  />
                ) : null}
                <span className="truncate">{opt.name}</span>
              </li>
            );
          })}
          {showCreateOption ? (
            <li
              id={`${optionIdPrefix}-create`}
              role="option"
              aria-selected={activeIndex === filtered.length}
              onMouseEnter={() => setActiveIndex(filtered.length)}
              onMouseDown={(e) => {
                e.preventDefault();
                void selectCreate();
              }}
              className={
                activeIndex === filtered.length
                  ? 'flex h-9 cursor-pointer items-center bg-purple-50 px-3 text-sm font-medium text-purple-600'
                  : 'flex h-9 cursor-pointer items-center px-3 text-sm font-medium text-purple-600 hover:bg-purple-50'
              }
            >
              + ‘{trimmed}’ 분류 만들기
              {create.isPending ? (
                <span className="ml-2 text-xs text-periwinkle-300">생성 중…</span>
              ) : null}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
