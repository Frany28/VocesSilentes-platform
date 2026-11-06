import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { candidateEligibility } from './candidate-policy.js';
import { createSampleRegistry } from '../../../shared/lsv/sample-conflicts.js';
import { trainingCoverage, PILOT_LABELS } from '../../../shared/lsv/coverage.js';

/**
 * Escribe cuarentena, exportaciones y reporte real sin promover permisos ni identidades pendientes.
 * @param {string} directory Directorio privado local.
 * @param {object[]} records Candidatos técnicamente procesados.
 * @param {object[]} sources Metadatos de origen verificados por hash.
 * @param {object} manifest Anotaciones y declaraciones humanas.
 * @returns {Promise<object>} Reporte, listo para inspección; no llama al entrenador.
 */
export async function writeCandidateReport(directory, records, sources, manifest) {
  const samples = [];
  const publicSources = sources.map(({ id, sha256, origin, duration, width, height, fps }) => ({
    id,
    sha256,
    origin,
    duration,
    width,
    height,
    fps,
  }));
  const registry = createSampleRegistry();
  const details = records.map((candidate) => {
    const source = sources.find((item) => item.id === candidate.videoId);
    let eligibility;
    try {
      eligibility = candidateEligibility(candidate, source, manifest);
      if (eligibility.sample) {
        registry.add(eligibility.sample);
        samples.push(eligibility.sample);
      }
    } catch (error) {
      eligibility = { sample: null, blocked: [`CONTRACT_CONFLICT: ${error.message}`] };
    }
    const { frames, ...summary } = candidate;
    return {
      ...summary,
      observations: frames.length,
      blocked: eligibility.blocked,
      trainingReady: Boolean(eligibility.sample) && eligibility.blocked.length === 0,
    };
  });
  const ready = samples.filter((sample) => sample.reviewStatus === 'APPROVED_LSV');
  const report = {
    version: 1,
    permission: manifest.permission,
    participantIndependenceConfirmed: manifest.participantIndependenceConfirmed === true,
    observedSignants: manifest.observedSignants,
    labelCatalog: manifest.labelCatalog ?? null,
    partitionStatus: 'NO_AUTOMATIC_PARTICIPANT_ASSIGNMENT',
    totalCandidates: records.length,
    validGeometry: records.filter((item) => item.technicalStatus === 'VALID_GEOMETRY').length,
    rejectedGeometry: records.filter((item) => item.technicalStatus === 'REJECTED').length,
    preparedSamples: samples.length,
    trainingReady: ready.length,
    sources: publicSources.map((source) => ({
      ...source,
      candidates: details.filter((item) => item.videoId === source.id),
    })),
    coverage: trainingCoverage(ready),
    technicalCoverage: PILOT_LABELS.map((label) => ({
      label,
      valid: records.filter(
        (item) => item.label === label && item.technicalStatus === 'VALID_GEOMETRY',
      ).length,
      rejected: records.filter(
        (item) => item.label === label && item.technicalStatus === 'REJECTED',
      ).length,
    })),
    required: [
      'Evidencia y alcance del permiso AUT-LSV-EDU-001',
      'Correspondencia humana de señantes, consentimiento y particiones independientes',
      'Revisión lingüística por muestra y negativos del piloto',
      'Completar etiquetas y ventanas rechazadas',
    ],
  };
  const artifacts = {
    'candidate-observations.json': {
      version: 1,
      type: 'QUARANTINE_NOT_TRAINING_DATA',
      permission: manifest.permission,
      sources: publicSources,
      candidates: records,
    },
    'prepared-samples.json': { version: 1, samples },
    'training-ready.json': { version: 1, samples: ready },
    'report.json': report,
  };
  for (const [name, content] of Object.entries(artifacts))
    await writeFile(join(directory, name), JSON.stringify(content, null, 2));
  const text = [
    `Candidatos: ${report.totalCandidates}`,
    `Geometría válida: ${report.validGeometry}`,
    `Rechazados técnicamente: ${report.rejectedGeometry}`,
    `Listos para entrenar: ${report.trainingReady}`,
    'Geometría válida no significa seña correcta ni permiso confirmado.',
    ...report.required,
    ...details.map(
      (item) =>
        `${item.id}: ${item.technicalStatus}; ${item.technicalReason ?? ''}; ${item.blocked.join(', ')}`,
    ),
  ];
  await writeFile(join(directory, 'report.txt'), text.join('\n'));
  return report;
}
