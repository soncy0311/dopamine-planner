import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilterChips } from '@/components/CategoryFilterChips';

const CATS = [
  { id: 'a', name: 'Work' },
  { id: 'b', name: 'Life' },
];

describe('CategoryFilterChips', () => {
  it('selectedId === null 일 때 "전체" chip 만 활성', () => {
    render(<CategoryFilterChips categories={CATS} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Work/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('카테고리 chip 클릭 시 onSelect(id) 호출', () => {
    const onSelect = vi.fn();
    render(<CategoryFilterChips categories={CATS} selectedId={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Work/ }));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('selectedId 일치 chip 만 aria-pressed=true', () => {
    render(<CategoryFilterChips categories={CATS} selectedId="b" onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /Life/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
