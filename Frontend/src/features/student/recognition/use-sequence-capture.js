import { useEffect, useRef, useState } from 'react';
import { createHandTracker } from '../../../../../shared/lsv/hand-tracker.js';
import { validateHandSequence, singleHandFrames } from '../../../../../shared/lsv/hand-sequence.js';

/**
 * Captura tres segundos de puntos de una mano solo por acción explícita; no graba vídeo ni envía datos.
 * @param {object} camera Detector local y canal de frames.
 * @returns {object} Intento temporal, error, captura y descarte; cada muestra exige continuidad real.
 */
export function useSequenceCapture(camera) {
  const active = useRef(null);
  const [pending, setPending] = useState(false);
  const [frames, setFrames] = useState(null);
  const [sequence, setSequence] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  useEffect(() => () => active.current?.cancel(), []);
  // onFrames recibe el intento válido al terminar (p. ej. para analizarlo sin otro clic).
  // after: marca del frame que disparó una captura automática; ese frame y los anteriores no cuentan.
  const capture = (onFrames, after = -Infinity, expectedHands = 1) => {
    if (active.current || camera.state !== 'live') return;
    setFrames(null);
    setSequence(null);
    setSessionId(camera.sessionId);
    setError('');
    setPending(true);
    const samples = [];
    const tracker = createHandTracker(crypto.randomUUID());
    let firstTime = null;
    let timer;
    const unsubscribe = camera.subscribe((result, timing) => {
      if (!result) {
        active.current?.cancel();
        active.current = null;
        setPending(false);
        setError('La captura se canceló al detener la cámara.');
        return;
      }
      // useHandCamera reparte con Set.forEach, que también entrega el frame en curso a quien se
      // suscribe durante el reparto: el frame que disparó la captura automática no es del intento.
      if (timing.time <= after) return;
      firstTime ??= timing.time;
      const packet = result.tracking ?? tracker.update(result, timing);
      samples.push({ ...packet, t: timing.time - firstTime });
    });
    const cancel = () => {
      clearTimeout(timer);
      unsubscribe();
    };
    active.current = { cancel };
    timer = setTimeout(() => {
      cancel();
      active.current = null;
      setPending(false);
      try {
        const captured = {
          version: 2,
          coordinateConvention: 'MEDIAPIPE_UNMIRRORED',
          frames: samples,
        };
        setSequence(captured);
        validateHandSequence(captured);
        if (expectedHands === 2) {
          onFrames?.(captured);
          return;
        }
        const valid = singleHandFrames(captured);
        setFrames(valid);
        onFrames?.(valid, captured);
      } catch (failure) {
        setError(failure.message);
      }
    }, 3000);
  };
  return {
    pending,
    frames,
    sequence,
    sessionId,
    error,
    capture,
    cancel: () => {
      active.current?.cancel();
      active.current = null;
      setPending(false);
      setFrames(null);
      setSequence(null);
      setError('');
    },
    clear: () => {
      setFrames(null);
      setSequence(null);
      setError('');
    },
  };
}
