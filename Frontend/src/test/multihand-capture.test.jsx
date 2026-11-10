import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useSequenceCapture } from '../features/student/recognition/use-sequence-capture.js';
import { trackedFixture } from '../../../Backend/tests/fixtures/tracked-hands.js';

test('el piloto rechaza dos manos conservando ambos canales para inferencia futura', () => {
  vi.useFakeTimers();
  try {
    let receive;
    const hook = renderHook(() =>
      useSequenceCapture({
        state: 'live',
        sessionId: 'both',
        subscribe: (fn) => {
          receive = fn;
          return vi.fn();
        },
      }),
    );
    const origin = performance.now();
    act(() => hook.result.current.capture());
    const fixture = trackedFixture({ both: true });
    act(() => {
      for (const frame of fixture.frames)
        receive({ tracking: frame }, { time: origin + frame.t, width: 640, height: 480 });
      vi.advanceTimersByTime(3000);
    });
    expect(hook.result.current.frames).toBeNull();
    expect(hook.result.current.error).toContain('solo una mano');
    expect(hook.result.current.sequence.frames[5].hands.Left.points).toHaveLength(21);
    expect(hook.result.current.sequence.frames[5].hands.Right.points).toHaveLength(21);
    expect(hook.result.current.sequence.frames[5].hands.Left.trackId).not.toBe(
      hook.result.current.sequence.frames[5].hands.Right.trackId,
    );
  } finally {
    vi.useRealTimers();
  }
});

test('el inicio temporal usa el primer frame observado aunque RAF preceda al reloj de una acción', () => {
  vi.useFakeTimers();
  try {
    vi.advanceTimersByTime(100);
    let receive;
    const hook = renderHook(() =>
      useSequenceCapture({
        state: 'live',
        sessionId: 'clock',
        subscribe: (fn) => {
          receive = fn;
          return vi.fn();
        },
      }),
    );
    act(() => hook.result.current.capture());
    act(() => {
      for (const frame of trackedFixture().frames)
        receive({ tracking: frame }, { time: 95 + frame.t, width: 640, height: 480 });
      vi.advanceTimersByTime(3000);
    });
    expect(hook.result.current.sequence.frames[0].t).toBe(0);
    expect(hook.result.current.frames).toHaveLength(18);
    expect(hook.result.current.error).toBe('');
  } finally {
    vi.useRealTimers();
  }
});
