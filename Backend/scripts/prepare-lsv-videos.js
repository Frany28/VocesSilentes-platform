import { readFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLocalVideoSession } from './lsv/local-video-session.js';
import { extractLocalCandidates } from './lsv/extract-local-candidates.js';
import { writeCandidateReport } from './lsv/write-candidate-report.js';
import { applyCandidateReview } from './lsv/apply-candidate-review.js';
import { validatePreparationManifest } from './lsv/preparation-manifest.js';

// Preparación local explícita: no lee .env, no descarga fuentes, no usa Prisma y nunca inicia entrenamiento.
const root = resolve(fileURLToPath(new URL('../../datos-entrenamiento/', import.meta.url)));
const manifestPath = resolve(
  process.argv.slice(2).find((argument) => !argument.startsWith('--')) ??
    join(root, 'manifest.json'),
);
let session;
try {
  const manifest = validatePreparationManifest(
    JSON.parse((await readFile(manifestPath, 'utf8')).replace(/^\uFEFF/, '')),
  );
  const sources = [];
  for (const source of manifest.sources) {
    const file = resolve(root, source.file);
    if (!file.startsWith(root + sep)) throw new Error('Archivo fuera del conjunto local.');
    if (!/\.(mp4|webm)$/i.test(file) || (await stat(file)).size > 128 * 1024 * 1024)
      throw new Error('Solo archivos MP4/WebM locales de hasta 128 MB.');
    const sha256 = createHash('sha256')
      .update(await readFile(file))
      .digest('hex');
    if (sha256 !== source.sha256)
      throw new Error(`El archivo ${source.id} cambió; revisar sus anotaciones.`);
    sources.push({ ...source, file });
  }
  const output = join(root, 'preparado');
  await mkdir(output, { recursive: true });
  let records;
  if (process.argv.includes('--report-only')) {
    const quarantine = JSON.parse(
      await readFile(join(output, 'candidate-observations.json'), 'utf8'),
    );
    records = applyCandidateReview(quarantine, manifest);
  } else {
    session = await createLocalVideoSession(output);
    records = await extractLocalCandidates(
      session.page,
      sources,
      manifest.candidates,
      (event) => console.log(JSON.stringify(event)),
      { offline: process.argv.includes('--offline') },
    );
  }
  const report = await writeCandidateReport(output, records, sources, manifest);
  console.log(
    JSON.stringify({
      candidates: report.totalCandidates,
      validGeometry: report.validGeometry,
      rejected: report.rejectedGeometry,
      trainingReady: report.trainingReady,
    }),
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await session?.close();
}
