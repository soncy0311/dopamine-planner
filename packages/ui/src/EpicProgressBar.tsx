export type EpicProgressBarProps = {
  total: number;
  done: number;
  segments?: boolean;
};

export function EpicProgressBar({ total, done, segments = true }: EpicProgressBarProps) {
  const safeTotal = Math.max(0, total);
  const safeDone = Math.min(Math.max(0, done), safeTotal);

  if (segments && safeTotal > 0) {
    return (
      <div
        role="progressbar"
        aria-valuenow={safeDone}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        className="flex h-2 w-full gap-1"
      >
        {Array.from({ length: safeTotal }).map((_, i) => (
          <span
            key={i}
            className={
              i < safeDone
                ? 'h-full flex-1 rounded-sm bg-purple-500'
                : 'h-full flex-1 rounded-sm bg-periwinkle-200'
            }
          />
        ))}
      </div>
    );
  }

  const ratio = safeTotal > 0 ? safeDone / safeTotal : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={safeDone}
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      className="h-2 w-full overflow-hidden rounded-sm bg-periwinkle-200"
    >
      <span
        className="block h-full bg-purple-500 transition-all"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
