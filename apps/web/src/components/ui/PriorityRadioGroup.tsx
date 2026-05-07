'use client';

import { useRef } from 'react';
import { priorityBadgeClass, type TodoItemPriority } from '@todo-list/ui';

const PRIORITY_OPTIONS: { value: TodoItemPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export type PriorityRadioGroupProps = {
  value: TodoItemPriority;
  onChange: (next: TodoItemPriority) => void;
  ariaLabel?: string;
};

export function PriorityRadioGroup({ value, onChange, ariaLabel }: PriorityRadioGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  const focusValue = (next: TodoItemPriority) => {
    const root = groupRef.current;
    if (!root) return;
    const target = root.querySelector<HTMLButtonElement>(`[data-priority="${next}"]`);
    target?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = PRIORITY_OPTIONS.findIndex((o) => o.value === value);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = PRIORITY_OPTIONS[(idx + 1) % PRIORITY_OPTIONS.length].value;
      onChange(next);
      focusValue(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next =
        PRIORITY_OPTIONS[(idx - 1 + PRIORITY_OPTIONS.length) % PRIORITY_OPTIONS.length].value;
      onChange(next);
      focusValue(next);
    }
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={ariaLabel ?? '우선순위'}
      onKeyDown={handleKeyDown}
      className="flex gap-2"
    >
      {PRIORITY_OPTIONS.map((opt) => {
        const checked = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            data-priority={opt.value}
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={
              checked
                ? `${priorityBadgeClass(opt.value)} ring-2 ring-purple-500 ring-offset-1`
                : `${priorityBadgeClass(opt.value)} opacity-60`
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
