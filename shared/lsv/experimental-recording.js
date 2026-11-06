import { validateFrames } from './recording.js';
import { LSV_LABELS } from './labels.js';

const code = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value);

/**
 * Valida el contrato provisional separado; nunca inventa consentimiento, identidad ni revisión LSV.
 * @param {object} value Muestra local con documentación real, que puede seguir pendiente.
 * @param {boolean} [confirmed] Exige confirmación manual para entrenar.
 * @returns {object} Muestra exportable sin particiones ni aprobación lingüística.
 * @throws {Error} Contrato, geometría, procedencia o confirmación incompatibles.
 */
export function validateExperimentalRecording(value, confirmed = false) {
  if (
    value?.version !== 1 ||
    value.type !== 'LOCAL_EXPERIMENTAL_SAMPLE' ||
    !code(value.id) ||
    !code(value.sessionId) ||
    !LSV_LABELS.includes(value.label) ||
    value.partition !== null ||
    value.reviewStatus !== 'PENDING_LSV_REVIEW' ||
    value.reviewerId !== null ||
    ![true, false, null].includes(value.consent) ||
    (value.participantId !== null && !code(value.participantId)) ||
    (value.observedSignant !== null && !code(value.observedSignant))
  )
    throw new Error('Muestra experimental incompatible; no modifica el flujo revisado');
  const frames = validateFrames(value.frames);
  const source = value.source;
  if (!source || !['CAMERA', 'LOCAL_VIDEO'].includes(source.type))
    throw new Error('Falta la procedencia experimental');
  if (source.type === 'CAMERA' && (value.consent !== true || !code(value.participantId)))
    throw new Error('La captura requiere código de participante y consentimiento');
  if (
    source.type === 'LOCAL_VIDEO' &&
    (!/^[a-f0-9]{64}$/.test(source.sha256) ||
      !code(source.executionId) ||
      typeof source.origin !== 'string' ||
      typeof source.authorizationStatus !== 'string' ||
      !Number.isFinite(source.startMs) ||
      !Number.isFinite(source.endMs) ||
      source.startMs < 0 ||
      source.endMs <= source.startMs ||
      frames[0].t < 0 ||
      frames.at(-1).t > source.endMs - source.startMs + 1)
  )
    throw new Error('Procedencia o intervalo experimental inválido');
  const confirmation = value.labelConfirmation;
  if (
    confirmation !== null &&
    (confirmation?.label !== value.label ||
      !code(confirmation.reviewerId) ||
      !Number.isFinite(Date.parse(confirmation.confirmedAt)) ||
      confirmation.status !== 'MANUALLY_CONFIRMED')
  )
    throw new Error('Confirmación manual incompatible con la etiqueta');
  if (confirmed && !confirmation)
    throw new Error(`Confirma manualmente la etiqueta de ${value.id}`);
  return {
    version: 1,
    type: 'LOCAL_EXPERIMENTAL_SAMPLE',
    id: value.id,
    label: value.label,
    sessionId: value.sessionId,
    participantId: value.participantId,
    observedSignant: value.observedSignant,
    partition: null,
    consent: value.consent,
    reviewStatus: 'PENDING_LSV_REVIEW',
    reviewerId: null,
    frames,
    labelConfirmation: confirmation
      ? {
          status: 'MANUALLY_CONFIRMED',
          label: confirmation.label,
          reviewerId: confirmation.reviewerId,
          confirmedAt: confirmation.confirmedAt,
        }
      : null,
    source:
      source.type === 'CAMERA'
        ? { type: 'CAMERA' }
        : {
            type: 'LOCAL_VIDEO',
            sha256: source.sha256,
            executionId: source.executionId,
            origin: source.origin,
            startMs: source.startMs,
            endMs: source.endMs,
            authorizationStatus: source.authorizationStatus,
            authorizationReference: source.authorizationReference ?? null,
            evidenceReference: source.evidenceReference ?? null,
          },
  };
}
