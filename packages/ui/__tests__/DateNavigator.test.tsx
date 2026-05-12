import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  DateNavigator,
  buildMonthGrid,
  getCompletedEpicDotCount,
  getCompletedEpicStarCount,
} from '../src/DateNavigator';

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

  it('완료 Epic 이 있는 날짜만 aria-label 에 완료 개수를 추가한다', () => {
    render(
      <DateNavigator
        date="2026-05-05"
        onChange={vi.fn()}
        completedCounts={{ '2026-05-05': 3 }}
      />,
    );

    expect(
      screen.getByRole('button', { name: '5월 5일, 완료 Epic 3개' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5월 6일' })).toBeInTheDocument();
  });

  it('indicator 규칙은 1~4개 점, 5개 이상은 5개당 별표만 표시한다', () => {
    expect(getCompletedEpicDotCount(0)).toBe(0);
    expect(getCompletedEpicStarCount(0)).toBe(0);
    expect(getCompletedEpicDotCount(4)).toBe(4);
    expect(getCompletedEpicStarCount(4)).toBe(0);
    expect(getCompletedEpicDotCount(5)).toBe(0);
    expect(getCompletedEpicStarCount(5)).toBe(1);
    expect(getCompletedEpicDotCount(6)).toBe(0);
    expect(getCompletedEpicStarCount(6)).toBe(1);
    expect(getCompletedEpicDotCount(9)).toBe(0);
    expect(getCompletedEpicStarCount(9)).toBe(1);
    expect(getCompletedEpicDotCount(10)).toBe(0);
    expect(getCompletedEpicStarCount(10)).toBe(2);
  });

  it('indicator 는 보조기기에서 중복으로 읽히지 않는다', () => {
    render(
      <DateNavigator
        date="2026-05-05"
        onChange={vi.fn()}
        completedCounts={{ '2026-05-05': 1, '2026-05-06': 6 }}
      />,
    );

    const indicators = screen.getAllByTestId('completed-epic-indicator');
    expect(indicators[0]).toHaveAttribute('aria-hidden', 'true');
    expect(indicators[0]).toHaveAttribute('data-dot-count', '1');
    expect(indicators[1]).toHaveAttribute('aria-hidden', 'true');
    expect(indicators[1]).toHaveAttribute('data-star-count', '1');
    expect(indicators[1]).toHaveAttribute('data-dot-count', '0');
  });

  it('주간 UI 에서는 선택된 날짜에서도 indicator 색상은 보라색으로 유지된다', () => {
    render(
      <DateNavigator
        date="2026-05-05"
        onChange={vi.fn()}
        completedCounts={{ '2026-05-05': 1 }}
      />,
    );

    expect(screen.getByTestId('completed-epic-indicator').firstChild).toHaveClass(
      'bg-purple-500',
    );
  });

  it('월간 UI 에서는 선택된 날짜 indicator 색상이 흰색으로 바뀐다', () => {
    render(
      <DateNavigator
        date="2026-05-05"
        onChange={vi.fn()}
        completedCounts={{ '2026-05-05': 1 }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /2026년 5월/ }));

    expect(screen.getByTestId('completed-epic-indicator').firstChild).toHaveClass(
      'bg-white',
    );
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
