/**
 * Combina la validación geométrica (ambas manos, todo el abecedario evaluable) con el clasificador
 * DTW existente (prototipos aprendidos, hoy solo vocales y mano derecha).
 *
 * Reglas:
 * - La geometría puede vetar una coincidencia del DTW: evita aprobar una seña parecida.
 * - Si el DTW se abstiene por falta de cobertura (otra mano, fuera de distribución), decide la
 *   geometría: la mano izquierda deja de quedar sin respuesta.
 * - Si el DTW propone otra letra y la geometría acepta la objetivo, el resultado es incierto.
 * - Sin especificación geométrica para la letra, se conserva el resultado del DTW.
 * @param {object|null} model Resultado de predictSequence/predictHandSequence (o null).
 * @param {object} geometry Resultado de analyzeCapture.
 * @param {string} target Letra objetivo.
 * @returns {{verdict: string, source: string, hint?: string|null, rival?: string|null}} Veredicto único.
 */
export function combineEvidence(model, geometry, target) {
  if (!geometry || geometry.verdict === 'UNSUPPORTED') {
    if (model?.reason === 'CANDIDATE')
      return {
        verdict: model.label === target ? 'MODEL_MATCH' : 'DIFFERENT',
        source: 'MODEL',
        rival: model.label === target ? null : model.label,
      };
    return { verdict: 'UNCERTAIN', source: model ? 'MODEL' : 'NONE' };
  }
  if (geometry.verdict === 'MATCH') {
    if (model?.reason === 'CANDIDATE' && model.label !== target)
      return { verdict: 'UNCERTAIN', source: 'DISAGREEMENT', rival: model.label };
    return {
      verdict: 'MATCH',
      source: model?.reason === 'CANDIDATE' ? 'GEOMETRY_AND_MODEL' : 'GEOMETRY',
    };
  }
  if (geometry.verdict === 'CONFUSED')
    return { verdict: 'DIFFERENT', source: 'GEOMETRY', rival: geometry.rival, hint: geometry.hint };
  if (geometry.verdict === 'NEEDS_MOTION' || geometry.verdict === 'INCOMPLETE_MOTION')
    return { verdict: 'ADJUST', source: 'GEOMETRY', motion: geometry.verdict };
  return { verdict: 'ADJUST', source: 'GEOMETRY', hint: geometry.hint ?? null };
}

/**
 * Cuenta un intento como coincidente para la evidencia formativa local.
 * Compatible con resultados anteriores (solo DTW) que no tienen `evidence`.
 * @param {object} result Resultado del intento.
 * @param {string} letter Letra objetivo.
 * @returns {boolean} El intento fue compatible con la letra.
 */
export function attemptMatches(result, letter) {
  if (result?.evidence) return ['MATCH', 'MODEL_MATCH'].includes(result.evidence.verdict);
  return result?.reason === 'CANDIDATE' && result.label === letter;
}
