import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { test } from 'node:test';
import { evaluateEngine, predictCapture } from '../../shared/lsv/engine/evaluation.js';
import { letterSequence } from './fixtures/synthetic-hand.js';

// Verifica el cálculo de métricas con geometría SINTÉTICA. Estas cifras no son precisión real.
const run = promisify(execFile);
const capture = (pose, hand = 'Right', at) =>
  letterSequence(at ?? (() => ({ pose })), { hand, fps: 15, durationMs: 2000 }).map((frame) => ({
    ...frame,
    width: 640,
    height: 480,
    points: frame.points.map(([x, y, z]) => [x, y, z]),
  }));

test('predicción de conjunto abierto: letra, movimiento, NONE y abstención', () => {
  const labels = ['L', 'U', 'V', 'J', 'NONE'];
  assert.equal(predictCapture(capture('L'), labels), 'L');
  assert.equal(predictCapture(capture('V', 'Left'), labels), 'V');
  assert.equal(predictCapture(capture('OPEN_FIVE'), labels), 'NONE');
  const turned = capture('I', 'Right', (t, k) => ({
    pose: 'I',
    options: { yaw: Math.min(1, k * 1.4) * 80 },
  }));
  assert.equal(predictCapture(turned, labels), 'J');
  // La I quieta no es J: sin movimiento y fuera de las etiquetas estáticas evaluadas.
  assert.notEqual(predictCapture(capture('I'), labels), 'J');
});

test('evaluación: matriz de confusión, desglose por mano, verificación y latencia', () => {
  const samples = [
    ['L', 'Right', 'p1'],
    ['L', 'Left', 'p2'],
    ['U', 'Right', 'p1'],
    ['U', 'Left', 'p2'],
    ['NONE', 'Right', 'p1'],
  ].map(([label, hand, participantId]) => ({
    label,
    observedHand: hand,
    participantId,
    frames: capture(label === 'NONE' ? 'OPEN_FIVE' : label, hand),
  }));
  const report = evaluateEngine(samples, ['L', 'U', 'V', 'NONE']);
  assert.equal(report.samples, 5);
  assert.equal(report.participants, 2);
  assert.equal(report.openSet.confusionMatrix.L.L, 2);
  assert.equal(report.openSet.confusionMatrix.U.U, 2);
  assert.equal(report.openSet.confusionMatrix.NONE.NONE, 1);
  assert.equal(report.byHand.Left.samples, 2);
  assert.equal(report.verification.falseRejectionRate, 0);
  assert.equal(report.verification.falseAcceptanceRate, 0);
  assert.ok(report.latencyMsPerFrame.median >= 0);
});

test('CLI: informa ausencia de archivos y evalúa un lote válido sin escribir fuera de --output', async () => {
  const script = resolve(import.meta.dirname, '../scripts/lsv-engine-evaluate.js');
  await assert.rejects(run(process.execPath, [script]), /Uso: pnpm lsv:engine:evaluate/);
  const folder = await mkdtemp(join(tmpdir(), 'lsv-engine-'));
  try {
    const sample = (id, label, pose, hand) => ({
      version: 1,
      id,
      label,
      participantId: 'p_test',
      sessionId: 's_test',
      partition: 'test',
      consent: true,
      reviewStatus: 'PENDING_LSV_REVIEW',
      frames: capture(pose, hand),
    });
    const batch = join(folder, 'lote.json');
    const output = join(folder, 'informe.json');
    await writeFile(
      batch,
      JSON.stringify({
        version: 1,
        samples: [
          sample('a1', 'A', 'A', 'Right'),
          sample('a2', 'A', 'A', 'Left'),
          sample('n1', 'NONE', 'OPEN_FIVE', 'Right'),
        ],
      }),
    );
    const { stdout } = await run(process.execPath, [script, batch, '--output', output]);
    assert.equal(JSON.parse(stdout).samples, 3);
    const report = JSON.parse(await readFile(output, 'utf8'));
    assert.equal(report.thresholds, 'UNCALIBRATED_ANATOMICAL');
    assert.equal(report.reviewedSamples, 0);
    assert.match(report.warning, /no constituyen una validación/);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});
