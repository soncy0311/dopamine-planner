import type { MouseEvent, ReactNode } from 'react';

export type TodoItemCategory = {
  name: string;
  color?: string;
};

export type TodoItemPriority = 'high' | 'medium' | 'low';

export type TodoItemProps = {
  id: string;
  title: string;
  status: 'todo' | 'done';
  category?: TodoItemCategory;
  priority?: TodoItemPriority | null;
  carryOverCount?: number;
  onToggle: () => void;
  onPress?: () => void;
  /** trailing 슬롯 — chevron 등 row 2 col 3 에 배치할 커스텀 요소. 미지정 시 carry-over badge 가 표시됨 */
  trailing?: ReactNode;
};

const PRIORITY_LABEL: Record<TodoItemPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function priorityBadgeClass(p: TodoItemPriority): string {
  // PriorityRadioGroup 등 외부 호출에서 재사용 — 큰 사이즈 기본값
  const base =
    'inline-flex h-5 items-center rounded-md px-2 text-[10px] font-medium uppercase tracking-wide';
  if (p === 'high') return `${base} bg-priority-high-bg text-priority-high`;
  if (p === 'medium') return `${base} bg-priority-medium-bg text-priority-medium`;
  return `${base} bg-priority-low-bg text-priority-low`;
}

function tagBadgePriorityClass(p: TodoItemPriority): string {
  // tags row (small) 변형 — prototype `proto-todo-item-tags .proto-badge` 정합 (~9px)
  const base = 'inline-flex items-center rounded-sm px-1 text-[9px] font-medium leading-tight';
  if (p === 'high') return `${base} bg-priority-high-bg text-priority-high`;
  if (p === 'medium') return `${base} bg-priority-medium-bg text-priority-medium`;
  return `${base} bg-priority-low-bg text-priority-low`;
}

export function TodoItem({
  title,
  status,
  category,
  priority,
  carryOverCount,
  onToggle,
  onPress,
  trailing,
}: TodoItemProps) {
  const done = status === 'done';

  const handleCheckboxClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggle();
  };

  const handleRowClick = () => {
    onPress?.();
  };

  const showTags = !!priority || !!category;
  const hasCarryOver = !!(carryOverCount && carryOverCount > 0);
  const trailingNode = trailing ?? (hasCarryOver ? (
    <span
      className="inline-flex items-center rounded-sm bg-gray-50 px-1 text-[9px] font-medium leading-tight text-periwinkle-500"
      aria-label={`이월 ${carryOverCount}회`}
    >
      +{carryOverCount}
    </span>
  ) : null);

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
      className="grid min-h-12 px-4 py-3 hover:bg-periwinkle-100 transition-colors"
      style={{
        gridTemplateColumns: 'auto 1fr auto',
        rowGap: '2px',
        columnGap: '12px',
        alignItems: 'center',
      }}
    >
      <button
        type="button"
        aria-pressed={done}
        aria-label={done ? '완료 해제' : '완료'}
        onClick={handleCheckboxClick}
        className="flex items-center justify-center"
        style={{ gridRow: 2, gridColumn: 1 }}
      >
        <span
          className={
            done
              ? 'flex h-[18px] w-[18px] items-center justify-center rounded-sm border-2 border-purple-500 bg-purple-500 text-white'
              : 'flex h-[18px] w-[18px] items-center justify-center rounded-sm border-2 border-periwinkle-300'
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

      {showTags ? (
        <div
          className="flex min-w-0 items-center gap-1"
          style={{ gridRow: 1, gridColumn: 2 }}
        >
          {priority ? (
            <span
              className={`${tagBadgePriorityClass(priority)} ${done ? 'opacity-50' : ''}`}
              aria-label={`우선순위 ${PRIORITY_LABEL[priority]}`}
            >
              {PRIORITY_LABEL[priority]}
            </span>
          ) : null}
          {category ? (
            <span
              className={`inline-flex items-center rounded-sm bg-purple-100 px-1 text-[9px] font-medium leading-tight text-purple-700 ${done ? 'opacity-50' : ''}`}
            >
              <span className="truncate max-w-[8rem]">{category.name}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      <span
        className={
          done
            ? 'truncate text-sm text-periwinkle-400 line-through min-w-0'
            : 'truncate text-sm text-black-900 min-w-0'
        }
        style={{ gridRow: 2, gridColumn: 2 }}
      >
        {title}
      </span>

      {trailingNode ? (
        <span
          className="inline-flex items-center justify-end whitespace-nowrap"
          style={{ gridRow: 2, gridColumn: 3 }}
        >
          {trailingNode}
        </span>
      ) : null}
    </div>
  );
}
