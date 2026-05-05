import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Combobox } from '@/components/ui/Combobox';

type Opt = { id: string; label: string };

const OPTS: Opt[] = [
  { id: '1', label: 'Apple' },
  { id: '2', label: 'Banana' },
  { id: '3', label: 'Cherry' },
];

function renderCombobox(value: Opt | null = null, onChange = vi.fn()) {
  render(
    <Combobox
      options={OPTS}
      value={value}
      onChange={onChange}
      getId={(o) => o.id}
      getLabel={(o) => o.label}
      ariaLabel="과일"
      placeholder="선택"
    />,
  );
  return { onChange };
}

describe('Combobox', () => {
  it('input 에 role="combobox" 와 aria-expanded 부여', () => {
    renderCombobox();
    const input = screen.getByPlaceholderText('선택');
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    fireEvent.focus(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('input 입력 시 옵션 필터링', () => {
    renderCombobox();
    const input = screen.getByPlaceholderText('선택');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'ban' } });
    expect(screen.queryByText('Apple')).toBeNull();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('Esc 키로 닫힘', () => {
    renderCombobox();
    const input = screen.getByPlaceholderText('선택');
    fireEvent.focus(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('옵션 클릭 시 onChange 호출 + close', () => {
    const onChange = vi.fn();
    renderCombobox(null, onChange);
    const input = screen.getByPlaceholderText('선택');
    fireEvent.focus(input);
    fireEvent.mouseDown(screen.getByText('Cherry'));
    expect(onChange).toHaveBeenCalledWith({ id: '3', label: 'Cherry' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('외부 클릭 시 닫힘', () => {
    renderCombobox();
    const input = screen.getByPlaceholderText('선택');
    fireEvent.focus(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    fireEvent.mouseDown(document.body);
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});
