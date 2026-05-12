'use client';

export type CategoryFilterChipsCategory = {
  id: string;
  name: string;
};

export type CategoryFilterValue =
  | { kind: 'all' }
  | { kind: 'uncategorized' }
  | { kind: 'category'; id: string };

export type CategoryFilterChipsProps = {
  categories: CategoryFilterChipsCategory[];
  selected: CategoryFilterValue;
  showUncategorized?: boolean;
  onSelect: (value: CategoryFilterValue) => void;
};

export function CategoryFilterChips({
  categories,
  selected,
  showUncategorized = false,
  onSelect,
}: CategoryFilterChipsProps) {
  const isAll = selected.kind === 'all';
  const isUncategorized = selected.kind === 'uncategorized';
  return (
    <div
      role="toolbar"
      aria-label="카테고리 필터"
      className="flex items-center gap-2 overflow-x-auto px-1 py-1 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      <button
        type="button"
        aria-pressed={isAll}
        onClick={() => onSelect({ kind: 'all' })}
        className={
          isAll
            ? 'flex h-8 shrink-0 items-center rounded-full border border-purple-100 bg-purple-100 px-3 text-xs font-semibold text-purple-700'
            : 'flex h-8 shrink-0 items-center rounded-full border border-periwinkle-200 bg-white px-3 text-xs font-medium text-periwinkle-500 hover:bg-periwinkle-100'
        }
      >
        전체
      </button>
      {showUncategorized ? (
        <button
          type="button"
          aria-pressed={isUncategorized}
          onClick={() => onSelect({ kind: 'uncategorized' })}
          className={
            isUncategorized
              ? 'flex h-8 shrink-0 items-center rounded-full border border-purple-100 bg-purple-100 px-3 text-xs font-semibold text-purple-700'
              : 'flex h-8 shrink-0 items-center rounded-full border border-periwinkle-200 bg-white px-3 text-xs font-medium text-periwinkle-500 hover:bg-periwinkle-100'
          }
        >
          분류 없음
        </button>
      ) : null}
      {categories.map((cat) => {
        const active = selected.kind === 'category' && selected.id === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect({ kind: 'category', id: cat.id })}
            className={
              active
                ? 'flex h-8 shrink-0 items-center rounded-full border border-purple-100 bg-purple-100 px-3 text-xs font-semibold text-purple-700'
                : 'flex h-8 shrink-0 items-center rounded-full border border-periwinkle-200 bg-white px-3 text-xs font-medium text-periwinkle-500 hover:bg-periwinkle-100'
            }
          >
            <span className="truncate max-w-[8rem]">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
