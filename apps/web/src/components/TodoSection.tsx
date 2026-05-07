'use client';

import { TodoItem } from '@todo-list/ui';
import type { SubIssueWithJoins } from '@todo-list/core';

export type TodoSectionStatus = 'done' | 'todo';

export type TodoSectionProps = {
  title: '완료' | '진행 중';
  status: TodoSectionStatus;
  items: SubIssueWithJoins[];
  onToggle: (item: SubIssueWithJoins) => void;
  onPress?: (item: SubIssueWithJoins) => void;
};

const EMPTY_MESSAGE: Record<TodoSectionStatus, string> = {
  done: '완료된 일이 없어요',
  todo: '진행 중인 일이 없어요',
};

export function TodoSection({ title, status, items, onToggle, onPress }: TodoSectionProps) {
  const sectionClass =
    status === 'done' ? 'flex flex-col gap-2 opacity-50' : 'flex flex-col gap-2';
  return (
    <section className={sectionClass}>
      <header className="flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-black-900">
          {title} ({items.length})
        </h3>
      </header>
      {items.length === 0 ? (
        <p className="px-2 py-3 text-sm text-periwinkle-300">{EMPTY_MESSAGE[status]}</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.id}>
              <TodoItem
                id={item.id}
                title={item.title}
                status={status}
                priority={item.priority}
                carryOverCount={item.carryOverCount}
                category={
                  item.category
                    ? { name: item.category.name, color: item.category.color }
                    : undefined
                }
                onToggle={() => onToggle(item)}
                onPress={onPress ? () => onPress(item) : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
