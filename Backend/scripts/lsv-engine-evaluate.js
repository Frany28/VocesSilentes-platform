import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { readAuditBatches } from './lsv/audit-batches.js';
import { validateRecording } from '../../shared/lsv/recording.js';
import { LSV_LABELS } from '../../shared/lsv/labels.js';
import { evaluateEngine } from '../../shared/lsv/engine/evaluation.js';
import { THRESHOLDS_STATUS } from '../../shared/lsv/engine/thresholds.js';

// Mide el motor geométrico con muestras REALES exportadas por el laboratorio. No entrena ni ajusta.
// Uso: pnpm lsv:engine:evaluate lote.json [...] [--partition test|validation|train|all]
//      [--labels A,B,NONE] [--output .local/evaluacion-motor.json]
const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index < 0 ? null : args[index + 1];
};
const partition = option('--partition') ?? 'test';
const output = option('--output');
const optionValues = new Set(
  ['--partition', '--labels', '--output'].map(option).filter((value) => value !== null),
);
const paths = args.filter((value) => !value.startsWith('--') && !optionValues.has(value));
try {
  if (!paths.length)
    throw new Error(
      'Uso: pnpm lsv:engine:evaluate lote.json [...] [--partition test] [--labels A,B,NONE] [--output informe.json]',
    );
  const { samples: raw, sourceSha256 } = await readAuditBatches(paths);
  const rejected = [];
  const samples = raw.flatMap((item) => {
    try {
      return [validateRecording(item)];
    } catch (error) {
      rejected.push({ id: item?.id ?? null, reason: error.message });
      return [];
    }
  });
  const selected = samples.filter((item) => partition === 'all' || item.partition === partition);
  const labels =
    option('--labels')?.split(',') ??
    LSV_LABELS.filter((label) => selected.some((item) => item.label === label));
  if (!labels.includes('NONE')) labels.push('NONE');
  if (!selected.length) throw new Error(`No hay muestras válidas en la partición «${partition}».`);
  const report = {
    version: 1,
    generatedAt: new Date().toISOString(),
    partition,
    thresholds: THRESHOLDS_STATUS,
    sourceSha256,
    rejected,
    reviewedSamples: selected.filter((item) => item.reviewStatus === 'APPROVED_LSV').length,
    warning:
      'Métricas de software sobre las muestras indicadas. Sin revisión LSV y participantes independientes por partición no constituyen una validación del reconocimiento.',
    ...evaluateEngine(selected, labels),
  };
  if (output) {
    await mkdir(dirname(resolve(output)), { recursive: true });
    await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  }
  const { openSet, verification, byHand } = report;
  console.log(
    JSON.stringify(
      {
        samples: report.samples,
        participants: report.participants,
        accuracy: openSet.accuracy,
        macroF1: openSet.macroF1,
        abstained: openSet.abstained,
        falseRejectionRate: verification.falseRejectionRate,
        falseAcceptanceRate: verification.falseAcceptanceRate,
        byHand: Object.fromEntries(
          Object.entries(byHand).map(([hand, item]) => [hand, item.accuracy]),
        ),
        latencyMsPerFrame: report.latencyMsPerFrame,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
