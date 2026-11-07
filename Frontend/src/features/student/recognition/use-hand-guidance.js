import { useEffect, useState } from 'react';
import { handGuidance } from './hand-guidance.js';

/**
 * Indicación de posición de la mano en vivo. Se suscribe a los frames ya detectados (no abre la
 * cámara ni procesa vídeo propio) y solo re-renderiza cuando cambia la indicación.
 * @param {{state: string, subscribe: Function}} camera Controlador de useHandCamera.
 * @returns {object | null} Indicación actual, o null si la cámara no está en vivo.
 */
export function useHandGuidance(camera) {
  const [guidance, setGuidance] = useState(null);
  const { subscribe } = camera;
  useEffect(
    () =>
      subscribe((result) => {
        const next = result ? handGuidance(result) : null;
        setGuidance((current) => (current?.state === next?.state ? current : next));
      }),
    [subscribe],
  );
  return camera.state === 'live' ? guidance : null;
}
