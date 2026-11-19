import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { syntheticRecording } from './fixtures/lsv-synthetic.js';

test('auditoría sin muestras informa las 28 clases y métricas null, sin buscar datos privados', () => {
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(new URL('../scripts/lsv-readiness.js', import.meta.url)), '--json'],
    { encoding: 'utf8', windowsHide: true },
  );
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.classes.length, 28);
  assert.equal(report.classes.at(-1).label, 'NONE');
  assert.equal(report.samples, 0);
  assert.equal(report.metrics, null);
  assert.equal(report.trainingExecuted, false);
});

test('auditoría identifica pendientes, admite BOM y exporta agregados sin puntos ni códigos personales', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'vs-lsv-audit-test-'));
  try {
    const sample = syntheticRecording('A', 'train');
    sample.reviewStatus = 'PENDING_LSV_REVIEW';
    const input = join(directory, 'samples.json');
    const output = join(directory, 'audit.json');
    await writeFile(input, '\uFEFF' + JSON.stringify({ version: 1, samples: [sample] }));
    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL('../scripts/lsv-readiness.js', import.meta.url)),
        input,
        '--json',
        '--output',
        output,
      ],
      { encoding: 'utf8', windowsHide: true },
    );
    assert.equal(result.status, 0, result.stderr);
    const contents = await readFile(output, 'utf8');
    const report = JSON.parse(contents);
    assert.equal(report.classes[0].available, 1);
    assert.equal(report.classes[0].eligible, 0);
    assert.equal(report.sourceSha256.length, 1);
    assert.doesNotMatch(contents, /test_train|"points"|"frames"/);
    const unsafe = spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL('../scripts/lsv-readiness.js', import.meta.url)),
        input,
        '--output',
        input,
      ],
      { encoding: 'utf8', windowsHide: true },
    );
    assert.equal(unsafe.status, 1);
    assert.match(unsafe.stderr, /sobrescribir/);
  } finally {
    const verified = resolve(directory);
    assert.ok(
      verified.startsWith(resolve(tmpdir()) + sep) && verified.includes('vs-lsv-audit-test-'),
    );
    await rm(verified, { recursive: true, force: true });
  }
});
