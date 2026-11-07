import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { letterReadiness, READINESS_CRITERIA } from '../../shared/lsv/readiness.js';

// Uso: pnpm lsv:readiness [ruta-a-muestras.json]
// Lee solo metadatos (letra, partición, persona, revisión, mano) e informa qué falta por letra.
// No entrena, no genera muestras y no escribe archivos.
const fallback = fileURLToPath(
  new URL('../../.local/lsv-experimental/experimental-samples.json', import.meta.url),
);
const path = process.argv[2] ?? fallback;
let samples;
try {
  const parsed = JSON.parse(await readFile(path, 'utf8'));
  samples = Array.isArray(parsed) ? parsed : (parsed.samples ?? []);
} catch {
  console.error(`No se pudieron leer muestras en ${path}. Indica la ruta del JSON exportado.`);
  process.exit(1);
}
const rows = letterReadiness(samples);
console.log(
  `Muestras leídas: ${samples.length}. Revisadas LSV: ${samples.filter((item) => item.reviewStatus === 'APPROVED_LSV').length}.`,
);
console.log(
  `Criterios: ${JSON.stringify(READINESS_CRITERIA.participants)} personas, ${READINESS_CRITERIA.samplesPerParticipant}+ muestras por persona, manos ${READINESS_CRITERIA.hands.join('/')}.`,
);
for (const row of rows)
  console.log(
    `${row.label}${row.motion ? ' (movimiento)' : ''}\t${row.status}\t${row.missing.join('; ')}`,
  );
console.log(
  `Listas para evaluar: ${rows.filter((row) => row.status === 'READY_FOR_EVALUATION').length}/27.`,
);
