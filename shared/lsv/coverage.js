import { LSV_LABELS } from './labels.js';
import { auditTrainingSamples } from './sample-audit.js';

export const PILOT_LABELS = Object.freeze(['A', 'E', 'I', 'O', 'U', 'NONE']);
export const DATA_PARTITIONS = ['train', 'validation', 'test'];

/**
 * Cuenta ejecuciones revisadas y pendientes por etiqueta, grupo y persona; no estima precisión del modelo.
 * @param {object[]} samples Muestras validadas, sin contar frames como ejecuciones.
 * @param {string[]} [selectedLabels] Alcance explícito; por defecto 27 letras y NONE.
 * @returns {object} Cobertura estructural, documentación faltante y conflictos; no valida un modelo.
 */
export function trainingCoverage(samples, selectedLabels = LSV_LABELS) {
  const audit = auditTrainingSamples(samples, selectedLabels);
  const eligible = new Set(audit.accepted.map((sample) => sample.id));
  const labels = selectedLabels.map((label) => ({
    label,
    groups: DATA_PARTITIONS.map((partition) => {
      const matches = samples.filter(
        (sample) => sample.label === label && sample.partition === partition,
      );
      const reviewed = matches.filter((sample) => eligible.has(sample.id));
      return {
        partition,
        reviewed: reviewed.length,
        pending: matches.length - reviewed.length,
        participants: new Set(reviewed.map((sample) => sample.participantId.toLowerCase())).size,
      };
    }),
  }));
  const people = [...new Set(samples.map((sample) => sample.participantId.toLowerCase()))].map(
    (id) => {
      const own = samples.filter((sample) => sample.participantId.toLowerCase() === id);
      return {
        id,
        partitions: [...new Set(own.map((sample) => sample.partition))],
        missing: selectedLabels.filter(
          (label) => !own.some((sample) => sample.label === label && eligible.has(sample.id)),
        ),
      };
    },
  );
  return {
    labels,
    people,
    rejected: audit.rejected,
    minimumCovered:
      labels.every((item) => item.groups.every((group) => group.reviewed > 0)) &&
      people.every((person) => person.partitions.length === 1) &&
      audit.rejected === 0,
  };
}
