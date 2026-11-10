import { sequenceFeatures, sequenceDistance } from './sequence.js';
import { augmentTraining } from './augmentation.js';

/**
 * Prepara prototipos por mano y radios heurísticos del flujo provisional, sin alterar los originales.
 * @param {object[]} records Capturas reales confirmadas, solo de entrenamiento.
 * @param {object|null} policy Política de reflejo validada o null.
 * @returns {object} Prototipos, radios y aumentos separados para auditoría.
 * @throws {Error} Límite de prototipos o política incompatible.
 */
export function experimentalPrototypes(records, policy = null) {
  const augmented = augmentTraining(records, policy);
  const prototypes = [...records, ...augmented].map((sample) => ({
    label: sample.label,
    hand: sample.frames[0].hand,
    sequence: sample.sequence ?? sequenceFeatures(sample.frames),
  }));
  if (prototypes.length > 168) throw new Error('Máximo 168 prototipos, contando aumentos');
  const labels = [...new Set(records.map((sample) => sample.label))].sort();
  const radii = Object.fromEntries(
    labels.map((label) => {
      const distances = prototypes
        .filter((item) => item.label === label)
        .flatMap((item) =>
          prototypes
            .filter((other) => other.label !== label && other.hand === item.hand)
            .map((other) => sequenceDistance(item.sequence, other.sequence)),
        );
      return [label, Math.min(0.35, ...distances.map((distance) => distance * 0.45))];
    }),
  );
  return { prototypes, radii, augmented };
}
