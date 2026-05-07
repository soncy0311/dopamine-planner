import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../src/Spinner';

describe('Spinner', () => {
  it('기본 (props 미주입) — role="status", aria-label="로딩 중", h-6 w-6 (md)', () => {
    render(<Spinner />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', '로딩 중');
    expect(status.className).toContain('h-6');
    expect(status.className).toContain('w-6');
  });

  it('size="sm" — h-4 w-4', () => {
    render(<Spinner size="sm" />);
    const status = screen.getByRole('status');
    expect(status.className).toContain('h-4');
    expect(status.className).toContain('w-4');
  });

  it('size="lg" — h-10 w-10', () => {
    render(<Spinner size="lg" />);
    const status = screen.getByRole('status');
    expect(status.className).toContain('h-10');
    expect(status.className).toContain('w-10');
  });

  it('variant="fullscreen" — 중앙 정렬 wrapper 노출', () => {
    const { container } = render(<Spinner variant="fullscreen" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('min-h-[60vh]');
    expect(wrapper.className).toContain('items-center');
    expect(wrapper.className).toContain('justify-center');
  });

  it('label 커스텀 시 aria-label 적용', () => {
    render(<Spinner label="데이터 불러오는 중" />);
    expect(screen.getByLabelText('데이터 불러오는 중')).toBeInTheDocument();
  });

  it('motion-reduce:animate-none className 포함 (정적 폴백)', () => {
    render(<Spinner />);
    const status = screen.getByRole('status');
    expect(status.className).toContain('motion-reduce:animate-none');
    expect(status.className).toContain('animate-spin');
  });
});
