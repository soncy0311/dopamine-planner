import { useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type DateNavigatorProps = {
  date: string;
  onChange: (date: string) => void;
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

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const current = parseISO(date);
  const year = current.getFullYear();
  const month = current.getMonth() + 1;

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
          <span aria-hidden="true">←</span>
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
          <span aria-hidden="true">→</span>
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
            const base =
              'flex h-9 items-center justify-center rounded-md text-sm hover:bg-periwinkle-100';
            const cls = active
              ? `${base} bg-purple-500 text-white hover:bg-purple-500`
              : inMonth
                ? `${base} text-periwinkle-500`
                : `${base} text-lavender-gray-300 opacity-40`;
            return (
              <button
                key={iso}
                type="button"
                role="gridcell"
                aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일`}
                aria-selected={active}
                onClick={() => onChange(iso)}
                className={cls}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {week.map((d, i) => {
            const iso = toISO(d);
            const active = iso === date;
            return (
              <button
                key={iso}
                type="button"
                aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일`}
                aria-pressed={active}
                onClick={() => onChange(iso)}
                className={
                  active
                    ? 'flex h-11 flex-col items-center justify-center rounded-md bg-purple-500 text-white'
                    : 'flex h-11 flex-col items-center justify-center rounded-md text-periwinkle-500 hover:bg-periwinkle-100'
                }
              >
                <span className="text-[10px]">{DAY_LABELS[i]}</span>
                <span className="text-sm font-medium">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
