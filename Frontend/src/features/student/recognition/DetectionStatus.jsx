import { Alert } from '../../../components/ui/Alert.jsx';
import { practiceMessages } from './practice-feedback.js';

/**
 * Muestra detección observable sin exponer cobertura ni atribuir aciertos a la detección.
 * @param {{camera: object, expectedHands?: number}} props Estado y modalidad.
 * @returns {import('react').ReactElement} Detección visible e indicaciones de encuadre.
 */
export function DetectionStatus({ camera, expectedHands = 1 }) {
  const detection = camera.detection;
  const count = camera.state === 'live' ? (detection?.count ?? camera.hands) : 0;
  let message = 'Activa la cámara cuando estés listo.';
  if (camera.state === 'live') {
    message = count
      ? 'Se detectó tu mano; mantén la posición para identificarla.'
      : practiceMessages.NO_HAND;
    if (detection?.stable && count === 1)
      message = `Mano ${detection.singleHand === 'Left' ? 'izquierda' : 'derecha'} detectada. Mantén la seña.`;
    if (count === 2)
      message = detection?.stable
        ? 'Manos detectadas: izquierda y derecha.'
        : 'Se detectan dos manos; manténlas visibles para identificarlas.';
  }
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p
        className="detection-status"
        role="status"
        data-hands={count}
        data-hand={detection?.singleHand ?? undefined}
        data-stable={Boolean(detection?.stable)}
      >
        {message}
      </p>
      {count === 2 && expectedHands === 1 && (
        <Alert tone="info" title="Usa solo una mano para esta práctica">
          Detectamos las dos manos. Deja visible la que utilizarás para formar la letra.
        </Alert>
      )}
    </div>
  );
}
