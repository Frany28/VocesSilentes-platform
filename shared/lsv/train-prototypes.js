import { sequenceDistance } from './sequence.js';

/**
 * Selecciona hasta tres ejecuciones reales diversas por etiqueta/mano solo desde train.
 * Un orden por ID y empates estables hacen la selección independiente del orden de importación.
 * @param {object[]} samples Registros train de una misma etiqueta y mano.
 * @returns {object[]} Ejecuciones originales; no genera centroides, reflejos ni personas.
 */
export function selectPrototypes(samples) {
  const remaining = [...samples].sort((a, b) => a.id.localeCompare(b.id, 'en'));
  const selected = remaining.length ? [remaining.shift()] : [];
  while (remaining.length && selected.length < 3) {
    let farthest = 0;
    let largest = -1;
    remaining.forEach((sample, index) => {
      const nearest = Math.min(
        ...selected.map((chosen) => sequenceDistance(sample.sequence, chosen.sequence)),
      );
      if (nearest > largest) {
        largest = nearest;
        farthest = index;
      }
    });
    selected.push(...remaining.splice(farthest, 1));
  }
  return selected;
}

/**
 * Calibra el percentil 95 por etiqueta/mano exclusivamente con validation (nearest rank).
 * @param {object[]} records Muestras separadas por participante.
 * @param {object[]} prototypes Prototipos de train.
 * @param {string[]} labels Clases fijadas para el experimento.
 * @returns {{radii: object, radiiByHand: object}} Radios compatibles con v1 y radios específicos.
 * @throws {Error} Falta calibración de una mano o entrenamiento compatible.
 */
export function calibrationRadii(records, prototypes, labels) {
  const radiiByHand = {};
  for (const label of labels) {
    radiiByHand[label] = {};
    for (const hand of ['Left', 'Right']) {
      const own = prototypes.filter((sample) => sample.label === label && sample.hand === hand);
      const validation = records.filter(
        (sample) =>
          sample.partition === 'validation' && sample.label === label && sample.hand === hand,
      );
      if (!own.length && !validation.length) continue;
      if (!own.length || !validation.length)
        throw new Error(`Falta entrenamiento o calibración de la mano observada en ${label}`);
      const distances = validation
        .map((sample) => Math.min(...own.map((p) => sequenceDistance(sample.sequence, p.sequence))))
        .sort((a, b) => a - b);
      radiiByHand[label][hand] = distances[Math.ceil(distances.length * 0.95) - 1];
    }
  }
  return {
    radiiByHand,
    radii: Object.fromEntries(
      labels.map((label) => [label, Math.max(...Object.values(radiiByHand[label]))]),
    ),
  };
}
