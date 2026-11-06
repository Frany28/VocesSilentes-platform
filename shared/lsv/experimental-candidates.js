import { validateExperimentalRecording } from './experimental-recording.js';

/**
 * Adapta puntos de cuarentena a borradores provisionales; excluye video_04, rechazos y etiquetas desconocidas.
 * @param {object} data Cuarentena privada de MediaPipe, sin alterarla.
 * @returns {object[]} Borradores sin confirmación manual ni autorizaciones inventadas.
 * @throws {Error} Exportación o fuente ausente/incompatible.
 */
export function experimentalCandidates(data) {
  if (data?.type !== 'QUARANTINE_NOT_TRAINING_DATA' || !Array.isArray(data.candidates))
    throw new Error('Importa la cuarentena de observaciones original');
  return data.candidates
    .filter(
      (item) =>
        item.videoId !== 'video_04' && item.label && item.technicalStatus === 'VALID_GEOMETRY',
    )
    .map((item) => {
      const source = data.sources.find((entry) => entry.id === item.videoId);
      if (!source) throw new Error('Falta la fuente de esta ejecución');
      return validateExperimentalRecording({
        version: 1,
        type: 'LOCAL_EXPERIMENTAL_SAMPLE',
        id: item.id,
        label: item.label,
        sessionId: `file_${source.sha256.slice(0, 48)}`,
        participantId: null,
        observedSignant: item.observedSignant ?? null,
        consent: null,
        partition: null,
        reviewStatus: 'PENDING_LSV_REVIEW',
        reviewerId: null,
        frames: item.frames,
        labelConfirmation: null,
        source: {
          type: 'LOCAL_VIDEO',
          sha256: source.sha256,
          executionId: item.executionId,
          origin: source.origin,
          startMs: item.startMs,
          endMs: item.endMs,
          authorizationStatus: data.permission.status,
          authorizationReference: data.permission.reference,
          evidenceReference: data.permission.evidenceReference,
        },
      });
    });
}
