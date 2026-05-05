import type { MouseEvent } from 'react';
import { EpicProgressBar } from './EpicProgressBar';
import { TodoItem, type TodoItemPriority } from './TodoItem';

export type EpicAccordionSegment = { filled: boolean };

export type EpicAccordionSubIssue = {
  id: string;
  title: string;
  status: 'todo' | 'done';
  priority?: TodoItemPriority | null;
  carryOverCount?: number;
  category?: { name: string; color: string };
  onToggle: () => void;
  onPress?: () => void;
};

export type EpicAccordionCardProps = {
  epicId: string;
  title: string;
  progressPercent: number;
  segments: EpicAccordionSegment[];
  category?: { name: string; color: string };
  expanded: boolean;
  onToggleExpand: () => void;
  onMainToggle: () => void;
  mainStatus: 'todo' | 'done';
  subIssues: EpicAccordionSubIssue[];
};

export function EpicAccordionCard({
  epicId,
  title,
  progressPercent,
  segments,
  category,
  expanded,
  onToggleExpand,
  onMainToggle,
  mainStatus,
  subIssues,
}: EpicAccordionCardProps) {
  const done = mainStatus === 'done';
  const total = segments.length;
  const doneCount = segments.filter((s) => s.filled).length;
  const bodyId = `epic-${epicId}-body`;

  const handleMainToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onMainToggle();
  };

  return (
    <article
      data-expanded={expanded}
      className="flex flex-col gap-2 rounded-lg border border-periwinkle-200 bg-white p-3"
    >
      <header className="flex items-center gap-3">
        <button
          type="button"
          aria-pressed={done}
          aria-label={done ? 'Epic 완료 해제' : 'Epic 완료'}
          onClick={handleMainToggle}
          className="flex h-11 w-11 items-center justify-center rounded-full"
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

        {category ? (
          <span className="flex items-center gap-1 text-xs text-periwinkle-400">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="truncate max-w-[7rem]">{category.name}</span>
          </span>
        ) : null}

        <span className="flex-1 truncate text-sm font-medium text-periwinkle-500">{title}</span>

        <span className="text-xs text-periwinkle-400">{progressPercent}%</span>

        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={bodyId}
          aria-label={expanded ? '접기' : '펼치기'}
          onClick={onToggleExpand}
          className="flex h-8 w-8 items-center justify-center rounded-md text-periwinkle-400 hover:bg-periwinkle-100"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className={expanded ? 'rotate-90 transition-transform' : 'transition-transform'}
          >
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <EpicProgressBar total={total} done={doneCount} segments />

      {expanded ? (
        <ul id={bodyId} role="list" className="flex flex-col gap-1 pl-6">
          {subIssues.map((s) => (
            <li key={s.id}>
              <TodoItem
                id={s.id}
                title={s.title}
                status={s.status}
                priority={s.priority}
                carryOverCount={s.carryOverCount}
                category={s.category}
                onToggle={s.onToggle}
                onPress={s.onPress}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
