import { abstentionAdvice } from './recognition-support.js';
import { MOTION_RECOGNIZABLE } from '../../../../../shared/lsv/engine/index.js';

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
  adjusting: 'hand',
  holding: 'hand',
  unrecognized: 'hand',
  capturing: 'capture',
  analyzing: 'capture',
  match: 'result',
  different: 'result',
  adjust: 'result',
  uncertain: 'result',
};

const handNames = { Left: 'izquierda', Right: 'derecha' };
const conditionalSource = new Set(['SOURCE_CONFLICT', 'VARIANT_PENDING', 'MOTION_FROM_REFERENCE']);

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

// Resultado con evidencia combinada (motor geométrico + modelo DTW cuando existe).
function evidenceStage(result, target) {
  const { evidence, geometry } = result;
  const hand = handNames[geometry?.hand] ? ` con la mano ${handNames[geometry.hand]}` : '';
  const note = conditionalSource.has(geometry?.status)
    ? ' Se compara con la ficha del curso; esta letra tiene variantes o fuentes en revisión.'
    : '';
  if (evidence.verdict === 'MATCH')
    return stage(
      'match',
      'Configuración compatible',
      `Tu mano${hand} coincide con los rasgos de la ficha de la ${target}. Es una comprobación automática orientativa, no una certificación: compárala igualmente con la referencia.${note}`,
      { label: target },
    );
  if (evidence.verdict === 'MODEL_MATCH')
    return stage(
      'match',
      'Predicción coincidente',
      `El modelo experimental propuso la ${target}, la letra que practicas. Es una salida experimental: no certifica que la seña esté bien ejecutada. Compárala igualmente con la referencia.`,
      { label: target },
    );
  if (evidence.verdict === 'DIFFERENT' && evidence.rival)
    return stage(
      'different',
      `Se parece más a la ${evidence.rival}`,
      `Practicas la ${target}. ${evidence.hint ?? 'Compara tu mano con la referencia y vuelve a intentarlo.'}`,
      { label: evidence.rival },
    );
  if (evidence.verdict === 'ADJUST')
    return stage(
      'adjust',
      'Ajuste necesario',
      evidence.motion === 'INCOMPLETE_MOTION'
        ? 'La configuración es correcta: completa el movimiento de la letra.'
        : evidence.motion === 'NEEDS_MOTION'
          ? 'La configuración es correcta, pero esta letra lleva movimiento. Realízalo durante la captura.'
          : `${evidence.hint ?? 'Compara tu mano con la referencia.'} Luego repite el intento.`,
    );
  return stage(
    'uncertain',
    'Sin evidencia suficiente',
    evidence.rival
      ? `La comprobación de la mano y el modelo no coinciden (el modelo propuso la ${evidence.rival}). Compara con la referencia y repite.`
      : 'No reunimos evidencia suficiente para comprobar esta seña. Compárala con la referencia y repite.',
  );
}

/**
 * Título y explicación de un intento con evidencia combinada, reutilizable fuera del workspace.
 * @param {object} result Resultado de useLocalModel con `evidence`.
 * @param {string} target Letra objetivo.
 * @returns {{id: string, title: string, guidance: string, label?: string}} Resumen del intento.
 */
export function evidenceSummary(result, target) {
  return evidenceStage(result, target);
}

function resultStage(result, target, model) {
  if (captureAdvice[result.captureIssue])
    return stage('uncertain', 'Captura insuficiente', captureAdvice[result.captureIssue]);
  if (result.evidence) return evidenceStage(result, target);
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

// Guía continua antes de capturar, a partir del reconocedor en vivo (useLetterRecognizer).
function liveStage(live) {
  if (live.state === 'ADJUST')
    return stage('adjusting', 'Ajuste necesario', live.message, { live: live.state });
  if (live.state === 'HOLD')
    return stage('holding', 'Mantén la posición', live.message, {
      live: live.state,
      progress: live.progress ?? 0,
    });
  if (live.state === 'MATCH')
    return stage(
      'holding',
      'Configuración compatible',
      'Mantén la seña: la captura la confirmará en unos segundos.',
      { live: live.state, progress: 1 },
    );
  if (live.state === 'UNRECOGNIZED')
    return stage('unrecognized', 'Seña no reconocida', live.message, { live: live.state });
  if (live.state === 'ANALYZING')
    return stage('detected', 'Analizando la seña', live.message, { live: live.state });
  return null;
}

/**
 * Traduce el estado real de cámara, captura e inferencia en una etapa comprensible. No inventa
 * aciertos: una coincidencia es sólo la salida del modelo experimental y nunca una calificación.
 * @param {{camera: object, attempt: object, operation: object, capture: object, target?: string}} sources
 * Estados de useHandCamera, useModelAttempt, useLocalModel y useSequenceCapture.
 * @returns {{id: string, milestone: string, title: string, guidance: string, label?: string}} Etapa actual.
 */
export function cameraStage({ camera, attempt, operation, capture, target, live = null }) {
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
  const ready = Boolean(operation.model) || Boolean(operation.ready);
  if (!ready && operation.loadError)
    return stage(
      'error',
      'Reconocimiento no disponible',
      'No se pudo cargar el modelo de vocales. Puedes reintentar o practicar comparando con la referencia.',
    );
  if (!ready)
    return stage('preparing', 'Preparando el reconocimiento', 'Cargando el modelo de vocales…');
  if (attempt.busy)
    return stage(
      'capturing',
      attempt.countdown?.count != null ? `Capturando en ${attempt.countdown.count}…` : 'Capturando',
      MOTION_RECOGNIZABLE.includes(target)
        ? 'Forma la letra y realiza su movimiento completo dentro del recuadro.'
        : 'Mantén la letra quieta dentro del recuadro durante tres segundos.',
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
  const guided = live && liveStage(live);
  if (guided) return guided;
  return stage('detected', 'Mano detectada', 'Forma la letra y mantenla quieta: empieza sola.');
}
