import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { readTrainingDataset } from './lsv/dataset.js';
import { trainLsvModel } from '../../shared/lsv/train.js';
import { LSV_LABELS } from '../../shared/lsv/labels.js';

// Entrenamiento deliberado local: sin .env, cámaras, red, Prisma ni datos de estudiantes de la API.
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');
const labelsIndex = args.indexOf('--labels');
const output = outputIndex >= 0 ? args[outputIndex + 1] : '.local/lsv-model';
const labels = labelsIndex >= 0 ? args[labelsIndex + 1]?.split(',') : [...LSV_LABELS];
const files = args.filter(
  (value, index) =>
    !['--output', '--labels'].includes(value) &&
    !(outputIndex >= 0 && index === outputIndex + 1) &&
    !(labelsIndex >= 0 && index === labelsIndex + 1),
);
if (!files.length || !output || !labels) {
  console.error(
    'Uso: pnpm lsv:train muestras.json [otras.json] --output .local/modelo [--labels A,E,I,O,U,NONE]',
  );
  process.exitCode = 1;
} else
  try {
    const dataset = await readTrainingDataset(files);
    const { model, report } = trainLsvModel(dataset, labels);
    const directory = resolve(output);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'lsv-model.json'), JSON.stringify(model));
    await writeFile(join(directory, 'evaluation.json'), JSON.stringify(report, null, 2));
    console.log(
      JSON.stringify({
        model: 'EXPERIMENTAL',
        labels: labels.length,
        samples: dataset.records.length,
        testSamples: report.total,
        accuracy: report.accuracy,
        abstained: report.abstained,
        output: directory,
      }),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
