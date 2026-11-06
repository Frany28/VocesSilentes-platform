import { validateRecording } from '../../../shared/lsv/recording.js';
import { PILOT_LABELS } from '../../../shared/lsv/coverage.js';

/**
 * Distingue geometría útil de elegibilidad: no convierte archivos/señantes provisionales en personas independientes.
 * @param {object} candidate Intervalo anotado con observaciones técnicas reales.
 * @param {object} source Procedencia e identificador del archivo.
 * @param {object} manifest Permisos, correspondencias de personas y revisión humana declarados.
 * @returns {object} Bloqueos y muestra compatible solo cuando sus metadatos están confirmados; nunca entrena.
 */
export function candidateEligibility(candidate, source, manifest) {
  const blocked = [];
  const permission = manifest.permission;
  const person = manifest.participants?.find((item) => item.id === candidate.participantId);
  const track = manifest.observedSignants?.find((item) => item.id === candidate.observedSignant);
  if (
    permission?.status !== 'VERIFIED_FOR_TRAINING' ||
    permission.trainingScopeConfirmed !== true ||
    !permission.evidenceReference ||
    !permission.holder ||
    !permission.sourceIds?.includes(source.id) ||
    !['FRAME_EXTRACTION', 'MEDIAPIPE', 'AI_TRAINING'].every((scope) =>
      permission.scopes?.includes(scope),
    )
  )
    blocked.push('PERMISSION_SCOPE_AND_EVIDENCE_PENDING');
  if (
    person?.confirmed !== true ||
    person.consent !== true ||
    manifest.participantIndependenceConfirmed !== true ||
    track?.correspondenceConfirmed !== true ||
    track.confirmedParticipantId !== person?.id
  )
    blocked.push('PARTICIPANT_IDENTITY_CONSENT_AND_INDEPENDENCE_PENDING');
  if (
    person?.partitionConfirmed !== true ||
    !['train', 'validation', 'test'].includes(person?.partition)
  )
    blocked.push('DATA_PARTITION_PENDING');
  if (!PILOT_LABELS.includes(candidate.label) || !candidate.labelEvidence)
    blocked.push('LABEL_EVIDENCE_PENDING');
  if (candidate.technicalStatus !== 'VALID_GEOMETRY') blocked.push('TECHNICAL_SAMPLE_NOT_VALID');
  const reviewed = candidate.reviewStatus === 'APPROVED_LSV' && Boolean(candidate.reviewerId);
  if (!reviewed) blocked.push('LSV_REVIEW_PENDING');
  if (blocked.some((reason) => reason !== 'LSV_REVIEW_PENDING')) return { blocked, sample: null };
  const sample = validateRecording({
    version: 1,
    id: candidate.id,
    label: candidate.label,
    participantId: person.id,
    sessionId: `file_${source.sha256.slice(0, 48)}`,
    partition: person.partition,
    consent: true,
    frames: candidate.frames,
    reviewStatus: reviewed ? 'APPROVED_LSV' : 'PENDING_LSV_REVIEW',
    reviewerId: reviewed ? candidate.reviewerId : null,
    source: {
      type: 'LOCAL_VIDEO',
      sha256: source.sha256,
      executionId: candidate.executionId,
      origin: source.origin,
      authorization: `${permission.reference}: ${permission.evidenceReference}`,
      authorized: true,
      startMs: candidate.startMs,
      endMs: candidate.endMs,
    },
  });
  return { blocked, sample };
}
