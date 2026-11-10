import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useModelAttempt } from '../features/student/recognition/use-model-attempt.js';
import { hasRealHandExamples } from '../features/student/recognition/practice-hand-support.js';
import { fakeCamera } from './attempt-fixture.js';

const centered = Array.from({ length: 21 }, (_, i) => ({
  x: 0.35 + (i % 5) * 0.07,
  y: 0.35 + Math.floor(i / 5) * 0.07,
  z: 0,
}));

test.each(['Left', 'Right'])(
  'captura %s sin selección previa y deja abstenciones al clasificador',
  (hand) => {
    const camera = fakeCamera();
    const capture = { capture: vi.fn(), clear: vi.fn() };
    const operation = {
      model: {
        labels: ['A', 'NONE'],
        prototypes: [
          { hand: 'Right', label: 'A' },
          { hand: 'Right', label: 'NONE' },
        ],
      },
      clear: vi.fn(),
      predict: vi.fn(),
    };
    vi.useFakeTimers();
    try {
      renderHook(() =>
        useModelAttempt({
          camera,
          capture,
          operation,
          target: 'A',
          lab: false,
        }),
      );
      const feed = (hand) => {
        for (let i = 0; i < 12; i += 1) {
          camera.receive(
            { landmarks: [centered], handedness: [[{ categoryName: hand }]] },
            { time: performance.now(), width: 640, height: 480 },
          );
          vi.advanceTimersByTime(100);
        }
      };
      act(() => feed(hand));
      expect(capture.capture).toHaveBeenCalledWith(operation.predict, expect.any(Number));
      expect(operation.predict).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  },
);

test('reflejos de entrenamiento por sí solos no habilitan reconocimiento estudiantil de la otra mano', () => {
  const model = {
    labels: ['A', 'NONE'],
    augmentation: { transform: 'HORIZONTAL_REFLECTION' },
    prototypes: [
      { label: 'A', hand: 'Left' },
      { label: 'NONE', hand: 'Left' },
    ],
    sampleAudit: [{ label: 'A', hand: 'Right', sampleKind: 'REAL' }],
  };
  expect(hasRealHandExamples(model, 'A', 'Left')).toBe(false);
  model.sampleAudit.push(
    { label: 'A', hand: 'Left', sampleKind: 'REAL' },
    { label: 'NONE', hand: 'Left', sampleKind: 'REAL' },
  );
  expect(hasRealHandExamples(model, 'A', 'Left')).toBe(true);
});

test('detener la cámara cancela la cuenta atrás y no dispara una captura tardía', () => {
  vi.useFakeTimers();
  try {
    const camera = fakeCamera();
    const capture = { capture: vi.fn(), clear: vi.fn() };
    const hook = renderHook(() =>
      useModelAttempt({
        camera,
        capture,
        operation: { clear: vi.fn(), loading: false },
        target: 'A',
        lab: false,
      }),
    );
    act(() => hook.result.current.manual());
    expect(hook.result.current.countdown.count).toBe(3);
    act(() => camera.receive(null));
    expect(hook.result.current.countdown.count).toBeNull();
    act(() => vi.advanceTimersByTime(5000));
    expect(capture.capture).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
