import { validateRecording } from './recording.js';
import { sequenceFeatures } from './sequence.js';
import { createSampleRegistry } from './sample-conflicts.js';

/**
 * Prepara datos revisados e independientes por persona, sin acceso a red, archivos, cámara o base de datos.
 * @param {unknown} samples Exportaciones consentidas del laboratorio.
 * @returns {object} Registros preparados y participantes; rechaza duplicados y fuga entre particiones.
 * @throws {Error} Muestras pendientes, repetidas, excesivas o participantes mezclados.
 */
export function prepareTrainingData(samples) {
  if (!Array.isArray(samples) || !samples.length || samples.length > 3000)
    throw new Error('Se necesitan entre 1 y 3000 muestras reales');
  const records = [];
  const independent = createSampleRegistry();
  const people = new Map();
  for (const input of samples) {
    const sample = validateRecording(input);
    if (sample.reviewStatus !== 'APPROVED_LSV')
      throw new Error('Hay muestras pendientes de revisión LSV; no se entrenó ningún modelo');
    independent.add(sample);
    const person = sample.participantId.toLowerCase();
    people.set(person, sample.partition);
    records.push({
      ...sample,
      participantId: person,
      hand: sample.frames[0].hand,
      sequence: sequenceFeatures(sample.frames),
    });
  }
  for (const partition of ['train', 'validation', 'test']) {
    if (!records.some((sample) => sample.partition === partition))
      throw new Error('Se necesitan personas distintas para entrenamiento, calibración y prueba');
  }
  return { records, participants: people.size, sources: [] };
}
