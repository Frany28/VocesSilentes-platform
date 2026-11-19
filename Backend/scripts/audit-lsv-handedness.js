import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { LSV_LABELS } from '../../shared/lsv/labels.js';
import { trainableRecording } from '../../shared/lsv/training-eligibility.js';

// Inventarios separados: el piloto reutiliza recortes; no sumar filas como personas o ejecuciones nuevas.
const inventories = [
  ['demo', 'Frontend/public/models/lsv-vowels-demo-v1.json'],
  ['pilot', '.local/lsv-experimental/experimental-samples.json'],
  ['candidates', 'datos-entrenamiento/preparado/candidate-observations.json'],
  ['prepared', 'datos-entrenamiento/preparado/prepared-samples.json'],
  ['ready', 'datos-entrenamiento/preparado/training-ready.json'],
];
const reports = [];
for (const [inventory, path] of inventories) {
  let bytes;
  try {
    bytes = await readFile(path);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    reports.push({ inventory, path, available: false });
    continue;
  }
  const data = JSON.parse(bytes);
  const samples = data.prototypes ?? data.samples ?? data.candidates;
  if (!Array.isArray(samples)) throw new Error(`Inventario incompatible: ${inventory}`);
  const labels = Object.fromEntries(
    LSV_LABELS.map((label) => [label, { Left: 0, Right: 0, unknown: 0 }]),
  );
  let unlabeled = 0;
  let eligible = 0;
  let missingParticipant = 0;
  for (const sample of samples) {
    if (!sample.participantId) missingParticipant += 1;
    const hands = sample.hand
      ? [sample.hand]
      : [...new Set(sample.frames?.map((frame) => frame.hand))];
    const hand = hands.length === 1 && ['Left', 'Right'].includes(hands[0]) ? hands[0] : 'unknown';
    if (labels[sample.label]) labels[sample.label][hand] += 1;
    else unlabeled += 1;
    if (inventory !== 'demo') {
      try {
        trainableRecording(sample, LSV_LABELS);
        eligible += 1;
      } catch {
        // La presencia de puntos o una etiqueta no demuestra elegibilidad para entrenar.
      }
    }
  }
  reports.push({
    inventory,
    path,
    available: true,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    total: samples.length,
    labels,
    unlabeled,
    trainingEligible: inventory === 'demo' ? null : eligible,
    missingParticipant,
    independentParticipants: null,
    anatomicalHandVerified: false,
  });
}
console.log(JSON.stringify({ reports, accuracy: null, linguisticValidation: 'PENDING' }, null, 2));
