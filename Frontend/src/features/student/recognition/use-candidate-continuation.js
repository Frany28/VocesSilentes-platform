import { useEffect, useRef, useState } from 'react';

/**
 * Avanza solo el recorrido de observación tras una coincidencia experimental, con pausa cancelable y sin notas.
 * @param {object} result Candidata actual.
 * @param {string|undefined} target Letra de la actividad, comparada después de inferir.
 * @param {Function|undefined} onContinue Navegación educativa existente, nunca un servicio de progreso.
 * @param {boolean} enabled Cámara activa y captura terminada.
 * @returns {object} Estado de avance y acción para quedarse practicando.
 */
export function useCandidateContinuation(result, target, onContinue, enabled) {
  const action = useRef(onContinue);
  const done = useRef(null);
  const [held, setHeld] = useState(null);
  const advancing = Boolean(
    enabled && onContinue && result.label && result.label === target && held !== result,
  );
  useEffect(() => {
    action.current = onContinue;
  });
  useEffect(() => {
    if (!advancing || done.current === result) return undefined;
    const timer = setTimeout(() => {
      done.current = result;
      action.current?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [advancing, result]);
  return {
    advancing,
    stay: () => setHeld(result),
    continueNow: () => {
      done.current = result;
      setHeld(result);
      action.current?.();
    },
  };
}
