import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useSequenceCapture } from '../features/student/recognition/use-sequence-capture.js';
import { syntheticRecording } from '../../../Backend/tests/fixtures/lsv-synthetic.js';

test('captura solo por acción, valida continuidad y conserva la sesión de origen de los puntos', () => {
  vi.useFakeTimers();
  try {
    let receive;
    const unsubscribe = vi.fn();
    const camera = {
      state: 'live',
      sessionId: 'original_session',
      subscribe: (listener) => {
        receive = listener;
        return unsubscribe;
      },
    };
    const hook = renderHook(() => useSequenceCapture(camera));
    expect(receive).toBeUndefined();
    const origin = performance.now();
    act(() => hook.result.current.capture());
    const fixture = syntheticRecording('A', 'train');
    act(() => {
      for (const frame of fixture.frames)
        receive(
          {
            landmarks: [frame.points.map(([x, y, z]) => ({ x, y, z }))],
            handedness: [[{ categoryName: frame.hand }]],
          },
          { time: origin + frame.t, width: 640, height: 480 },
        );
      vi.advanceTimersByTime(3000);
    });
    camera.sessionId = 'later_session';
    expect(hook.result.current.frames).toHaveLength(18);
    expect(hook.result.current.sequence.frames).toHaveLength(20);
    expect(hook.result.current.sessionId).toBe('original_session');
    expect(hook.result.current.pending).toBe(false);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});

test('detener la cámara durante la captura descarta el intento y cancela el temporizador', () => {
  vi.useFakeTimers();
  try {
    let receive;
    const unsubscribe = vi.fn();
    const hook = renderHook(() =>
      useSequenceCapture({
        state: 'live',
        sessionId: 'test_session',
        subscribe: (listener) => {
          receive = listener;
          return unsubscribe;
        },
      }),
    );
    act(() => hook.result.current.capture());
    act(() => receive(null));
    act(() => vi.advanceTimersByTime(3000));
    expect(hook.result.current.frames).toBeNull();
    expect(hook.result.current.error).toContain('canceló');
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});
