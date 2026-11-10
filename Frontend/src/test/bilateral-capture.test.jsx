import { act, renderHook, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { TrainingCapture } from '../features/student/recognition/TrainingCapture.jsx';
import { useSequenceCapture } from '../features/student/recognition/use-sequence-capture.js';
import { syntheticRecording } from '../../../Backend/tests/fixtures/lsv-synthetic.js';
import { mirrorFrames } from '../../../shared/lsv/handedness.js';

test('cambiar de mano cancela el intento pendiente y evita respuestas tardías sin cerrar la cámara', () => {
  vi.useFakeTimers();
  try {
    const unsubscribe = vi.fn();
    const hook = renderHook(() =>
      useSequenceCapture({ state: 'live', sessionId: 'camera', subscribe: () => unsubscribe }),
    );
    const predict = vi.fn();
    act(() => hook.result.current.capture(predict));
    act(() => hook.result.current.cancel());
    act(() => vi.advanceTimersByTime(3000));
    expect(hook.result.current.pending).toBe(false);
    expect(hook.result.current.frames).toBeNull();
    expect(predict).not.toHaveBeenCalled();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});

test('el laboratorio captura lateralidad automáticamente y no convierte el clic en un callback', async () => {
  const capture = { capture: vi.fn(), clear: vi.fn(), frames: null, pending: false };
  render(
    <TrainingCapture
      camera={{ state: 'live' }}
      capture={capture}
      collection={{ experimental: true }}
      letter="A"
      onLetter={vi.fn()}
    />,
  );
  await userEvent.type(screen.getByLabelText('Código de participante'), 'p01');
  await userEvent.click(screen.getByRole('checkbox'));
  expect(screen.queryByLabelText('Lateralidad de captura')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Capturar muestra' }));
  expect(capture.capture).toHaveBeenCalledWith();
});

test.each(['Left', 'Right'])(
  'captura %s automáticamente y conserva un identificador local estable',
  (hand) => {
    vi.useFakeTimers();
    try {
      let receive;
      const camera = {
        state: 'live',
        sessionId: 'test_session',
        subscribe: (callback) => {
          receive = callback;
          return vi.fn();
        },
      };
      const hook = renderHook(() => useSequenceCapture(camera));
      const frames = syntheticRecording('A', 'train').frames;
      const input = hand === 'Left' ? mirrorFrames(frames) : frames;
      const deliver = () => {
        const origin = performance.now();
        for (const frame of input)
          receive(
            {
              landmarks: [frame.points.map(([x, y, z]) => ({ x, y, z }))],
              handedness: [[{ categoryName: frame.hand }]],
            },
            { time: origin + frame.t, width: 640, height: 480 },
          );
        vi.advanceTimersByTime(3000);
      };
      act(() => hook.result.current.capture());
      act(deliver);
      expect(hook.result.current.frames).toHaveLength(18);
      expect(new Set(hook.result.current.frames.map((f) => f.trackId)).size).toBe(1);
      expect(hook.result.current.frames[0].hand).toBe(hand);
      hook.unmount();
    } finally {
      vi.useRealTimers();
    }
  },
);
