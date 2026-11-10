import { Alert } from '../../../components/ui/Alert.jsx';
import { hasRealHandExamples } from './practice-hand-support.js';

/**
 * Muestra el estado automático y cobertura real sin selector ni atribuir aciertos a la detección.
 * @param {{camera: object, model?: object, letter?: string, expectedHands?: number}} props Estado y modalidad.
 * @returns {import('react').ReactElement} Detección visible, indicaciones y abstención por falta de datos.
 */
export function DetectionStatus({ camera, model, letter, expectedHands = 1 }) {
  const detection = camera.detection;
  const count = camera.state === 'live' ? (detection?.count ?? camera.hands) : 0;
  let message = 'Activa la cámara cuando estés listo.';
  if (camera.state === 'live') {
    message = count
      ? 'Se detectó tu mano; mantén la posición para identificarla.'
      : 'No se detecta claramente la mano.';
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
      {model && camera.hand && !hasRealHandExamples(model, letter, camera.hand) && (
        <p className="text-muted">
          Esta mano necesita más entrenamiento con ejemplos reales. Puedes practicar por observación
          con la referencia.
        </p>
      )}
    </div>
  );
}
