import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { trainExperimentalModel } from '../../shared/lsv/experimental-train.js';

// CLI deliberada: sin .env, red, Prisma, evaluación académica ni reutilización del entrenador revisado.
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');
const output = outputIndex < 0 ? '.local/lsv-experimental' : args[outputIndex + 1];
const files = args.filter(
  (_, index) => index !== outputIndex && !(outputIndex >= 0 && index === outputIndex + 1),
);
try {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Solo se permite entrenamiento experimental local');
  if (!files.length || !output)
    throw new Error('Uso: pnpm lsv:train:experimental muestras.json --output .local/modelo');
  const samples = [];
  for (const file of files) {
    const bytes = await readFile(file);
    if (bytes.length > 16 * 1024 * 1024)
      throw new Error('Divide el lote en archivos menores de 16 MB');
    const data = JSON.parse(bytes);
    if (data.version !== 1 || !Array.isArray(data.samples))
      throw new Error('Exportación experimental incompatible');
    samples.push(...data.samples);
  }
  const { model, report } = trainExperimentalModel(samples);
  const directory = resolve(output);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'lsv-experimental-model.json'), JSON.stringify(model));
  await writeFile(join(directory, 'experimental-summary.json'), JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      status: model.status,
      mode: model.trainingMode,
      samples: samples.length,
      labels: model.labels,
      independentEvaluation: false,
      accuracy: null,
      output: directory,
    }),
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
