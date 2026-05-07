export type FABProps = {
  onClick: () => void;
  ariaLabel: string;
  className?: string;
};

export function FAB({ onClick, ariaLabel, className }: FABProps) {
  const base =
    'fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg transition-colors hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300';
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={className ? `${base} ${className}` : base}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 5V19M5 12H19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
