import { useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export type DateNavigatorProps = {
  date: string;
  onChange: (date: string) => void;
  completedCounts?: Record<string, number>;
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(iso: string, delta: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + delta);
  return toISO(d);
}

function addMonths(iso: string, delta: number): string {
  const d = parseISO(iso);
  const targetMonth = d.getMonth() + delta;
  const target = new Date(d.getFullYear(), targetMonth, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d.getDate(), lastDay));
  return toISO(target);
}

function startOfWeekSunday(iso: string): Date {
  const d = parseISO(iso);
  const dow = d.getDay();
  d.setDate(d.getDate() - dow);
  return d;
}

export function buildMonthGrid(anchor: Date): Date[] {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function todayISO(): string {
  return toISO(new Date());
}

export function getCompletedEpicDotCount(count: number): number {
  if (count <= 0) return 0;
  return count < 5 ? count : 0;
}

export function getCompletedEpicStarCount(count: number): number {
  return count >= 5 ? Math.floor(count / 5) : 0;
}

function completedLabel(base: string, count: number): string {
  return count > 0 ? `${base}, 완료 Epic ${count}개` : base;
}

function CompletedIndicator({
  count,
  invert,
}: {
  count: number;
  invert?: boolean;
}) {
  const dotCount = getCompletedEpicDotCount(count);
  const starCount = getCompletedEpicStarCount(count);
  if (dotCount === 0 && starCount === 0) return null;
  const dotClass = invert
    ? 'h-1 w-1 rounded-full bg-white'
    : 'h-1 w-1 rounded-full bg-purple-500';
  const starClass = invert
    ? 'text-[9px] leading-none text-white'
    : 'text-[9px] leading-none text-purple-500';
  return (
    <span
      aria-hidden="true"
      data-dot-count={dotCount}
      data-star-count={starCount}
      data-testid="completed-epic-indicator"
      className="flex h-2 items-center justify-center gap-0.5"
    >
      {starCount > 0 ? (
        <span className={starClass}>{'★'.repeat(starCount)}</span>
      ) : null}
      {Array.from({ length: dotCount }, (_, index) => (
        <span key={index} className={dotClass} />
      ))}
    </span>
  );
}

export function DateNavigator({
  date,
  onChange,
  completedCounts = {},
}: DateNavigatorProps) {
  const current = parseISO(date);
  const year = current.getFullYear();
  const month = current.getMonth() + 1;
  const today = todayISO();

  const [expanded, setExpanded] = useState(false);
  const calId = useId();

  const week = useMemo(() => {
    const start = startOfWeekSunday(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [date]);

  const monthGrid = useMemo(() => buildMonthGrid(current), [current]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape' && expanded) {
        setExpanded(false);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onChange(addDays(date, -1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onChange(addDays(date, 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [date, onChange, expanded]);

  const prevLabel = expanded ? '이전 달' : '이전 주';
  const nextLabel = expanded ? '다음 달' : '다음 주';
  const onPrev = () => onChange(expanded ? addMonths(date, -1) : addDays(date, -7));
  const onNext = () => onChange(expanded ? addMonths(date, 1) : addDays(date, 7));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label={prevLabel}
          onClick={onPrev}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-periwinkle-100"
        >
          <ChevronLeft aria-hidden className="h-5 w-5 text-periwinkle-500" />
        </button>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={calId}
          data-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-lg font-semibold text-periwinkle-500 hover:bg-periwinkle-100"
        >
          <span>
            {year}년 {month}월
          </span>
          <ChevronDown
            aria-hidden
            className={
              expanded
                ? 'h-4 w-4 rotate-180 transition-transform'
                : 'h-4 w-4 transition-transform'
            }
          />
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          onClick={onNext}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-periwinkle-100"
        >
          <ChevronRight aria-hidden className="h-5 w-5 text-periwinkle-500" />
        </button>
      </div>

      {expanded ? (
        <div
          id={calId}
          role="grid"
          aria-label={`${year}년 ${month}월 달력`}
          className="grid grid-cols-7 gap-1"
        >
          {DAY_LABELS.map((label) => (
            <div
              key={`hd-${label}`}
              role="columnheader"
              className="flex h-6 items-center justify-center text-[10px] text-periwinkle-500"
            >
              {label}
            </div>
          ))}
          {monthGrid.map((d) => {
            const iso = toISO(d);
            const inMonth = d.getMonth() + 1 === month;
            const active = iso === date;
            const isToday = iso === today;
            const completedCount = completedCounts[iso] ?? 0;
            const base =
              'flex h-10 items-center justify-center rounded-full text-sm hover:bg-periwinkle-100';
            const cls = active
              ? `${base} bg-purple-500 text-white hover:bg-purple-500`
              : isToday
                ? `${base} text-purple-500 font-semibold ring-1 ring-purple-500 ring-inset`
                : inMonth
                  ? `${base} text-periwinkle-500`
                  : `${base} text-lavender-gray-300 opacity-40`;
            return (
              <button
                key={iso}
                type="button"
                role="gridcell"
                aria-label={completedLabel(
                  `${d.getMonth() + 1}월 ${d.getDate()}일`,
                  completedCount,
                )}
                aria-selected={active}
                onClick={() => onChange(iso)}
                className={`${cls} flex-col gap-0.5`}
              >
                <span>{d.getDate()}</span>
                <CompletedIndicator count={completedCount} invert={active} />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {week.map((d, i) => {
            const iso = toISO(d);
            const active = iso === date;
            const isToday = iso === today;
            const completedCount = completedCounts[iso] ?? 0;
            const numCls = active
              ? 'flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-medium text-white'
              : isToday
                ? 'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-purple-500 ring-1 ring-purple-500 ring-inset'
                : 'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-periwinkle-500';
            return (
              <button
                key={iso}
                type="button"
                aria-label={completedLabel(
                  `${d.getMonth() + 1}월 ${d.getDate()}일`,
                  completedCount,
                )}
                aria-pressed={active}
                onClick={() => onChange(iso)}
                className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-md py-1 hover:bg-periwinkle-100"
              >
                <span className="text-[10px] font-medium text-periwinkle-400">{DAY_LABELS[i]}</span>
                <span className={numCls}>{d.getDate()}</span>
                <span className="flex h-2 items-center justify-center">
                  <CompletedIndicator count={completedCount} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
