import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useModelTraining } from '../features/student/recognition/use-model-training.js';
import { RecognitionModelProvider } from '../features/student/recognition/RecognitionModelProvider.jsx';
import { syntheticDataset } from '../../../Backend/tests/fixtures/lsv-synthetic.js';
import { prepareTrainingData } from '../../../shared/lsv/training-data.js';
import { trainLsvModel } from '../../../shared/lsv/train.js';

function workerFixture() {
  const instances = [];
  vi.stubGlobal(
    'Worker',
    class {
      constructor() {
        instances.push(this);
      }
      postMessage = vi.fn();
      terminate = vi.fn();
    },
  );
  return instances;
}

test('el entrenamiento se inicia por acción y muestra solamente los resultados del worker local', () => {
  const workers = workerFixture();
  const hook = renderHook(useModelTraining, { wrapper: RecognitionModelProvider });
  expect(workers).toHaveLength(0);
  const samples = syntheticDataset();
  act(() => hook.result.current.train(samples));
  expect(workers).toHaveLength(1);
  expect(hook.result.current.pending).toBe(true);
  expect(workers[0].postMessage).toHaveBeenCalledWith({ samples });
  const fixtureResult = trainLsvModel(prepareTrainingData(samples), ['A', 'NONE']);
  act(() => workers[0].onmessage({ data: fixtureResult }));
  expect(hook.result.current.result.model.status).toBe('EXPERIMENTAL');
  expect(hook.result.current.result.report.total).toBe(2);
  expect(hook.result.current.pending).toBe(false);
  expect(workers[0].terminate).toHaveBeenCalledTimes(1);
});

test('cancelar o salir termina el worker y descarta respuestas tardías sin fabricar un modelo', () => {
  const workers = workerFixture();
  const hook = renderHook(useModelTraining, { wrapper: RecognitionModelProvider });
  act(() => hook.result.current.train(syntheticDataset()));
  act(() => hook.result.current.cancel());
  act(() => workers[0].onmessage({ data: { error: 'Respuesta tardía de prueba' } }));
  expect(hook.result.current.result).toBeNull();
  expect(hook.result.current.error).toBe('');
  act(() => hook.result.current.train(syntheticDataset()));
  hook.unmount();
  expect(workers[1].terminate).toHaveBeenCalledTimes(1);
});

test('los datos no revisados producen un error del entrenador y no se presentan como éxito', () => {
  const workers = workerFixture();
  const hook = renderHook(useModelTraining, { wrapper: RecognitionModelProvider });
  act(() => hook.result.current.train(syntheticDataset()));
  act(() => workers[0].onmessage({ data: { error: 'Hay muestras pendientes de revisión LSV' } }));
  expect(hook.result.current.error).toContain('pendientes');
  expect(hook.result.current.result).toBeNull();
});
