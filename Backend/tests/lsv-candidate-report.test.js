import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { writeCandidateReport } from '../scripts/lsv/write-candidate-report.js';
import { readTrainingDataset } from '../scripts/lsv/dataset.js';
import { syntheticCandidateSet } from './fixtures/lsv-candidate-synthetic.js';

test('reporte real: conserva cuarentena técnica, enumera rechazos/faltantes y exporta cero muestras sin permiso', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'vs-lsv-candidate-test-'));
  try {
    const { candidate, source, manifest } = syntheticCandidateSet();
    manifest.permission.status = 'PERMISO_DECLARADO_PENDIENTE_DE_EVIDENCIA';
    manifest.participantIndependenceConfirmed = false;
    manifest.participants = [];
    const failed = {
      ...candidate,
      id: 'rejected_software_fixture',
      frames: [],
      technicalStatus: 'REJECTED',
      technicalReason: 'Software fixture: no hand observed',
    };
    const report = await writeCandidateReport(directory, [candidate, failed], [source], manifest);
    assert.equal(report.validGeometry, 1);
    assert.equal(report.rejectedGeometry, 1);
    assert.equal(report.trainingReady, 0);
    assert.equal(report.coverage.minimumCovered, false);
    const quarantine = JSON.parse(
      await readFile(join(directory, 'candidate-observations.json'), 'utf8'),
    );
    assert.equal(quarantine.type, 'QUARANTINE_NOT_TRAINING_DATA');
    assert.deepEqual(quarantine.candidates[0].frames, candidate.frames);
    assert.equal(quarantine.sources[0].file, undefined);
    const prepared = JSON.parse(await readFile(join(directory, 'prepared-samples.json'), 'utf8'));
    assert.deepEqual(prepared, { version: 1, samples: [] });
    await assert.rejects(
      readTrainingDataset([join(directory, 'training-ready.json')]),
      /muestras reales/,
    );
  } finally {
    const verified = resolve(directory);
    assert.ok(
      verified.startsWith(resolve(tmpdir()) + sep) && verified.includes('vs-lsv-candidate-test-'),
    );
    await rm(verified, { recursive: true, force: true });
  }
});
