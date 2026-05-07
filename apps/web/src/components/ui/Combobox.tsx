'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

export type ComboboxProps<T> = {
  options: T[];
  value: T | null;
  onChange: (v: T | null) => void;
  getId: (t: T) => string;
  getLabel: (t: T) => string;
  placeholder?: string;
  emptyText?: string;
  ariaLabel?: string;
};

export function Combobox<T>({
  options,
  value,
  onChange,
  getId,
  getLabel,
  placeholder,
  emptyText = '결과 없음',
  ariaLabel,
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const optionIdPrefix = useId();

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => getLabel(o).toLowerCase().includes(q));
  }, [filter, options, getLabel]);

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
    if (activeIndex > filtered.length - 1) setActiveIndex(Math.max(0, filtered.length - 1));
  }, [filtered.length, activeIndex]);

  const selectedLabel = value ? getLabel(value) : '';
  const inputValue = open ? filter : selectedLabel;

  const select = (opt: T) => {
    onChange(opt);
    setFilter('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) select(opt);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  const activeId = filtered[activeIndex] ? `${optionIdPrefix}-${getId(filtered[activeIndex])}` : undefined;

  return (
    <div ref={rootRef} className="relative">
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
      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-md border border-periwinkle-200 bg-white shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-periwinkle-300">{emptyText}</li>
          ) : (
            filtered.map((opt, idx) => {
              const id = getId(opt);
              const label = getLabel(opt);
              const selected = value !== null && getId(value) === id;
              const active = idx === activeIndex;
              const cls = active
                ? 'flex h-9 cursor-pointer items-center bg-periwinkle-100 px-3 text-sm text-periwinkle-500'
                : 'flex h-9 cursor-pointer items-center px-3 text-sm text-periwinkle-500 hover:bg-periwinkle-100';
              return (
                <li
                  key={id}
                  id={`${optionIdPrefix}-${id}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(opt);
                  }}
                  className={selected ? `${cls} font-semibold text-purple-700` : cls}
                >
                  {label}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
