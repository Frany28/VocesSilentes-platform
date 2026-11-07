import { useEffect, useRef, useState } from 'react';
import { validateFrames } from '../../../../../shared/lsv/recording.js';

/**
 * Captura tres segundos de puntos de una mano solo por acción explícita; no graba vídeo ni envía datos.
 * @param {object} camera Detector local y canal de frames.
 * @returns {object} Intento temporal, error, captura y descarte; cada muestra exige continuidad real.
 */
export function useSequenceCapture(camera) {
  const active = useRef(null);
  const [pending, setPending] = useState(false);
  const [frames, setFrames] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  useEffect(() => () => active.current?.cancel(), []);
  // onFrames recibe el intento válido al terminar (p. ej. para analizarlo sin otro clic).
  const capture = (onFrames) => {
    if (active.current || camera.state !== 'live') return;
    setFrames(null);
    setSessionId(camera.sessionId);
    setError('');
    setPending(true);
    const samples = [];
    let interrupted = false;
    const start = performance.now();
    let timer;
    const unsubscribe = camera.subscribe((result, timing) => {
      if (!result) {
        active.current?.cancel();
        active.current = null;
        setPending(false);
        setError('La captura se canceló al detener la cámara.');
        return;
      }
      const hand = result.handedness?.[0]?.[0]?.categoryName;
      if (result.landmarks.length !== 1 || !['Left', 'Right'].includes(hand)) interrupted = true;
      if (result.landmarks.length === 1 && ['Left', 'Right'].includes(hand))
        samples.push({
          t: timing.time - start,
          hand,
          width: timing.width,
          height: timing.height,
          points: result.landmarks[0].map(({ x, y, z }) => [x, y, z]),
        });
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
        const valid = validateFrames(samples);
        if (interrupted)
          throw new Error(
            'Captura interrumpida: mantén exactamente una mano visible durante todo el intento.',
          );
        setFrames(valid);
        onFrames?.(valid);
      } catch (failure) {
        setError(failure.message);
      }
    }, 3000);
  };
  return {
    pending,
    frames,
    sessionId,
    error,
    capture,
    clear: () => {
      setFrames(null);
      setError('');
    },
  };
}
