import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { TrainingCapture } from '../features/student/recognition/TrainingCapture.jsx';
import { useSequenceCapture } from '../features/student/recognition/use-sequence-capture.js';
import { fakeCamera, samples } from './attempt-fixture.js';
import { renderHook } from '@testing-library/react';
import { samplePolicy } from '../features/student/recognition/sample-policy.js';

test('solicitar izquierda conserva mano real, consentimiento y revisión pendiente sin usar reflejos', () => {
  const add = vi.fn().mockReturnValue(true);
  const capture = {
    clear: vi.fn(),
    frames: samples[0].frames,
    sessionId: 'session',
    capture: vi.fn(),
  };
  const props = {
    camera: { state: 'live' },
    capture,
    collection: { add },
    letter: 'A',
    onLetter: vi.fn(),
  };
  const view = render(<TrainingCapture {...props} />);
  fireEvent.change(screen.getByLabelText('Código de participante'), {
    target: { value: 'person_01' },
  });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.change(screen.getByLabelText('Mano que se solicita capturar'), {
    target: { value: 'Left' },
  });
  expect(screen.getByRole('button', { name: 'Guardar muestra en memoria' })).toBeDisabled();
  expect(add).not.toHaveBeenCalled();
  const frames = capture.frames.map((frame) => ({ ...frame, hand: 'Left' }));
  view.rerender(<TrainingCapture {...props} capture={{ ...capture, frames }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar muestra en memoria' }));
  expect(add).toHaveBeenCalledWith(
    expect.objectContaining({
      consent: true,
      participantId: 'person_01',
      requestedHand: 'Left',
      label: 'A',
    }),
    frames,
    'session',
  );
  expect(capture.frames[0].hand).toBe('Right');
  const metadata = add.mock.calls[0][0];
  const saved = samplePolicy(false).create(metadata, frames, 'session');
  expect(saved).toMatchObject({
    observedHand: 'Left',
    requestedHand: 'Left',
    reviewStatus: 'PENDING_LSV_REVIEW',
  });
  expect(saved.frames[0].points).toEqual(capture.frames[0].points);
  expect(() => samplePolicy(false).create(metadata, capture.frames, 'session')).toThrow(
    /mano seleccionada/,
  );
});

test('la captura sin mano conserva evidencia de ausencia y repetir limpia esa evidencia', () => {
  vi.useFakeTimers();
  try {
    const camera = fakeCamera();
    const prediction = vi.fn();
    const hook = renderHook(() => useSequenceCapture(camera));
    act(() => hook.result.current.capture(prediction));
    act(() => {
      for (let index = 0; index < 20; index += 1)
        camera.receive({ landmarks: [] }, { time: index * 100, width: 640, height: 480 });
      vi.advanceTimersByTime(3000);
    });
    expect(hook.result.current.feedback).toBe('NO_HAND');
    expect(hook.result.current.error).not.toBe('');
    expect(prediction).not.toHaveBeenCalled();
    act(() => hook.result.current.clear());
    expect(hook.result.current.feedback).toBeNull();
    expect(hook.result.current.error).toBe('');
  } finally {
    vi.useRealTimers();
  }
});
