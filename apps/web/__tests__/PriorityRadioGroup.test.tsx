import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PriorityRadioGroup } from '@/components/ui/PriorityRadioGroup';

describe('PriorityRadioGroup', () => {
  it('기본 라벨 "우선순위" radiogroup 노출', () => {
    render(<PriorityRadioGroup value="medium" onChange={vi.fn()} />);
    expect(screen.getByRole('radiogroup', { name: '우선순위' })).toBeInTheDocument();
  });

  it('value 와 일치하는 옵션만 aria-checked=true', () => {
    render(<PriorityRadioGroup value="medium" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: 'High' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'Medium' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Low' })).toHaveAttribute('aria-checked', 'false');
  });

  it('ArrowRight → 다음 priority 로 onChange', () => {
    const onChange = vi.fn();
    render(<PriorityRadioGroup value="medium" onChange={onChange} />);
    const group = screen.getByRole('radiogroup', { name: '우선순위' });
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('low');
  });

  it('ArrowLeft → 이전 priority 로 onChange', () => {
    const onChange = vi.fn();
    render(<PriorityRadioGroup value="medium" onChange={onChange} />);
    const group = screen.getByRole('radiogroup', { name: '우선순위' });
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('high');
  });

  it('첫 옵션에서 ArrowLeft → wrap 으로 마지막 옵션', () => {
    const onChange = vi.fn();
    render(<PriorityRadioGroup value="high" onChange={onChange} />);
    const group = screen.getByRole('radiogroup', { name: '우선순위' });
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('low');
  });

  it('클릭 시 onChange', () => {
    const onChange = vi.fn();
    render(<PriorityRadioGroup value="medium" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'High' }));
    expect(onChange).toHaveBeenCalledWith('high');
  });
});
