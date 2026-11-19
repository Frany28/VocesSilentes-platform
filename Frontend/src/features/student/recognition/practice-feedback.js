// Mensajes confirmados reservados para una revisión competente del intento.
// Ninguna predicción del clasificador experimental habilita CORRECT o INCORRECT.
export const practiceMessages = Object.freeze({
  NO_HAND: 'No podemos ver tu mano. Colócala dentro del encuadre.',
  PARTIAL_HAND: 'Asegúrate de que todos tus dedos estén visibles.',
  RAPID_MOVEMENT: 'Realiza la seña más despacio para observar el movimiento.',
  UNCERTAIN:
    'No pudimos verificar la seña con claridad. Ajusta la posición de tu mano y vuelve a intentarlo.',
  REFERENCE_ONLY:
    'Observa la referencia y practica a tu ritmo. Puedes volver a consultarla cuando quieras.',
  INCORRECT:
    'La seña realizada no coincide con la letra solicitada. Observa la referencia e inténtalo nuevamente.',
  CORRECT: '¡Muy bien! Has realizado correctamente la seña.',
});

/**
 * Separa evidencia de captura, cobertura y predicciones experimentales; nunca confirma corrección LSV.
 * @param {object} result Resultado local con captureIssue geométrico opcional.
 * @returns {string} Estado educativo; CORRECT/INCORRECT necesitan una futura fuente de verificación.
 */
export function practiceOutcome(result) {
  if (['NO_HAND', 'PARTIAL_HAND', 'RAPID_MOVEMENT'].includes(result.captureIssue))
    return result.captureIssue;
  if (result.reason === 'UNSUPPORTED_LETTER') return 'REFERENCE_ONLY';
  return 'UNCERTAIN';
}

/**
 * Traduce resultados a acciones observables; una candidata o abstención no demuestra un error del alumno.
 * @param {object} result Predicción o evidencia de captura.
 * @returns {string} Siguiente acción, sin diagnósticos de entrenamiento ni correcciones inventadas.
 */
export function practiceAdvice(result) {
  if (result.reason === 'SINGLE_HAND_REQUIRED')
    return 'Deja una sola mano visible para formar esta letra.';
  return practiceMessages[practiceOutcome(result)];
}

/**
 * Resume el intento sin convertir una coincidencia experimental en logro ni progreso académico.
 * @param {object} attempt Estado de useModelAttempt.
 * @param {boolean} [failed] Captura o análisis fallidos, con indicaciones para volver a intentar.
 * @returns {string} Fase visual; las hipótesis experimentales permanecen en revisión del intento.
 */
export function practicePhase(attempt, failed = false) {
  if (attempt.busy) return 'capturing';
  if (failed || attempt.shown) return 'retry';
  if (!attempt.live) return 'observe';
  return 'practice';
}
