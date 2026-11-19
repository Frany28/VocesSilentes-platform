import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareTrainingData } from '../../shared/lsv/training-data.js';
import { trainLsvModel } from '../../shared/lsv/train.js';
import { validateRecording } from '../../shared/lsv/recording.js';
import { syntheticDataset, syntheticRecording } from './fixtures/lsv-synthetic.js';

test('un código de revisor no sustituye las referencias de consentimiento, permiso y revisión LSV', () => {
  const samples = syntheticDataset();
  const undocumented = structuredClone(samples);
  delete undocumented[0].reviewEvidence;
  assert.equal(validateRecording(undocumented[0]).reviewStatus, 'APPROVED_LSV');
  assert.throws(() => prepareTrainingData(undocumented), /Documenta consentimiento/);
  for (const field of [
    'consentReference',
    'permissionReference',
    'reviewReference',
    'variantReference',
  ]) {
    const invalid = structuredClone(samples);
    delete invalid[0].reviewEvidence[field];
    assert.throws(() => prepareTrainingData(invalid), /Documenta consentimiento/);
  }
  const foreign = structuredClone(samples);
  foreign[0].reviewEvidence.language = 'ASL';
  assert.throws(() => prepareTrainingData(foreign), /variante LSV/);
});

test('el entrenador revalida registros preparados y no permite saltar consentimiento ni procedencia', () => {
  const prepared = prepareTrainingData(syntheticDataset());
  prepared.records[0].consent = false;
  assert.throws(() => trainLsvModel(prepared, ['A', 'NONE']), /consentimiento/);
  const unknown = syntheticDataset();
  delete unknown[0].captureOrigin;
  assert.throws(() => prepareTrainingData(unknown), /cámara o video/);
});

test('NONE del piloto no se reutiliza como negativo al incorporar B u otra letra fuera de su alcance', () => {
  const samples = syntheticDataset();
  for (const sample of samples.filter((record) => record.label === 'NONE'))
    sample.reviewEvidence.negativeFor = ['A', 'E', 'I', 'O', 'U'];
  assert.equal(prepareTrainingData(samples).records.length, 6);
  const b = syntheticRecording('B', 'train', 0.003);
  assert.throws(() => prepareTrainingData([...samples, b]), /otro alcance/);
  const selected = prepareTrainingData([...samples, b], ['A', 'NONE']);
  assert.equal(trainLsvModel(selected, ['A', 'NONE']).model.academicGrading, false);
});

test('sin revisión de la ejecución temporal J, Ñ y Z siguen bloqueadas aunque haya una ficha', () => {
  for (const label of ['J', 'Ñ', 'Z']) {
    const sample = syntheticRecording(label, 'train');
    sample.reviewEvidence.motionReviewed = false;
    assert.throws(() => validateRecording(sample), /movimiento completo/);
  }
});
