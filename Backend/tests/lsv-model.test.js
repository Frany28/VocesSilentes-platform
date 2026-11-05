import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRecording } from '../../shared/lsv/recording.js';
import { sequenceFeatures } from '../../shared/lsv/sequence.js';
import { validateModel, predictSequence } from '../../shared/lsv/classifier.js';
import { prepareTrainingData } from '../../shared/lsv/training-data.js';
import { trainLsvModel } from '../../shared/lsv/train.js';
import { syntheticRecording, syntheticDataset } from './fixtures/lsv-synthetic.js';

test('muestras: rechaza falta de consentimiento, revisión sin código, interrupciones y coordenadas inválidas', () => {
  const sample = syntheticRecording('A', 'train');
  assert.throws(() => validateRecording({ ...sample, consent: false }), /consentimiento/);
  assert.throws(() => validateRecording({ ...sample, participantId: undefined }), /inválida/);
  assert.throws(() => validateRecording({ ...sample, reviewerId: undefined }), /código/);
  const broken = structuredClone(sample);
  broken.frames[10].t += 700;
  assert.throws(() => validateRecording(broken), /incompleta/);
  const invalid = structuredClone(sample);
  invalid.frames[0].points[0][0] = NaN;
  assert.throws(() => validateRecording(invalid), /incompleta/);
});

test('normalización conserva trayectoria temporal sin reglas de letras ni alteración de los frames originales', () => {
  const sample = syntheticRecording('A', 'train');
  const before = structuredClone(sample.frames);
  const sequence = sequenceFeatures(sample.frames);
  assert.equal(sequence.length, 16);
  assert.ok(sequence.every((frame) => frame.length === 66 && frame.every(Number.isFinite)));
  assert.notDeepEqual(sequence[0].slice(-3), sequence.at(-1).slice(-3));
  assert.deepEqual(sample.frames, before);
});

test('entrenamiento: rechaza muestras pendientes, duplicados y personas mezcladas entre grupos', () => {
  const records = syntheticDataset();
  assert.throws(
    () =>
      prepareTrainingData(
        records.map((sample) => ({ ...sample, reviewStatus: 'PENDING_LSV_REVIEW' })),
      ),
    /pendientes/,
  );
  assert.throws(() => prepareTrainingData([...records, records[0]]), /repetidas/);
  const leaked = structuredClone(records);
  leaked[2].participantId = records[0].participantId.toUpperCase();
  assert.throws(() => prepareTrainingData(leaked), /persona/);
});

test('clasificador experimental aprende datos de prueba, mide un test separado y se abstiene sin cobertura', () => {
  const data = prepareTrainingData(syntheticDataset());
  const { model, report } = trainLsvModel(data, ['A', 'NONE']);
  assert.equal(model.status, 'EXPERIMENTAL');
  assert.equal(report.total, 2);
  assert.equal(report.correct, 2);
  assert.deepEqual(model.partitions.train.participants, ['test_train']);
  assert.deepEqual(model.partitions.test.participants, ['test_test']);
  assert.equal(validateModel(model), model);
  const sequence = sequenceFeatures(syntheticRecording('A', 'test', 0.001).frames);
  assert.equal(predictSequence(model, sequence, 'Left').reason, 'UNSUPPORTED_HAND');
  assert.equal(
    predictSequence(
      model,
      sequence.map((frame) => frame.map((value) => value + 20)),
      'Right',
    ).label,
    null,
  );
  assert.throws(() => trainLsvModel(data, ['A', 'E', 'NONE']), /Faltan/);
  assert.throws(() => validateModel({ ...model, status: 'APPROVED_LSV' }), /incompatible/);
});
