import { validateRecording } from './recording.js';
import { validateReviewEvidence, assertNegativeScope } from './review-evidence.js';
import { trainingSequence } from './sequence-quality.js';

/**
 * Exige captura real, consentimiento y trazabilidad LSV antes de preparar características.
 * Exportaciones antiguas se pueden inspeccionar; no se promocionan a datos revisados automáticamente.
 * @param {object} input Grabación del laboratorio.
 * @param {string[]} labels Clases a entrenar/evaluar; determinan el alcance de NONE.
 * @returns {object} Muestra revisada y secuencia normalizada.
 * @throws {Error} Revisión, evidencia, procedencia, alcance negativo o geometría insuficientes.
 */
export function trainableRecording(input, labels) {
  const sample = validateRecording(input);
  if (sample.reviewStatus !== 'APPROVED_LSV')
    throw new Error('Hay muestras pendientes de revisión LSV; no se entrenó ningún modelo');
  sample.reviewEvidence = validateReviewEvidence(sample.reviewEvidence, sample.label);
  if (sample.dataOrigin === 'LEGACY_UNSPECIFIED')
    throw new Error('Documenta si la muestra original procede de cámara o video autorizado.');
  assertNegativeScope(sample, labels);
  return {
    ...sample,
    participantId: sample.participantId.toLowerCase(),
    hand: sample.frames[0].hand,
    sequence: trainingSequence(sample),
  };
}

/**
 * Impide que el flujo provisional entrene videos con consentimiento o permiso todavía pendientes.
 * @param {object} sample Muestra provisional validada; su etiqueta sigue sin aprobación lingüística.
 * @returns {void} Sin cambios en la muestra ni en modelos existentes.
 * @throws {Error} Participante, consentimiento o permiso de entrenamiento no documentados.
 */
export function assertExperimentalConsent(sample) {
  if (sample.consent !== true || !sample.participantId)
    throw new Error(
      'Documenta participante y consentimiento antes de entrenar, también en modo provisional.',
    );
  if (
    sample.source.type === 'LOCAL_VIDEO' &&
    (sample.source.authorizationStatus !== 'VERIFIED_FOR_TRAINING' ||
      !sample.source.authorizationReference ||
      !sample.source.evidenceReference)
  )
    throw new Error(
      'El video necesita permiso documentado para entrenamiento; una etiqueta confirmada no basta.',
    );
  trainingSequence(sample);
}
