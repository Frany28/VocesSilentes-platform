import { test } from 'node:test';
import assert from 'node:assert/strict';
import { candidateEligibility } from '../scripts/lsv/candidate-policy.js';
import { applyCandidateReview } from '../scripts/lsv/apply-candidate-review.js';
import { validatePreparationManifest } from '../scripts/lsv/preparation-manifest.js';
import { prepareTrainingData } from '../../shared/lsv/training-data.js';
import { syntheticCandidateSet } from './fixtures/lsv-candidate-synthetic.js';

test('cuarentena: un archivo/track y un permiso declarado no prueban autorización IA ni personas independientes', () => {
  const { candidate, source, manifest } = syntheticCandidateSet();
  manifest.permission.status = 'PERMISO_DECLARADO_PENDIENTE_DE_EVIDENCIA';
  manifest.participantIndependenceConfirmed = false;
  manifest.participants = [];
  const result = candidateEligibility(candidate, source, manifest);
  assert.equal(result.sample, null);
  assert.equal(result.blocked.length, 4);
  assert.ok(result.blocked.includes('PERMISSION_SCOPE_AND_EVIDENCE_PENDING'));
  manifest.permission.status = 'VERIFIED_FOR_TRAINING';
  manifest.permission.scopes = ['MEDIAPIPE'];
  assert.equal(candidateEligibility(candidate, source, manifest).sample, null);
});

test('conversión: conserva puntos y procedencia sin promover revisión ni iniciar entrenamiento', () => {
  const { candidate, source, manifest } = syntheticCandidateSet();
  const pending = candidateEligibility(candidate, source, manifest);
  assert.equal(pending.sample.reviewStatus, 'PENDING_LSV_REVIEW');
  assert.deepEqual(pending.sample.frames, candidate.frames);
  assert.throws(() => prepareTrainingData([pending.sample]), /pendientes/);
  candidate.reviewStatus = 'APPROVED_LSV';
  candidate.reviewerId = 'software_test_reviewer';
  const approved = candidateEligibility(candidate, source, manifest);
  assert.deepEqual(approved.blocked, []);
  assert.equal(approved.sample.source.sha256, source.sha256);
  candidate.label = null;
  assert.equal(candidateEligibility(candidate, source, manifest).sample, null);
});

test('revisión posterior: no hereda frames falsos ni reutiliza aprobación en otro recorte/hash', () => {
  const { candidate, source, manifest } = syntheticCandidateSet();
  const quarantine = {
    type: 'QUARANTINE_NOT_TRAINING_DATA',
    sources: [source],
    candidates: [candidate],
  };
  manifest.candidates = [
    { ...candidate, frames: [], reviewerId: 'software_reviewer', reviewStatus: 'APPROVED_LSV' },
  ];
  const revised = applyCandidateReview(quarantine, manifest);
  assert.equal(revised[0].frames, candidate.frames);
  assert.equal(revised[0].reviewStatus, 'APPROVED_LSV');
  manifest.candidates[0].endMs = 2100;
  assert.throws(() => applyCandidateReview(quarantine, manifest), /recorte/);
  manifest.sources = [{ ...source, sha256: 'f'.repeat(64) }];
  assert.throws(() => applyCandidateReview(quarantine, manifest), /origen/);
});

test('manifiesto: rechaza personas duplicadas, etiquetas inventadas y videos desconocidos', () => {
  const { manifest } = syntheticCandidateSet();
  assert.equal(validatePreparationManifest(manifest), manifest);
  assert.throws(
    () =>
      validatePreparationManifest({
        ...manifest,
        participants: [...manifest.participants, manifest.participants[0]],
      }),
    /repetidos/,
  );
  for (const change of [
    { label: 'UNKNOWN_GESTURE' },
    { videoId: 'unknown_file' },
    { startMs: NaN },
  ])
    assert.throws(() =>
      validatePreparationManifest({
        ...manifest,
        candidates: [{ ...manifest.candidates[0], ...change }],
      }),
    );
});
