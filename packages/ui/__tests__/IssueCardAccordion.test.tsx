import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IssueCardAccordion, type IssueCardAccordionProps } from '../src/IssueCardAccordion';

function makeProps(overrides: Partial<IssueCardAccordionProps> = {}): IssueCardAccordionProps {
  return {
    epicId: 'ep-1',
    title: '5월 정리',
    progressPercent: 50,
    segments: [{ filled: true }, { filled: false }],
    category: { name: '집안일', color: '#ff0000' },
    expanded: false,
    onToggleExpand: vi.fn(),
    onMainToggle: vi.fn(),
    mainStatus: 'todo',
    subIssues: [
      {
        id: 's-1',
        title: 'sub 1',
        status: 'done',
        onToggle: vi.fn(),
      },
      {
        id: 's-2',
        title: 'sub 2',
        status: 'todo',
        onToggle: vi.fn(),
      },
    ],
    ...overrides,
  };
}

describe('IssueCardAccordion', () => {
  it('expanded=false 일 때 sub-issue body 를 렌더하지 않는다', () => {
    render(<IssueCardAccordion {...makeProps({ expanded: false })} />);
    expect(screen.queryByText('sub 1')).toBeNull();
    expect(screen.queryByText('sub 2')).toBeNull();
  });

  it('expanded=true 일 때 모든 sub-issue 가 렌더된다', () => {
    render(<IssueCardAccordion {...makeProps({ expanded: true })} />);
    expect(screen.getByText('sub 1')).toBeInTheDocument();
    expect(screen.getByText('sub 2')).toBeInTheDocument();
  });

  it('progressPercent 가 헤더에 그대로 표시된다', () => {
    render(<IssueCardAccordion {...makeProps({ progressPercent: 73 })} />);
    expect(screen.getByText('73%')).toBeInTheDocument();
  });

  it('chevron 클릭 시 onToggleExpand 가 호출된다', () => {
    const onToggleExpand = vi.fn();
    render(<IssueCardAccordion {...makeProps({ onToggleExpand })} />);
    fireEvent.click(screen.getByRole('button', { name: '펼치기' }));
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
  });

  it('expanded=true 일 때 chevron 의 aria-expanded 와 rotate-90 className 이 적용된다', () => {
    const { container } = render(
      <IssueCardAccordion {...makeProps({ expanded: true })} />,
    );
    const btn = screen.getByRole('button', { name: '접기' });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    const svg = container.querySelector('button[aria-expanded="true"] svg');
    expect(svg?.getAttribute('class')).toContain('rotate-90');
  });

  it('메인 체크 클릭 시 onMainToggle 이 호출된다', () => {
    const onMainToggle = vi.fn();
    render(<IssueCardAccordion {...makeProps({ onMainToggle })} />);
    // 헤더는 TodoItem 마크업 — checkbox aria-label = "완료" / "완료 해제"
    fireEvent.click(screen.getAllByRole('button', { name: '완료' })[0]);
    expect(onMainToggle).toHaveBeenCalledTimes(1);
  });

  it('mainStatus="done" 일 때 메인 체크 button 의 aria-pressed=true', () => {
    render(<IssueCardAccordion {...makeProps({ mainStatus: 'done' })} />);
    expect(screen.getAllByRole('button', { name: '완료 해제' })[0]).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('카테고리 prop 이 있으면 이름이 노출된다', () => {
    render(<IssueCardAccordion {...makeProps()} />);
    expect(screen.getByText('집안일')).toBeInTheDocument();
  });

  it('priority="high" 일 때 헤더에 High 배지를 노출한다 (sub-prd-10 §3.2)', () => {
    render(<IssueCardAccordion {...makeProps({ priority: 'high' })} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('priority 부재 시 priority badge 미노출', () => {
    render(<IssueCardAccordion {...makeProps()} />);
    expect(screen.queryByText('High')).toBeNull();
    expect(screen.queryByText('Medium')).toBeNull();
    expect(screen.queryByText('Low')).toBeNull();
  });
});
