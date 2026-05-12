export type EpicProgressBarProps = {
  total: number;
  done: number;
};

export function EpicProgressBar({ total, done }: EpicProgressBarProps) {
  const safeTotal = Math.max(0, total);
  const safeDone = Math.min(Math.max(0, done), safeTotal);

  if (safeTotal <= 0) return null;

  const ratio = safeDone / safeTotal;
  const percent = Math.round((safeDone / safeTotal) * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={safeDone}
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuetext={`전체 ${safeTotal}개 중 ${safeDone}개 완료 (${percent}%)`}
      className="h-2 w-full overflow-hidden rounded-full bg-periwinkle-100"
    >
      <span
        className="block h-full rounded-full bg-purple-500 transition-all"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
