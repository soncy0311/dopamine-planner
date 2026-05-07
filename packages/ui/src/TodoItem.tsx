import type { MouseEvent } from 'react';

export type TodoItemCategory = {
  name: string;
  color: string;
};

export type TodoItemPriority = 'high' | 'medium' | 'low';

export type TodoItemProps = {
  id: string;
  title: string;
  status: 'todo' | 'done';
  category?: TodoItemCategory;
  carryOverCount?: number;
  onToggle: () => void;
  onPress?: () => void;
};

export function priorityBadgeClass(p: TodoItemPriority): string {
  const base =
    'inline-flex h-5 items-center rounded-md px-2 text-[10px] font-medium uppercase tracking-wide';
  if (p === 'high') return `${base} bg-priority-high-bg text-priority-high`;
  if (p === 'medium') return `${base} bg-priority-medium-bg text-priority-medium`;
  return `${base} bg-priority-low-bg text-priority-low`;
}

export function TodoItem({
  title,
  status,
  category,
  carryOverCount,
  onToggle,
  onPress,
}: TodoItemProps) {
  const done = status === 'done';

  const handleCheckboxClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggle();
  };

  const handleRowClick = () => {
    onPress?.();
  };

  const checkbox = (
    <button
      type="button"
      aria-pressed={done}
      aria-label={done ? '완료 해제' : '완료'}
      onClick={handleCheckboxClick}
      className="flex h-11 w-11 items-center justify-center rounded-full"
      style={{ gridRow: 2, gridColumn: 1 }}
    >
      <span
        className={
          done
            ? 'flex h-5 w-5 items-center justify-center rounded-full border-2 border-purple-500 bg-purple-500 text-white'
            : 'flex h-5 w-5 items-center justify-center rounded-full border-2 border-periwinkle-400'
        }
      >
        {done ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2 6.5L4.5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
    </button>
  );

  const showTags = !!category;
  const showTrailing = !!(carryOverCount && carryOverCount > 0);

  return (
    <div
      role={onPress ? 'button' : undefined}
      tabIndex={onPress ? 0 : -1}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (onPress && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onPress();
        }
      }}
      className="grid min-h-12 items-center rounded-md px-2 py-1 hover:bg-periwinkle-100 transition-colors"
      style={{
        gridTemplateColumns: 'auto 1fr auto',
        rowGap: '2px',
        columnGap: '0.75rem',
      }}
    >
      {checkbox}

      {showTags ? (
        <div
          className="flex min-w-0 items-center gap-1"
          style={{ gridRow: 1, gridColumn: 2 }}
        >
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-periwinkle-400">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: category!.color }}
            />
            <span className="truncate max-w-[8rem]">{category!.name}</span>
          </span>
        </div>
      ) : null}

      <span
        className={
          done
            ? 'truncate text-sm text-periwinkle-400 line-through min-w-0'
            : 'truncate text-sm text-periwinkle-500 min-w-0'
        }
        style={{ gridRow: 2, gridColumn: 2 }}
      >
        {title}
      </span>

      {showTrailing ? (
        <span
          className="inline-flex h-5 items-center rounded-full bg-periwinkle-100 px-2 text-[10px] font-medium text-periwinkle-500"
          aria-label={`이월 ${carryOverCount}회`}
          style={{ gridRow: 2, gridColumn: 3 }}
        >
          +{carryOverCount}
        </span>
      ) : null}
    </div>
  );
}
