import { LSV_LABELS } from './labels.js';
import { validateFrames } from './recording.js';
import { validateReviewEvidence } from './review-evidence.js';
import { trainableRecording } from './training-eligibility.js';
import { createSampleRegistry } from './sample-conflicts.js';

/**
 * Audita muestras sin promover consentimiento, revisiones ni identidades desde un archivo o modelo.
 * @param {object[]} samples Exportaciones crudas; las provisionales pueden seguir pendientes.
 * @param {string[]} [labels] Alcance del experimento; por defecto el abecedario y NONE.
 * @returns {object} Registros elegibles privados y conteos agregados sin landmarks ni identidades.
 */
export function auditTrainingSamples(samples, labels = LSV_LABELS) {
  const accepted = [];
  const registry = createSampleRegistry();
  const errors = {};
  const rows = labels.map((label) => {
    const own = samples.filter((sample) => sample?.label === label);
    let geometryValid = 0;
    let evidenceDocumented = 0;
    for (const sample of own) {
      try {
        validateFrames(sample.frames);
        geometryValid += 1;
      } catch {
        /* Un rótulo o una ficha no constituyen una secuencia. */
      }
      try {
        validateReviewEvidence(sample.reviewEvidence, label);
        evidenceDocumented += 1;
      } catch {
        /* Se informa el faltante sin fabricar una revisión. */
      }
      try {
        const record = trainableRecording(sample, labels);
        registry.add(record);
        accepted.push(record);
      } catch (error) {
        errors[error.message] = (errors[error.message] ?? 0) + 1;
      }
    }
    const eligible = accepted.filter((sample) => sample.label === label);
    return {
      label,
      available: own.length,
      geometryValid,
      consentDeclared: own.filter((sample) => sample.consent === true).length,
      approvalDeclared: own.filter((sample) => sample.reviewStatus === 'APPROVED_LSV').length,
      evidenceDocumented,
      eligible: eligible.length,
      participants: new Set(eligible.map((sample) => sample.participantId)).size,
    };
  });
  const unknownLabels = samples.filter((sample) => !labels.includes(sample?.label)).length;
  if (unknownLabels) errors['Etiquetas ausentes o ajenas al experimento'] = unknownLabels;
  return { accepted, rows, errors, rejected: samples.length - accepted.length };
}
