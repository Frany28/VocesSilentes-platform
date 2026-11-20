import { LSV_LETTERS } from '../../../../../shared/lsv/labels.js';

// Mensajes confirmados reservados para una revisión competente del intento.
// Ninguna predicción del clasificador experimental habilita CORRECT o INCORRECT.
export const practiceMessages = Object.freeze({
  NO_HAND: 'No podemos ver tu mano. Colócala dentro del encuadre.',
  PARTIAL_HAND: 'Asegúrate de que todos tus dedos estén visibles.',
  RAPID_MOVEMENT: 'Realiza la seña más despacio para observar el movimiento.',
  UNCERTAIN:
    'No hay evidencia suficiente para proponer una letra. Observa la referencia y vuelve a intentarlo.',
  REFERENCE_ONLY:
    'Observa la referencia y practica a tu ritmo. Puedes volver a consultarla cuando quieras.',
  INCORRECT:
    'La seña realizada no coincide con la letra solicitada. Observa la referencia e inténtalo nuevamente.',
  CORRECT: '¡Muy bien! Has realizado correctamente la seña.',
});

/**
 * Separa evidencia de captura, cobertura y predicciones experimentales; nunca confirma corrección LSV.
 * @param {object} result Resultado local con captureIssue geométrico opcional.
 * @param {string} [target] Letra solicitada, usada solo después de clasificar.
 * @returns {string} Estado educativo; CORRECT/INCORRECT necesitan una futura fuente de verificación.
 */
export function practiceOutcome(result, target) {
  if (['NO_HAND', 'PARTIAL_HAND', 'RAPID_MOVEMENT'].includes(result?.captureIssue))
    return result.captureIssue;
  if (result?.reason === 'UNSUPPORTED_LETTER') return 'REFERENCE_ONLY';
  if (result?.reason === 'CANDIDATE' && LSV_LETTERS.includes(result.label)) {
    if (!target) return 'EXPERIMENTAL_CANDIDATE';
    return result.label === target ? 'EXPERIMENTAL_MATCH' : 'EXPERIMENTAL_DIFFERENT';
  }
  return 'UNCERTAIN';
}

/**
 * Traduce resultados a acciones observables; una candidata o abstención no demuestra un error del alumno.
 * @param {object} result Predicción o evidencia de captura.
 * @param {string} [target] Letra solicitada, sin influir en la predicción.
 * @returns {string} Siguiente acción, sin diagnósticos de entrenamiento ni correcciones inventadas.
 */
export function practiceAdvice(result, target) {
  const outcome = practiceOutcome(result, target);
  if (outcome === 'EXPERIMENTAL_MATCH')
    return `El modelo propone la letra ${result.label}, que coincide con la letra solicitada.`;
  if (outcome === 'EXPERIMENTAL_DIFFERENT')
    return `El modelo propone la letra ${result.label}; estás practicando la ${target}. Compara con la referencia.`;
  if (outcome === 'EXPERIMENTAL_CANDIDATE')
    return `El modelo propone la letra ${result.label}. Compárala con la referencia.`;
  if (outcome !== 'UNCERTAIN') return practiceMessages[outcome];
  if (result.reason === 'UNSUPPORTED_HAND')
    return 'La ayuda experimental aún no tiene cobertura para esta mano. Puedes practicar con la referencia.';
  if (result.reason === 'SINGLE_HAND_REQUIRED')
    return 'Deja una sola mano visible para formar esta letra.';
  return practiceMessages.UNCERTAIN;
}

/**
 * Resume el intento sin convertir una coincidencia experimental en logro ni progreso académico.
 * @param {object} attempt Estado de useModelAttempt.
 * @param {boolean} [failed] Captura o análisis fallidos, con indicaciones para volver a intentar.
 * @param {object} [result] Predicción real del modelo.
 * @param {string} [target] Letra solicitada; la coincidencia solo cambia la presentación local.
 * @returns {string} Fase visual; las hipótesis experimentales permanecen en revisión del intento.
 */
export function practicePhase(attempt, failed = false, result, target) {
  if (attempt.busy) return 'capturing';
  if (failed) return 'retry';
  if (attempt.shown)
    return practiceOutcome(result, target) === 'EXPERIMENTAL_MATCH' ? 'success' : 'retry';
  if (!attempt.live) return 'observe';
  return 'practice';
}
