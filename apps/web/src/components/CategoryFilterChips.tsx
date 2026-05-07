'use client';

export type CategoryFilterChipsCategory = {
  id: string;
  name: string;
};

export type CategoryFilterChipsProps = {
  categories: CategoryFilterChipsCategory[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function CategoryFilterChips({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterChipsProps) {
  return (
    <div
      role="toolbar"
      aria-label="카테고리 필터"
      className="flex items-center gap-2 overflow-x-auto px-1 py-1 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      <button
        type="button"
        aria-pressed={selectedId === null}
        onClick={() => onSelect(null)}
        className={
          selectedId === null
            ? 'flex h-8 shrink-0 items-center rounded-full bg-purple-500 px-3 text-xs font-semibold text-white'
            : 'flex h-8 shrink-0 items-center rounded-full bg-periwinkle-100 px-3 text-xs font-medium text-periwinkle-500 hover:bg-periwinkle-200'
        }
      >
        전체
      </button>
      {categories.map((cat) => {
        const active = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(cat.id)}
            className={
              active
                ? 'flex h-8 shrink-0 items-center rounded-full bg-purple-500 px-3 text-xs font-semibold text-white'
                : 'flex h-8 shrink-0 items-center rounded-full bg-periwinkle-100 px-3 text-xs font-medium text-periwinkle-500 hover:bg-periwinkle-200'
            }
          >
            <span className="truncate max-w-[8rem]">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
