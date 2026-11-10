/**
 * Traduce abstenciones reales a indicaciones de práctica, sin atribuir el límite al estudiante.
 * @param {{label?: string, reason?: string}} result Predicción o abstención del clasificador.
 * @param {string|undefined} target Letra que se compara después de inferir.
 * @returns {string} Siguiente acción comprensible, sin métricas ni afirmación de corrección LSV.
 */
export function practiceAdvice(result, target) {
  if (result.label) {
    const next = target
      ? `Observa la ${target} y vuelve a intentarlo.`
      : 'Compárala con la referencia.';
    return `La forma se parece a la ${result.label}. ${next}`;
  }
  return (
    {
      UNSUPPORTED_HAND:
        'Esta mano necesita más entrenamiento con ejemplos reales. Puedes seguir practicando con la referencia.',
      OUT_OF_DISTRIBUTION:
        'Coloca tu mano dentro del recuadro y mantén la seña quieta unos segundos.',
      BACKGROUND: 'Observa la referencia y forma la letra antes de empezar el siguiente intento.',
      AMBIGUOUS:
        'Todavía no distinguimos una letra. Revisa la posición de los dedos y vuelve a intentarlo.',
      SINGLE_HAND_REQUIRED: 'Deja una sola mano visible para formar esta letra.',
      TWO_HAND_MODEL_REQUIRED:
        'Esta actividad aún no puede reconocer señas con dos manos. Sigue la referencia.',
    }[result.reason] ??
    'No pudimos reconocer la letra. Mantén la mano visible y vuelve a intentarlo.'
  );
}

/**
 * Resume las fases reales para el visor, progreso y controles del estudiante.
 * @param {object} attempt Estado de useModelAttempt.
 * @param {object} operation Modelo y resultado actual.
 * @param {string|undefined} target Letra que se practica.
 * @param {boolean} [failed] Captura o análisis fallidos, con indicaciones para volver a intentar.
 * @returns {string} Fase de presentación, sin cambiar captura ni inferencia.
 */
export function practicePhase(attempt, operation, target, failed = false) {
  if (attempt.busy) return 'capturing';
  if (failed) return 'retry';
  if (attempt.shown)
    return operation.result.label && operation.result.label === target ? 'success' : 'retry';
  if (!attempt.live) return 'observe';
  return 'practice';
}
