import { validateRecording } from '../../../../../shared/lsv/recording.js';
import { validateExperimentalRecording } from '../../../../../shared/lsv/experimental-recording.js';
import { experimentalCandidates } from '../../../../../shared/lsv/experimental-candidates.js';
import { createSampleRegistry } from '../../../../../shared/lsv/sample-conflicts.js';

/**
 * Selecciona contratos separados para reutilizar la colección sin relajar el entrenador revisado.
 * @param {boolean} experimental Flujo provisional local.
 * @returns {object} Validación, captura, confirmación e importación atómica de muestras.
 */
export function samplePolicy(experimental) {
  const validate = experimental ? validateExperimentalRecording : validateRecording;
  const unique = (samples) => {
    if (samples.length > 100) throw new Error('Exporta este lote antes de superar 100 muestras');
    const registry = createSampleRegistry();
    for (const sample of samples)
      registry.add({
        ...sample,
        participantId: sample.participantId ?? sample.observedSignant ?? 'unknown',
        partition: experimental ? sample.evaluationPartition : sample.partition,
      });
    return samples;
  };
  return {
    validate,
    unique,
    create: (metadata, frames, sessionId) =>
      validate({
        ...metadata,
        version: 1,
        id: crypto.randomUUID(),
        sessionId,
        frames,
        ...(!metadata.source ? { captureOrigin: 'LIVE_CAMERA' } : {}),
        reviewStatus: 'PENDING_LSV_REVIEW',
        reviewerId: null,
        ...(experimental
          ? {
              type: 'LOCAL_EXPERIMENTAL_SAMPLE',
              partition: null,
              evaluationPartition: metadata.partition,
              observedSignant: null,
              source: metadata.source
                ? {
                    type: 'LOCAL_VIDEO',
                    sha256: metadata.source.sha256,
                    executionId: metadata.source.executionId,
                    origin: metadata.source.origin,
                    startMs: metadata.source.startMs,
                    endMs: metadata.source.endMs,
                    authorizationStatus: 'DECLARED_BY_OPERATOR',
                    authorizationReference: metadata.source.authorization,
                    evidenceReference: null,
                  }
                : { type: 'CAMERA' },
              labelConfirmation: null,
            }
          : {}),
      }),
    review: (sample, reviewerId) =>
      validate(
        experimental
          ? {
              ...sample,
              labelConfirmation: {
                status: 'MANUALLY_CONFIRMED',
                label: sample.label,
                reviewerId,
                confirmedAt: new Date().toISOString(),
              },
            }
          : { ...sample, reviewerId, reviewStatus: 'APPROVED_LSV' },
      ),
    read: (data) => {
      if (experimental && data.type === 'QUARANTINE_NOT_TRAINING_DATA')
        return experimentalCandidates(data);
      if (data.version !== 1 || !Array.isArray(data.samples) || !data.samples.length)
        throw new Error('Se necesita una exportación de muestras del laboratorio');
      return data.samples.map((sample) => validate(sample));
    },
  };
}
