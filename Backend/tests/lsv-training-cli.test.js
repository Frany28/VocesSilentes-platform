import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readTrainingDataset } from '../scripts/lsv/dataset.js';
import { syntheticDataset } from './fixtures/lsv-synthetic.js';

test('CLI: entrena únicamente archivos explícitos y produce modelo/evaluación locales, sin API ni base de datos', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'vs-lsv-training-test-'));
  try {
    const input = join(directory, 'software-fixture.json');
    await writeFile(input, JSON.stringify({ version: 1, samples: syntheticDataset() }));
    const data = await readTrainingDataset([input]);
    assert.equal(data.records.length, 6);
    assert.equal(data.sources.length, 1);
    const outcome = spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL('../scripts/train-lsv.js', import.meta.url)),
        input,
        '--output',
        join(directory, 'model'),
        '--labels',
        'A,NONE',
      ],
      { encoding: 'utf8', windowsHide: true },
    );
    assert.equal(outcome.status, 0, outcome.stderr);
    const model = JSON.parse(await readFile(join(directory, 'model/lsv-model.json'), 'utf8'));
    const report = JSON.parse(await readFile(join(directory, 'model/evaluation.json'), 'utf8'));
    assert.equal(model.status, 'EXPERIMENTAL');
    assert.equal(report.total, 2);
    assert.equal(model.sources[0], data.sources[0]);
    await writeFile(
      input,
      JSON.stringify({
        version: 1,
        samples: syntheticDataset().map((sample) => ({
          ...sample,
          reviewStatus: 'PENDING_LSV_REVIEW',
        })),
      }),
    );
    await assert.rejects(readTrainingDataset([input]), /pendientes/);
  } finally {
    const verified = resolve(directory);
    assert.ok(
      verified.startsWith(resolve(tmpdir()) + sep) && verified.includes('vs-lsv-training-test-'),
    );
    await rm(verified, { recursive: true, force: true });
  }
});
