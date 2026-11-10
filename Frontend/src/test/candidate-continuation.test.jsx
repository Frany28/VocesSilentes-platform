import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useCandidateContinuation } from '../features/student/recognition/use-candidate-continuation.js';

test('coincidencia experimental avanza una vez, permite quedarse y cancela al apagar cámara', () => {
  vi.useFakeTimers();
  try {
    const onContinue = vi.fn();
    const result = { label: 'A' };
    const hook = renderHook(
      ({ enabled }) => useCandidateContinuation(result, 'A', onContinue, enabled),
      { initialProps: { enabled: true } },
    );
    act(() => vi.advanceTimersByTime(2999));
    expect(onContinue).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onContinue).toHaveBeenCalledTimes(1);
    hook.unmount();
    const held = renderHook(() => useCandidateContinuation(result, 'A', onContinue, true));
    act(() => held.result.current.stay());
    act(() => vi.advanceTimersByTime(3000));
    expect(onContinue).toHaveBeenCalledTimes(1);
    held.unmount();
    const stopped = renderHook(
      ({ enabled }) => useCandidateContinuation(result, 'A', onContinue, enabled),
      { initialProps: { enabled: true } },
    );
    stopped.rerender({ enabled: false });
    act(() => vi.advanceTimersByTime(3000));
    expect(onContinue).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});

test('abstenciones y candidatas de otra letra no hacen avanzar ni aun con un siguiente paso', () => {
  vi.useFakeTimers();
  try {
    const action = vi.fn();
    renderHook(() => useCandidateContinuation({ label: null }, 'A', action, true));
    renderHook(() => useCandidateContinuation({ label: 'E' }, 'A', action, true));
    act(() => vi.advanceTimersByTime(10000));
    expect(action).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
