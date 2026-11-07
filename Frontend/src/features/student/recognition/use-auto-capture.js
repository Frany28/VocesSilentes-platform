import { useEffect, useRef, useState } from 'react';
import { handGuidance } from './hand-guidance.js';

const HOLD_MS = 1000; // mano bien colocada y estable antes de empezar a capturar
const REST_MS = 600; // mano fuera de posición para preparar otro intento

/**
 * Captura sin manos: dispara el intento cuando la mano lleva HOLD_MS bien colocada en el recuadro.
 * Tras un intento espera a que la mano salga de posición REST_MS (bajarla o retirarla) antes de volver
 * a disparar, para no capturar en bucle la misma postura. Solo lee frames ya detectados; no abre la
 * cámara ni decide nada sobre la letra.
 * @param {{state: string, subscribe: Function}} camera Controlador de useHandCamera.
 * @param {{enabled: boolean, onTrigger: Function}} options Si puede disparar y acción al disparar,
 * que recibe la marca de tiempo del frame que la dispara.
 * @returns {{phase: 'waiting'|'holding'|'rest', rearm: Function}} Fase para mostrar y rearme manual.
 */
export function useAutoCapture(camera, { enabled, onTrigger }) {
  const [phase, setPhase] = useState('waiting');
  const trigger = useRef(onTrigger);
  const armed = useRef(true);
  const since = useRef(null);
  const away = useRef(null);
  const { subscribe } = camera;
  useEffect(() => {
    trigger.current = onTrigger;
  });
  useEffect(() => {
    if (!enabled) return undefined;
    since.current = null;
    return subscribe((result, timing) => {
      const ready = Boolean(result) && handGuidance(result).ready;
      const now = timing?.time ?? 0;
      if (!armed.current) {
        if (ready) away.current = null;
        else if (away.current === null) away.current = now;
        else if (now - away.current >= REST_MS) {
          armed.current = true;
          away.current = null;
          setPhase('waiting');
        }
        return;
      }
      if (!ready) {
        since.current = null;
        setPhase('waiting');
        return;
      }
      if (since.current === null) since.current = now;
      if (now - since.current < HOLD_MS) {
        setPhase('holding');
        return;
      }
      armed.current = false;
      since.current = null;
      setPhase('rest');
      trigger.current(now);
    });
  }, [enabled, subscribe]);
  const rearm = () => {
    armed.current = true;
    away.current = null;
    setPhase('waiting');
  };
  return { phase, rearm };
}
