import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilterChips } from '@/components/CategoryFilterChips';

const CATS = [
  { id: 'a', name: 'Work' },
  { id: 'b', name: 'Life' },
];

describe('CategoryFilterChips', () => {
  it('전체 필터일 때 "전체" chip 만 활성', () => {
    render(
      <CategoryFilterChips
        categories={CATS}
        selected={{ kind: 'all' }}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Work/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('카테고리 chip 클릭 시 category filter 호출', () => {
    const onSelect = vi.fn();
    render(
      <CategoryFilterChips
        categories={CATS}
        selected={{ kind: 'all' }}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Work/ }));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'category', id: 'a' });
  });

  it('selected category 일치 chip 만 aria-pressed=true', () => {
    render(
      <CategoryFilterChips
        categories={CATS}
        selected={{ kind: 'category', id: 'b' }}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /Life/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('분류 없음 chip 은 별도 필터로 호출된다', () => {
    const onSelect = vi.fn();
    render(
      <CategoryFilterChips
        categories={CATS}
        selected={{ kind: 'all' }}
        showUncategorized
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '분류 없음' }));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'uncategorized' });
  });
});
