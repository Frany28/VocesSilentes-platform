import { LSV_LABELS, LSV_LETTERS } from './labels.js';
import { READINESS_CRITERIA } from './readiness-criteria.js';
import { auditTrainingSamples } from './sample-audit.js';

/**
 * Distingue disponibilidad de elegibilidad y cuenta solo ejecuciones documentadas e independientes.
 * @param {object[]} samples Grabaciones reales o pendientes.
 * @param {object} [criteria] Umbrales técnicos propuestos; no son validación lingüística.
 * @param {string[]} [labels] Alcance explícito, con NONE por defecto.
 * @returns {object[]} Conteos y faltantes por clase, sin estimar precisión.
 */
export function labelReadiness(samples, criteria = READINESS_CRITERIA, labels = LSV_LABELS) {
  const audit = auditTrainingSamples(samples, labels);
  return audit.rows.map((row) => {
    const reviewed = audit.accepted.filter((sample) => sample.label === row.label);
    const missing = [];
    for (const [partition, required] of Object.entries(criteria.participants)) {
      const group = reviewed.filter((sample) => sample.partition === partition);
      const counts = new Map();
      for (const sample of group)
        counts.set(sample.participantId, (counts.get(sample.participantId) ?? 0) + 1);
      const people = [...counts.values()].filter(
        (count) => count >= criteria.samplesPerParticipant,
      ).length;
      if (people < required)
        missing.push(
          `${partition}: ${people}/${required} personas con ${criteria.samplesPerParticipant}+ muestras`,
        );
      for (const hand of criteria.hands)
        if (!group.some((sample) => sample.hand === hand))
          missing.push(`${partition}: sin ejemplos con mano ${hand}`);
      if (partition === 'test' && group.length < criteria.minTestSamples)
        missing.push(`test: ${group.length}/${criteria.minTestSamples} ejecuciones revisadas`);
    }
    if (!reviewed.length) missing.unshift('Sin muestras revisadas y documentadas');
    if (audit.rejected)
      missing.push('El lote contiene muestras pendientes, inválidas o en conflicto');
    return {
      ...row,
      reviewed: reviewed.length,
      motion: criteria.motionLetters.includes(row.label),
      status: !reviewed.length
        ? 'NO_DATA'
        : missing.length
          ? 'INSUFFICIENT_DATA'
          : 'READY_FOR_EVALUATION',
      missing,
    };
  });
}

/**
 * Conserva la API de 27 letras para consumidores anteriores; NONE también se audita para su alcance.
 * @param {object[]} samples Grabaciones del laboratorio.
 * @param {object} [criteria] Criterios técnicos propuestos.
 * @returns {object[]} Preparación de las 27 letras.
 */
export function letterReadiness(samples, criteria = READINESS_CRITERIA) {
  return labelReadiness(samples, criteria).filter((row) => LSV_LETTERS.includes(row.label));
}
