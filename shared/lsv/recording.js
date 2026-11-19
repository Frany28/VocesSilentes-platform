import { validateFrames } from './recording-frames.js';
import { LSV_LABELS } from './labels.js';
import { validateVideoSource } from './video-source.js';
import { recordingHandMetadata } from './handedness.js';
import { validateReviewEvidence } from './review-evidence.js';

const code = /^[a-zA-Z0-9_-]{1,64}$/;
const validCode = (value) => typeof value === 'string' && code.test(value);

/**
 * Valida una muestra consentida y continua, sin inferir que su etiqueta corresponde a una seña correcta.
 * @param {unknown} value Muestra exportada por el laboratorio local.
 * @returns {object} Muestra con campos permitidos; la revisión lingüística es explícita e independiente.
 * @throws {Error} Estructura, consentimiento, puntos, tiempo o lateralidad incompatibles.
 */
export function validateRecording(value) {
  if (
    !value ||
    value.version !== 1 ||
    !validCode(value.participantId) ||
    !validCode(value.sessionId) ||
    !validCode(value.id) ||
    !LSV_LABELS.includes(value.label) ||
    value.consent !== true ||
    !['train', 'validation', 'test'].includes(value.partition) ||
    !['PENDING_LSV_REVIEW', 'APPROVED_LSV'].includes(value.reviewStatus)
  )
    throw new Error('Muestra inválida: revisa etiqueta, códigos, grupo y consentimiento');
  if (value.reviewStatus === 'APPROVED_LSV' && !validCode(value.reviewerId))
    throw new Error('Falta el código de la persona que revisó la muestra');
  const frames = validateFrames(value.frames);
  return {
    version: 1,
    id: value.id,
    label: value.label,
    participantId: value.participantId,
    sessionId: value.sessionId,
    partition: value.partition,
    consent: true,
    reviewStatus: value.reviewStatus,
    reviewerId: value.reviewerId ?? null,
    frames,
    ...(value.reviewEvidence !== undefined
      ? { reviewEvidence: validateReviewEvidence(value.reviewEvidence, value.label) }
      : {}),
    ...recordingHandMetadata(value, frames),
    ...(value.source !== undefined ? { source: validateVideoSource(value.source, frames) } : {}),
  };
}

export { validateFrames } from './recording-frames.js';
