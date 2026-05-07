'use client';

import { TodoSection, type TodoSectionProps } from './TodoSection';

type DoneSectionProps = Omit<TodoSectionProps, 'title' | 'status'>;

export function DoneSection(props: DoneSectionProps) {
  return <TodoSection {...props} title="완료" status="done" />;
}
