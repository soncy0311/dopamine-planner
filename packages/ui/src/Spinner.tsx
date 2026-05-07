export type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'fullscreen';
  label?: string;
};

const SIZE_CLASS: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export function Spinner({ size = 'md', variant = 'inline', label = '로딩 중' }: SpinnerProps) {
  const sizeClass = SIZE_CLASS[size];
  const motionClass = 'animate-spin motion-reduce:animate-none';

  const spinner = (
    <span
      role="status"
      aria-label={label}
      className={`inline-block ${sizeClass} ${motionClass} text-purple-500`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="3"
        />
        <path
          d="M22 12a10 10 0 0 1-10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">{spinner}</div>
    );
  }
  return spinner;
}
