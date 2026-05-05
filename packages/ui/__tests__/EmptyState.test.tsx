import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../src/EmptyState';

describe('EmptyState', () => {
  it('title 만 주입 시 정상 렌더 + role="status" 적용', () => {
    render(<EmptyState title="아직 할 일이 없어요" />);
    expect(screen.getByText('아직 할 일이 없어요')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('description 추가 시 보조 텍스트 노출', () => {
    render(<EmptyState title="t" description="새 투두를 만들어 시작해보세요" />);
    expect(screen.getByText('새 투두를 만들어 시작해보세요')).toBeInTheDocument();
  });

  it('action 주입 시 버튼 노출 + 클릭 시 onClick 호출', () => {
    const onClick = vi.fn();
    render(<EmptyState title="t" action={{ label: '만들기', onClick }} />);
    const button = screen.getByRole('button', { name: '만들기' });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('icon 주입 시 컴포넌트 렌더 + aria-hidden 적용', () => {
    const Icon = ({ className }: { className?: string }) => (
      <svg data-testid="icon" className={className} />
    );
    render(<EmptyState title="t" icon={Icon} />);
    const icon = screen.getByTestId('icon');
    expect(icon).toBeInTheDocument();
    const iconWrapper = icon.parentElement;
    expect(iconWrapper).not.toBeNull();
    expect(iconWrapper).toHaveAttribute('aria-hidden');
  });

  it('action 미주입 시 버튼이 없다', () => {
    render(<EmptyState title="t" description="d" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
