import { useCallback, useEffect, useRef, useState } from 'react';
import { startCameraSession } from './camera-session.js';
import { createHandTracker } from '../../../../../shared/lsv/hand-tracker.js';

const messages = {
  NotAllowedError:
    'El permiso de cámara fue denegado. Puedes habilitarlo en tu navegador y reintentar.',
  NotFoundError: 'No encontramos una cámara disponible.',
  NotReadableError: 'La cámara está ocupada o no se puede abrir.',
};

/**
 * Controla cámara local, permisos y subscripción a resultados reales; nunca la activa durante el montaje.
 * @param {Function} [onHand] Referencia visual automática después de estabilizar una mano.
 * @returns {object} Estado, refs, activación, cierre y frames para intentos explícitos.
 */
export function useHandCamera(onHand) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const active = useRef(null);
  const listeners = useRef(new Set());
  const [state, setState] = useState('off');
  const [error, setError] = useState('');
  const [detection, setDetection] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const stop = useCallback(() => {
    active.current?.abort();
    active.current = null;
    setState('off');
    setDetection(null);
    listeners.current.forEach((listener) => listener(null));
  }, []);
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) stop();
    };
    const leave = () => stop();
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', leave);
    return () => {
      active.current?.abort();
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', leave);
    };
  }, [stop]);
  const start = async () => {
    if (active.current) return;
    setError('');
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError('La cámara necesita HTTPS o localhost y un navegador compatible.');
      return;
    }
    const controller = new AbortController();
    const id = crypto.randomUUID();
    setSessionId(id);
    const tracker = createHandTracker(id);
    active.current = controller;
    const failure = (cause) => {
      if (controller.signal.aborted) return;
      controller.abort();
      active.current = null;
      setDetection(null);
      setState('error');
      setError(
        messages[cause.name] ??
          'No se pudo iniciar o mantener el análisis de cámara. Vuelve a intentarlo.',
      );
      listeners.current.forEach((listener) => listener(null));
    };
    try {
      await startCameraSession({
        video: videoRef.current,
        canvas: canvasRef.current,
        signal: controller.signal,
        onState: setState,
        onError: failure,
        onFrame: (result, timing) => {
          if (controller.signal.aborted) return;
          const tracking = tracker.update(result, timing);
          setDetection(tracking);
          if (tracking.singleHand) onHand?.(tracking.singleHand);
          listeners.current.forEach((listener) => listener({ ...result, tracking }, timing));
        },
      });
    } catch (cause) {
      failure(cause);
    }
  };
  const subscribe = useCallback((listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);
  return {
    videoRef,
    canvasRef,
    state,
    error,
    hands: detection?.count ?? 0,
    detection,
    hand: detection?.singleHand ?? null,
    sessionId,
    start,
    stop,
    subscribe,
  };
}
