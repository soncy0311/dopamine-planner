import type { MouseEvent } from 'react';
import { EpicProgressBar } from './EpicProgressBar';
import { TodoItem, type TodoItemPriority } from './TodoItem';

export type IssueCardAccordionSegment = { filled: boolean };

export type IssueCardAccordionSubIssue = {
  id: string;
  title: string;
  status: 'todo' | 'done';
  onToggle: () => void;
  onPress?: () => void;
};

export type IssueCardAccordionProps = {
  epicId: string;
  title: string;
  progressPercent: number;
  segments: IssueCardAccordionSegment[];
  category?: { name: string; color?: string };
  priority?: TodoItemPriority | null;
  expanded: boolean;
  onToggleExpand: () => void;
  onMainToggle: () => void;
  mainStatus: 'todo' | 'done';
  subIssues: IssueCardAccordionSubIssue[];
  onAddSubIssue?: () => void;
  onTitlePress?: () => void;
};

function ChevronRight({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={
        expanded
          ? 'rotate-90 text-periwinkle-400 transition-transform'
          : 'text-periwinkle-400 transition-transform'
      }
    >
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IssueCardAccordion({
  epicId,
  title,
  progressPercent,
  segments,
  category,
  priority,
  expanded,
  onToggleExpand,
  onMainToggle,
  mainStatus,
  subIssues,
  onAddSubIssue,
  onTitlePress,
}: IssueCardAccordionProps) {
  const total = segments.length;
  const doneCount = segments.filter((s) => s.filled).length;
  const bodyId = `epic-${epicId}-body`;

  const handleHeaderClick = (e: MouseEvent<HTMLDivElement>) => {
    // 체크박스/타이틀/체브론 버튼 자체 클릭은 stopPropagation 으로 분리
    if (e.target !== e.currentTarget) return;
    onToggleExpand();
  };

  return (
    <article
      data-expanded={expanded}
      className="overflow-hidden rounded-lg border border-periwinkle-200 bg-white"
    >
      {/* 헤더: TodoItem 마크업 (체크박스 + tags + title + chevron) */}
      <div className="cursor-pointer" onClick={handleHeaderClick}>
        <TodoItem
          id={epicId}
          title={title}
          status={mainStatus}
          category={category}
          priority={priority}
          onToggle={onMainToggle}
          onPress={onTitlePress}
          trailing={
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={bodyId}
              aria-label={expanded ? '접기' : '펼치기'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-periwinkle-100"
            >
              <ChevronRight expanded={expanded} />
            </button>
          }
        />
      </div>

      {/* 진행률 바 + percent */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <div className="flex-1">
          <EpicProgressBar total={total} done={doneCount} segments />
        </div>
        <span className="text-xs md:text-sm font-medium text-periwinkle-500">{progressPercent}%</span>
      </div>

      {/* 펼침 body — sub-issues (태그 없이 체크박스 + 제목만) */}
      {expanded ? (
        <div id={bodyId} className="border-t border-periwinkle-100">
          <ul role="list" className="flex flex-col">
            {subIssues.map((s) => {
              const subDone = s.status === 'done';
              return (
                <li key={s.id}>
                  <div
                    role={s.onPress ? 'button' : undefined}
                    tabIndex={s.onPress ? 0 : -1}
                    onClick={() => s.onPress?.()}
                    onKeyDown={(e) => {
                      if (s.onPress && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        s.onPress();
                      }
                    }}
                    className="flex min-h-8 items-center gap-2 border-b border-periwinkle-100 py-2.5 pl-16 pr-4 last:border-b-0 hover:bg-periwinkle-100/50"
                  >
                    <button
                      type="button"
                      aria-pressed={subDone}
                      aria-label={subDone ? '완료 해제' : '완료'}
                      onClick={(e) => {
                        e.stopPropagation();
                        s.onToggle();
                      }}
                      className="flex items-center justify-center"
                    >
                      <span
                        className={
                          subDone
                            ? 'flex h-[14px] w-[14px] items-center justify-center rounded-sm border-2 border-purple-500 bg-purple-500 text-white'
                            : 'flex h-[14px] w-[14px] items-center justify-center rounded-sm border-2 border-periwinkle-300'
                        }
                      >
                        {subDone ? (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
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
                    <span
                      className={
                        subDone
                          ? 'flex-1 truncate text-sm md:text-base text-periwinkle-400 line-through'
                          : 'flex-1 truncate text-sm md:text-base text-periwinkle-500'
                      }
                    >
                      {s.title}
                    </span>
                  </div>
                </li>
              );
            })}
            {onAddSubIssue ? (
              <li>
                <button
                  type="button"
                  onClick={onAddSubIssue}
                  className="flex h-9 w-full items-center justify-start border-t border-periwinkle-100 pl-16 pr-4 text-[11px] md:text-xs font-medium text-purple-500 hover:bg-periwinkle-100/50"
                >
                  + 서브 이슈 추가
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
