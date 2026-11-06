import { test } from 'node:test';
import assert from 'node:assert/strict';
import { candidateDiagnosis } from '../scripts/lsv/candidate-diagnosis.js';
import { candidateEligibility } from '../scripts/lsv/candidate-policy.js';
import { applyCandidateReview } from '../scripts/lsv/apply-candidate-review.js';
import { validatePreparationManifest } from '../scripts/lsv/preparation-manifest.js';
import { syntheticCandidateSet } from './fixtures/lsv-candidate-synthetic.js';
import { syntheticDataset } from './fixtures/lsv-synthetic.js';

test('diagnóstico distingue geometría de muestras aprobadas y enumera las 18 celdas faltantes', () => {
  const { candidate, manifest } = syntheticCandidateSet();
  manifest.participants = [];
  const diagnosis = candidateDiagnosis([candidate], [], manifest);
  assert.equal(diagnosis.classes[0].validGeometry, 1);
  assert.equal(diagnosis.classes[0].approved, 0);
  assert.equal(diagnosis.missingApprovedSampleCells.length, 18);
  assert.equal(diagnosis.confirmedParticipants, 0);
  assert.equal(diagnosis.reducedPilot.structurallyReady, false);
  assert.equal(diagnosis.trainingExecuted, false);
  assert.equal(diagnosis.evaluation.accuracy, null);
});

test('piloto reducido requiere NONE y ambas clases en los tres grupos; no calcula métricas', () => {
  const { manifest } = syntheticCandidateSet();
  const samples = syntheticDataset();
  const ready = candidateDiagnosis([], samples, manifest);
  assert.deepEqual(ready.reducedPilot.labels, ['A', 'NONE']);
  assert.equal(ready.status, 'BLOCKED');
  assert.equal(ready.evaluation.confusionMatrix, null);
  assert.equal(
    candidateDiagnosis(
      [],
      samples.filter((item) => item.partition !== 'test'),
      manifest,
    ).reducedPilot.structurallyReady,
    false,
  );
  assert.equal(
    candidateDiagnosis(
      [],
      samples.filter((item) => item.label === 'A'),
      manifest,
    ).reducedPilot.structurallyReady,
    false,
  );
});

test('manifiesto rechaza la misma ejecución en recortes distintos y solapamientos incluso con IDs de fuente diferentes', () => {
  const { candidate, source, manifest } = syntheticCandidateSet();
  const alias = { ...source, id: 'same_file_alias' };
  manifest.sources.push(alias);
  manifest.observedSignants.push({
    ...manifest.observedSignants[0],
    id: 'alias_track',
    videoId: alias.id,
  });
  const second = {
    ...candidate,
    id: 'another_candidate',
    videoId: alias.id,
    observedSignant: 'alias_track',
    startMs: 2500,
    endMs: 4500,
  };
  manifest.candidates.push(second);
  assert.throws(() => validatePreparationManifest(manifest), /misma ejecución/);
  second.executionId = 'different_execution';
  second.startMs = 1000;
  second.endMs = 3000;
  assert.throws(() => validatePreparationManifest(manifest), /solapados/);
});

test('revisión de independencia requiere una declaración humana explícita vinculada al recorte original', () => {
  const { candidate, source, manifest } = syntheticCandidateSet();
  candidate.executionIndependenceConfirmed = false;
  candidate.reviewStatus = 'APPROVED_LSV';
  candidate.reviewerId = 'software_reviewer';
  const rejected = candidateEligibility(candidate, source, manifest);
  assert.equal(rejected.sample, null);
  assert.deepEqual(rejected.blocked, ['EXECUTION_INDEPENDENCE_REVIEW_PENDING']);
  manifest.candidates = [{ ...candidate, executionIndependenceConfirmed: true }];
  const revised = applyCandidateReview(
    { type: 'QUARANTINE_NOT_TRAINING_DATA', sources: [source], candidates: [candidate] },
    manifest,
  );
  assert.deepEqual(candidateEligibility(revised[0], source, manifest).blocked, []);
});
