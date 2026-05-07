import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateNavigator, buildMonthGrid } from '../src/DateNavigator';

describe('DateNavigator', () => {
  it('헤더 클릭 시 월간 그리드를 펼친다', () => {
    render(<DateNavigator date="2026-05-05" onChange={vi.fn()} />);
    const toggle = screen.getByRole('button', { name: /2026년 5월/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('Esc 키로 펼친 그리드를 닫는다', () => {
    render(<DateNavigator date="2026-05-05" onChange={vi.fn()} />);
    const toggle = screen.getByRole('button', { name: /2026년 5월/ });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('월간 그리드는 6주 × 7열 = 42 셀을 렌더한다', () => {
    render(<DateNavigator date="2026-05-05" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /2026년 5월/ }));
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
  });

  it('주간 모드에서 다음 주 버튼 → +7일', () => {
    const onChange = vi.fn();
    render(<DateNavigator date="2026-05-05" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '다음 주' }));
    expect(onChange).toHaveBeenCalledWith('2026-05-12');
  });

  it('월간 모드에서 다음 달 버튼 → +1개월', () => {
    const onChange = vi.fn();
    render(<DateNavigator date="2026-05-05" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /2026년 5월/ }));
    fireEvent.click(screen.getByRole('button', { name: '다음 달' }));
    expect(onChange).toHaveBeenCalledWith('2026-06-05');
  });
});

describe('buildMonthGrid', () => {
  it('항상 42개 셀을 반환한다', () => {
    const cells = buildMonthGrid(new Date(2026, 4, 1));
    expect(cells).toHaveLength(42);
  });
  it('첫 셀은 그 달 1일 직전 일요일이다', () => {
    const cells = buildMonthGrid(new Date(2026, 4, 1));
    expect(cells[0].getDay()).toBe(0);
  });
});
