import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoItem } from '../src/TodoItem';

describe('TodoItem', () => {
  const baseProps = {
    id: 't1',
    title: '할 일',
    status: 'todo' as const,
    onToggle: vi.fn(),
  };

  it('priority="high" 일 때 High badge 를 노출한다', () => {
    render(<TodoItem {...baseProps} priority="high" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('priority 가 null/undefined 면 badge 를 노출하지 않는다', () => {
    render(<TodoItem {...baseProps} priority={null} />);
    expect(screen.queryByText('High')).toBeNull();
    expect(screen.queryByText('Medium')).toBeNull();
    expect(screen.queryByText('Low')).toBeNull();
  });

  it('carryOverCount > 0 이면 +N 뱃지 + aria-label="이월 N회"', () => {
    render(<TodoItem {...baseProps} carryOverCount={3} />);
    const badge = screen.getByLabelText('이월 3회');
    expect(badge).toHaveTextContent('+3');
  });

  it('carryOverCount === 0 이면 +N 뱃지를 노출하지 않는다', () => {
    render(<TodoItem {...baseProps} carryOverCount={0} />);
    expect(screen.queryByText(/^\+/)).toBeNull();
  });
});
