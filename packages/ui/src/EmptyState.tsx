import type { ComponentType } from 'react';

export type EmptyStateProps = {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 p-8 text-center text-periwinkle-500"
    >
      {Icon ? (
        <span aria-hidden className="text-periwinkle-500">
          <Icon className="h-12 w-12" />
        </span>
      ) : null}
      <p className="text-base font-medium text-black-900">{title}</p>
      {description ? <p className="text-sm text-periwinkle-500">{description}</p> : null}
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 rounded-md bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
