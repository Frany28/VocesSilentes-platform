import { createHash } from 'node:crypto';

/**
 * Identifica las ejecuciones de test y la configuración para comparar modelos sobre el mismo conjunto.
 * @param {object} dataset Registros privados validados y hashes de archivos.
 * @param {object} model Modelo experimental fijado sin ajustar con test.
 * @returns {object} Huellas SHA-256 reproducibles; no contiene puntos ni datos personales.
 */
export function trainingFingerprint(dataset, model) {
  const test = dataset.records
    .filter((sample) => sample.partition === 'test' && model.labels.includes(sample.label))
    .sort((a, b) => a.id.localeCompare(b.id, 'en'))
    .map(({ id, participantId, label, hand, frames }) => ({
      id,
      participantId,
      label,
      hand,
      frames,
    }));
  const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  return {
    pipelineVersion: 'lsv-reviewed-dtw-v2',
    nodeVersion: process.versions.node,
    sourceSha256: [...dataset.sources],
    modelSha256: digest(model),
    testSetSha256: digest(test),
    testSamples: test.length,
  };
}
