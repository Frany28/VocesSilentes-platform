import assert from 'node:assert/strict';
import { test } from 'node:test';
import { trainExperimentalModel } from '../../shared/lsv/experimental-train.js';
import { prepareTrainingData } from '../../shared/lsv/training-data.js';
import { validateRecording } from '../../shared/lsv/recording.js';
import { validateModel, predictSequence } from '../../shared/lsv/classifier.js';
import { sequenceFeatures } from '../../shared/lsv/sequence.js';
import { experimentalCandidates } from '../../shared/lsv/experimental-candidates.js';
import { syntheticExperimental } from './fixtures/lsv-experimental-synthetic.js';

const samples = () => ['A', 'NONE'].map((label) => syntheticExperimental(label));

test('fixtures sintéticos: serialización e inferencia sin métricas o aprobación LSV', () => {
  const input = samples();
  const before = JSON.stringify(input);
  const { model, report } = trainExperimentalModel(input);
  const imported = validateModel(JSON.parse(JSON.stringify(model)));
  assert.equal(imported.trainingMode, 'LOCAL_PROVISIONAL');
  assert.equal(imported.usage, 'LOCAL_DEVELOPMENT_ONLY');
  assert.equal(imported.linguisticValidation, 'PENDING_LSV_REVIEW');
  assert.equal(imported.partitions, null);
  assert.equal(report.accuracy, null);
  assert.equal(report.independentEvaluation, false);
  assert.equal(predictSequence(imported, sequenceFeatures(input[0].frames), 'Right').label, 'A');
  assert.equal(
    predictSequence(imported, sequenceFeatures(input[1].frames), 'Right').reason,
    'BACKGROUND',
  );
  assert.equal(
    predictSequence(imported, sequenceFeatures(input[0].frames), 'Left').reason,
    'UNSUPPORTED_HAND',
  );
  const distant = imported.prototypes[0].sequence.map((frame) => frame.map((value) => value + 10));
  assert.equal(predictSequence(imported, distant, 'Right').reason, 'OUT_OF_DISTRIBUTION');
  assert.equal(JSON.stringify(input), before);
});

test('margen provisional se abstiene ante clases cercanas y rechaza metadatos de evaluación falsos', () => {
  const { model } = trainExperimentalModel(samples());
  const original = model.prototypes[0].sequence;
  const shifted = (offset) => original.map((frame) => frame.map((value) => value + offset));
  model.prototypes[1].sequence = shifted(0.01);
  model.radii = { A: 0.35, NONE: 0.35 };
  assert.equal(predictSequence(model, shifted(0.0049), 'Right').reason, 'AMBIGUOUS');
  assert.throws(() => validateModel({ ...model, usage: 'ACADEMIC' }), /Metadatos/);
  assert.throws(() => validateModel({ ...model, partitions: { test: 9 } }), /Metadatos/);
});

test('confirmación por etiqueta, consentimiento de cámara, continuidad y duplicados siguen siendo obligatorios', () => {
  const [sample, none] = samples();
  for (const changed of [
    { ...sample, labelConfirmation: null },
    { ...sample, label: 'E' },
    { ...sample, consent: false },
    { ...sample, frames: sample.frames.slice(0, 4) },
  ])
    assert.throws(() => trainExperimentalModel([changed, none]));
  assert.throws(() => trainExperimentalModel([sample, sample, none]), /repetidas/);
  assert.throws(() => trainExperimentalModel([sample]), /NONE/);
  assert.throws(() => validateRecording(sample), /inválida/);
  assert.throws(() => prepareTrainingData(samples()), /inválida/);
});

test('importar cuarentena excluye todos los desconocidos/video_04 y conserva permisos e identidad pendientes', () => {
  const frame = syntheticExperimental().frames;
  const source = { id: 'video_01', sha256: 'a'.repeat(64), origin: 'Software fixture, not LSV' };
  const candidate = {
    id: 'sample_a',
    videoId: 'video_01',
    label: 'A',
    technicalStatus: 'VALID_GEOMETRY',
    frames: frame,
    observedSignant: 'track_01',
    executionId: 'execution_a',
    startMs: 0,
    endMs: 2000,
  };
  const drafts = experimentalCandidates({
    type: 'QUARANTINE_NOT_TRAINING_DATA',
    sources: [source],
    permission: { status: 'PENDING', reference: 'software' },
    candidates: [
      candidate,
      { ...candidate, videoId: 'video_04' },
      { ...candidate, label: null },
      { ...candidate, technicalStatus: 'REJECTED' },
    ],
  });
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].consent, null);
  assert.equal(drafts[0].participantId, null);
  assert.equal(drafts[0].source.authorizationStatus, 'PENDING');
  assert.equal(drafts[0].labelConfirmation, null);
  assert.throws(() => trainExperimentalModel(drafts), /Confirma/);
});
