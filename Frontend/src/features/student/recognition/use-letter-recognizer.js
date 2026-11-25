import { useEffect, useRef, useState } from 'react';
import { createLetterRecognizer, engineSupports } from '../../../../../shared/lsv/engine/index.js';

/**
 * Conecta el motor único de reconocimiento a los fotogramas ya detectados por la cámara.
 * No abre la cámara, no guarda puntos y solo vuelve a renderizar cuando cambia lo que el
 * estudiante ve (estado, mensaje o un tramo del 10 % de progreso).
 * @param {{subscribe: Function}} camera Controlador de useHandCamera.
 * @param {string|undefined} target Letra objetivo.
 * @returns {object|null} Estado del reconocedor o null sin letra evaluable / sin cámara.
 */
export function useLetterRecognizer(camera, target) {
  const [live, setLive] = useState(null);
  const shown = useRef('');
  const { subscribe } = camera;
  const supported = Boolean(target) && engineSupports(target);
  useEffect(() => {
    if (!supported) return undefined;
    const recognizer = createLetterRecognizer({ target });
    shown.current = '';
    return subscribe((result) => {
      if (!result?.tracking) {
        recognizer.reset();
        shown.current = '';
        setLive(null);
        return;
      }
      const next = recognizer.update(result.tracking);
      const key = `${next.state}|${next.message}|${Math.round((next.progress ?? 0) * 10)}`;
      if (key === shown.current) return;
      shown.current = key;
      setLive(next);
    });
  }, [subscribe, supported, target]);
  return supported ? live : null;
}
