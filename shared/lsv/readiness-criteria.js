import { LSV_MOTION_LETTERS } from './labels.js';

/**
 * Mínimos técnicos propuestos, pendientes de acuerdo con revisores LSV; nunca autorizan publicación.
 * Las personas son disjuntas por partición; la cobertura de manos se exige en cada una.
 */
export const READINESS_CRITERIA = Object.freeze({
  participants: Object.freeze({ train: 6, validation: 2, test: 2 }),
  samplesPerParticipant: 3,
  hands: Object.freeze(['Left', 'Right']),
  minTestSamples: 20,
  minRecall: 0.9,
  maxNoneFalsePositiveRate: 0.05,
  motionLetters: LSV_MOTION_LETTERS,
});
