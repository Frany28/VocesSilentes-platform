import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { readAuditBatches } from './lsv/audit-batches.js';
import { labelReadiness, READINESS_CRITERIA } from '../../shared/lsv/readiness.js';
import { auditTrainingSamples } from '../../shared/lsv/sample-audit.js';

// Sin argumentos informa ausencia de datos. No busca muestras privadas ni las deduce desde el modelo publicado.
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');
const output = outputIndex < 0 ? null : args[outputIndex + 1];
const json = args.includes('--json');
const paths = args.filter(
  (value, index) =>
    !['--json', '--output'].includes(value) && index !== (outputIndex < 0 ? -1 : outputIndex + 1),
);
try {
  if ((outputIndex >= 0 && !output) || paths.some((path) => path.startsWith('--')))
    throw new Error(
      'Uso: pnpm lsv:readiness [lote.json ...] [--json] [--output .local/auditoria.json]',
    );
  if (output && paths.some((path) => resolve(path) === resolve(output)))
    throw new Error('El informe no puede sobrescribir un lote de muestras.');
  const { samples, sourceSha256 } = await readAuditBatches(paths);
  const audit = auditTrainingSamples(samples);
  const classes = labelReadiness(samples);
  const report = {
    version: 1,
    trainingExecuted: false,
    metrics: null,
    samples: samples.length,
    eligible: audit.accepted.length,
    rejected: audit.rejected,
    sourceSha256,
    criteria: READINESS_CRITERIA,
    classes,
    blockingReasons: audit.errors,
    warning:
      'Disponibilidad y declaraciones documentales; no certifica personas, derechos ni competencia LSV.',
  };
  if (output) {
    await mkdir(dirname(resolve(output)), { recursive: true });
    await writeFile(resolve(output), JSON.stringify(report, null, 2));
  }
  if (json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Muestras: ${samples.length}. Elegibles: ${audit.accepted.length}. No se entrenó.`);
    for (const row of classes)
      console.log(
        `${row.label}\t${row.status}\t${row.available} disponibles\t${row.missing.join('; ')}`,
      );
    console.log(
      `Listas para evaluar: ${classes.filter((row) => row.status === 'READY_FOR_EVALUATION').length}/28.`,
    );
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
