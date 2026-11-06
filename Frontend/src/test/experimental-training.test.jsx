import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useTrainingSamples } from '../features/student/recognition/use-training-samples.js';
import { useLocalModel } from '../features/student/recognition/use-local-model.js';
import { RecognitionModelProvider } from '../features/student/recognition/RecognitionModelProvider.jsx';
import { trainExperimentalModel } from '../../../shared/lsv/experimental-train.js';
import { syntheticExperimental } from '../../../Backend/tests/fixtures/lsv-experimental-synthetic.js';

test('colección compartida: importa, confirma, rechaza duplicados y reentrena sin aprobar revisión LSV', () => {
  const { result } = renderHook(() => useTrainingSamples(true));
  const samples = ['A', 'NONE'].map((label) => ({
    ...syntheticExperimental(label),
    labelConfirmation: null,
  }));
  act(() => result.current.importData({ version: 1, samples }));
  expect(() => trainExperimentalModel(result.current.samples)).toThrow(/Confirma/);
  for (const sample of samples) act(() => result.current.review(sample.id, 'test_owner'));
  expect(trainExperimentalModel(result.current.samples).model.trainingMode).toBe(
    'LOCAL_PROVISIONAL',
  );
  expect(
    result.current.samples.every((sample) => sample.reviewStatus === 'PENDING_LSV_REVIEW'),
  ).toBe(true);
  act(() => result.current.importData({ version: 1, samples }));
  expect(result.current.samples).toHaveLength(2);
  expect(result.current.error).toMatch(/repetidas/);
});

test('carga e inferencia local calculan con puntos; la importación se rechaza fuera de desarrollo loopback', async () => {
  const samples = ['A', 'NONE'].map((label) => syntheticExperimental(label));
  const { model } = trainExperimentalModel(samples);
  const file = { size: 10000, text: async () => JSON.stringify(model) };
  vi.stubGlobal('location', { hostname: 'localhost' });
  const { result } = renderHook(useLocalModel, { wrapper: RecognitionModelProvider });
  await act(() => result.current.load({ target: { files: [file], value: '' } }));
  act(() => result.current.predict(samples[0].frames));
  expect(result.current.result.label).toBe('A');
  act(() => result.current.predict([]));
  expect(result.current.result).toBeNull();
  expect(result.current.error).toMatch(/Repite/);
  vi.stubGlobal('location', { hostname: 'example.org' });
  const remote = renderHook(useLocalModel, { wrapper: RecognitionModelProvider });
  await act(() => remote.result.current.load({ target: { files: [file], value: '' } }));
  expect(remote.result.current.model).toBeNull();
  expect(remote.result.current.error).toMatch(/importar/);
  vi.stubGlobal('location', { hostname: 'localhost' });
  vi.stubEnv('DEV', false);
  const production = renderHook(useLocalModel, { wrapper: RecognitionModelProvider });
  await act(() => production.result.current.load({ target: { files: [file], value: '' } }));
  expect(production.result.current.model).toBeNull();
  vi.unstubAllEnvs();
});
