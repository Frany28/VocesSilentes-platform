import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { compareHandExperiments } from '../../shared/lsv/hand-experiments.js';

// No lee .env ni conecta con Supabase. Conserva el modelo anterior en su ruta original.
try {
  if (process.env.NODE_ENV === 'production') throw new Error('Solo comparación experimental local');
  const args = process.argv.slice(2);
  const files = [];
  let output = '.local/lsv-hands';
  let policy = null;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--output') output = args[++i];
    else if (args[i] === '--augmentation') policy = JSON.parse(await readFile(args[++i], 'utf8'));
    else if (args[i].startsWith('--')) throw new Error('Opción desconocida');
    else files.push(args[i]);
  }
  if (!files.length || !output)
    throw new Error(
      'Uso: pnpm lsv:compare:hands lote.json --output .local/comparacion [--augmentation validacion.json]',
    );
  const samples = [];
  const sources = [];
  for (const file of files) {
    const bytes = await readFile(file);
    if (bytes.length > 16 * 1024 * 1024) throw new Error('Máximo 16 MiB por archivo');
    const data = JSON.parse(bytes);
    if (data.version !== 1 || !Array.isArray(data.samples))
      throw new Error('Exportación incompatible');
    samples.push(...data.samples);
    sources.push(createHash('sha256').update(bytes).digest('hex'));
  }
  if (samples.length > 3000) throw new Error('Máximo 3000 capturas');
  const result = compareHandExperiments(samples, policy);
  const directory = resolve(output);
  await mkdir(directory, { recursive: true });
  for (const [name, experiment] of Object.entries(result.experiments)) {
    if (experiment.model)
      await writeFile(join(directory, `model-${name}.json`), JSON.stringify(experiment.model));
  }
  const report = {
    ...result,
    sources,
    runtime: process.version,
    generatedAt: new Date().toISOString(),
    experiments: Object.fromEntries(
      Object.entries(result.experiments).map(([name, { model, ...report }]) => [
        name,
        { ...report, modelFile: model ? `model-${name}.json` : null },
      ]),
    ),
  };
  await writeFile(join(directory, 'comparison.json'), JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      output: directory,
      testSamples: result.evaluation.testSamples,
      experiments: Object.fromEntries(
        Object.entries(result.experiments).map(([name, run]) => [name, run.status]),
      ),
    }),
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
