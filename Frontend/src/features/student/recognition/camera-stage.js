import { abstentionAdvice } from './recognition-support.js';

// Orden visible del recorrido de un intento; los estados de resultado comparten el último hito.
export const cameraMilestones = Object.freeze([
  { id: 'camera', label: 'Cámara' },
  { id: 'hand', label: 'Mano' },
  { id: 'capture', label: 'Captura' },
  { id: 'result', label: 'Resultado' },
]);

const milestoneOf = {
  off: 'camera',
  preparing: 'camera',
  error: 'camera',
  searching: 'hand',
  detected: 'hand',
  capturing: 'capture',
  analyzing: 'capture',
  match: 'result',
  different: 'result',
  uncertain: 'result',
};

const captureAdvice = {
  NO_HAND:
    'La captura no encontró tu mano en suficientes cuadros. Colócala completa dentro del recuadro y repite.',
  PARTIAL_HAND:
    'Parte de la mano quedó fuera del encuadre. Aléjala un poco de la cámara para que se vea completa.',
  RAPID_MOVEMENT:
    'La mano se movió durante la captura. Forma la vocal primero y mantenla quieta los tres segundos.',
};

function stage(id, title, guidance, extra = {}) {
  return { id, milestone: milestoneOf[id], title, guidance, ...extra };
}

function resultStage(result, target, model) {
  if (captureAdvice[result.captureIssue])
    return stage('uncertain', 'Captura insuficiente', captureAdvice[result.captureIssue]);
  if (result.reason === 'CANDIDATE' && result.label === target)
    return stage(
      'match',
      'Predicción coincidente',
      `El modelo experimental propuso la ${result.label}, la vocal que practicas. Es una salida experimental: no certifica que la seña esté bien ejecutada. Compárala igualmente con la referencia.`,
      { label: result.label },
    );
  if (result.reason === 'CANDIDATE')
    return stage(
      'different',
      `El modelo propuso la ${result.label}`,
      `Practicas la ${target}. Compara tu mano con la referencia y vuelve a intentarlo; el modelo experimental también puede equivocarse.`,
      { label: result.label },
    );
  if (result.reason === 'SINGLE_HAND_REQUIRED')
    return stage('uncertain', 'Usa una sola mano', 'Deja visible solo la mano que forma la vocal.');
  return stage(
    'uncertain',
    'Sin evidencia suficiente',
    `El modelo se abstuvo: no tiene evidencia suficiente para proponer una vocal. ${abstentionAdvice(result.reason, model)}`,
  );
}

/**
 * Traduce el estado real de cámara, captura e inferencia en una etapa comprensible. No inventa
 * aciertos: una coincidencia es sólo la salida del modelo experimental y nunca una calificación.
 * @param {{camera: object, attempt: object, operation: object, capture: object, target?: string}} sources
 * Estados de useHandCamera, useModelAttempt, useLocalModel y useSequenceCapture.
 * @returns {{id: string, milestone: string, title: string, guidance: string, label?: string}} Etapa actual.
 */
export function cameraStage({ camera, attempt, operation, capture, target }) {
  if (camera.state === 'error')
    return stage('error', 'La cámara no está disponible', camera.error || 'Vuelve a activarla.');
  if (camera.state === 'off')
    return stage(
      'off',
      'Cámara desactivada',
      'Actívala cuando estés listo. El video se procesa en tu dispositivo y no se envía al servidor.',
    );
  if (camera.state !== 'live')
    return stage('preparing', 'Preparando la cámara', 'Permite el acceso y espera unos segundos.');
  if (!operation.model && operation.loadError)
    return stage(
      'error',
      'Reconocimiento no disponible',
      'No se pudo cargar el modelo de vocales. Puedes reintentar o practicar comparando con la referencia.',
    );
  if (!operation.model)
    return stage('preparing', 'Preparando el reconocimiento', 'Cargando el modelo de vocales…');
  if (attempt.busy)
    return stage(
      'capturing',
      attempt.countdown?.count != null ? `Capturando en ${attempt.countdown.count}…` : 'Capturando',
      'Mantén la vocal quieta dentro del recuadro durante tres segundos.',
    );
  if (operation.error || capture.error)
    return stage(
      'uncertain',
      'Captura insuficiente',
      'No reunimos suficientes cuadros de una mano. Mantén la mano completa y quieta, y repite.',
    );
  if (attempt.shown) return resultStage(operation.result, target, operation.model);
  if (capture.frames)
    return stage('analyzing', 'Analizando', 'Comparando el intento en tu dispositivo…');
  if (!camera.hands)
    return stage(
      'searching',
      'Buscando tu mano',
      'Coloca una mano completa dentro del recuadro, con buena luz y sin otra mano a la vista.',
    );
  return stage('detected', 'Mano detectada', 'Forma la vocal y mantenla quieta: empieza sola.');
}
