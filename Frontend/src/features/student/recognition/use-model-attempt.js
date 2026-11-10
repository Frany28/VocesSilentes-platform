import { useCaptureCountdown } from './use-capture-countdown.js';
import { useAutoCapture } from './use-auto-capture.js';
import { attemptStatus } from './attempt-status.js';
import { recognitionSupports } from './recognition-support.js';
import { useEffect } from 'react';

/**
 * Coordina captura automática e inferencia por la lateralidad observada, sin selector ni calificación.
 * @param {{operation: object, capture: object, camera: object, target?: string, lab: boolean}} options Estado real.
 * @returns {object} Acciones y estados del intento; la falta de cobertura produce abstención del modelo.
 */
export function useModelAttempt({ operation, capture, camera, target, lab }) {
  const auto = !lab;
  const countdown = useCaptureCountdown();
  const { subscribe } = camera;
  const { cancel } = countdown;
  useEffect(
    () =>
      subscribe((result) => {
        if (!result) cancel();
      }),
    [subscribe, cancel],
  );
  const supported = recognitionSupports(target, operation.model);
  const busy = capture.pending || countdown.count !== null;
  const preparing = !operation.model && operation.loading;
  const live = camera.state === 'live';
  const capturing = (after) => {
    operation.clear();
    capture.clear();
    capture.capture(operation.model ? operation.predict : undefined, after);
  };
  const automatic = useAutoCapture(camera, {
    enabled: auto && supported && live && !busy && !preparing,
    onTrigger: capturing,
  });
  return {
    auto,
    countdown,
    busy,
    preparing,
    live,
    supported,
    automatic,
    manual: () => countdown.start(() => capturing()),
    shown: operation.result && operation.result.frames === capture.frames,
    status: attemptStatus({
      ...countdown,
      ...capture,
      preparing,
      live,
      auto,
      phase: automatic.phase,
    }),
  };
}
