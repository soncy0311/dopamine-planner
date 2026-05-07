import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounceByEpic } from '../hooks/useToggleTodo';

describe('debounceByEpic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('동일 키의 200ms 내 5회 호출은 1회로 합쳐진다', () => {
    const fn = vi.fn();
    const debounced = debounceByEpic<string>(200, fn);

    for (let i = 0; i < 5; i++) {
      debounced('ep-1', 'ep-1');
      vi.advanceTimersByTime(50);
    }

    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('ep-1');
  });

  it('서로 다른 키는 독립 타이머로 각각 1회 호출된다', () => {
    const fn = vi.fn();
    const debounced = debounceByEpic<string>(200, fn);

    debounced('ep-1', 'ep-1');
    debounced('ep-2', 'ep-2');

    vi.advanceTimersByTime(250);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith('ep-1');
    expect(fn).toHaveBeenCalledWith('ep-2');
  });

  it('동일 키의 호출이 200ms 간격을 넘으면 각각 실행된다', () => {
    const fn = vi.fn();
    const debounced = debounceByEpic<string>(200, fn);

    debounced('ep-1', 'ep-1');
    vi.advanceTimersByTime(250);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced('ep-1', 'ep-1');
    vi.advanceTimersByTime(250);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
