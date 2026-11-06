export const PILOT_LABELS = ['A', 'E', 'I', 'O', 'U', 'NONE'];
export const DATA_PARTITIONS = ['train', 'validation', 'test'];

/**
 * Cuenta ejecuciones revisadas y pendientes por etiqueta, grupo y persona; no estima precisión del modelo.
 * @param {object[]} samples Muestras validadas, sin contar frames como ejecuciones.
 * @returns {object} Cobertura mínima estructural del piloto, faltantes por participante y conflictos.
 */
export function trainingCoverage(samples) {
  const labels = PILOT_LABELS.map((label) => ({
    label,
    groups: DATA_PARTITIONS.map((partition) => {
      const matches = samples.filter(
        (sample) => sample.label === label && sample.partition === partition,
      );
      const reviewed = matches.filter((sample) => sample.reviewStatus === 'APPROVED_LSV');
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
        missing: PILOT_LABELS.filter(
          (label) =>
            !own.some((sample) => sample.label === label && sample.reviewStatus === 'APPROVED_LSV'),
        ),
      };
    },
  );
  return {
    labels,
    people,
    minimumCovered:
      labels.every((item) => item.groups.every((group) => group.reviewed > 0)) &&
      people.every((person) => person.partitions.length === 1),
  };
}
