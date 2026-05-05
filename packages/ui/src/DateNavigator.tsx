import { useEffect, useMemo } from 'react';

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

function startOfWeekSunday(iso: string): Date {
  const d = parseISO(iso);
  const dow = d.getDay();
  d.setDate(d.getDate() - dow);
  return d;
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const current = parseISO(date);
  const year = current.getFullYear();
  const month = current.getMonth() + 1;

  const week = useMemo(() => {
    const start = startOfWeekSunday(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [date]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
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
  }, [date, onChange]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 날짜"
          onClick={() => onChange(addDays(date, -1))}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-periwinkle-100"
        >
          <span aria-hidden="true">←</span>
        </button>
        <h2 className="text-lg font-semibold text-periwinkle-500">
          {year}년 {month}월
        </h2>
        <button
          type="button"
          aria-label="다음 날짜"
          onClick={() => onChange(addDays(date, 1))}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-periwinkle-100"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
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
    </div>
  );
}
