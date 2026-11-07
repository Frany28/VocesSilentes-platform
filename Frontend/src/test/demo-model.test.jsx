import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useLocalModel } from '../features/student/recognition/use-local-model.js';
import { RecognitionModelProvider } from '../features/student/recognition/RecognitionModelProvider.jsx';
import { trainExperimentalModel } from '../../../shared/lsv/experimental-train.js';
import { createDemoRelease } from '../../../shared/lsv/demo-release.js';
import { syntheticExperimental } from '../../../Backend/tests/fixtures/lsv-experimental-synthetic.js';

test('Netlify: solo la edición educativa permite carga e inferencia en producción HTTPS, sin enviar puntos', async () => {
  const samples = ['A', 'NONE'].map((label) => syntheticExperimental(label));
  const release = createDemoRelease(trainExperimentalModel(samples).model);
  const request = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(release), {
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', request);
  vi.stubGlobal('location', { protocol: 'https:', hostname: 'vocessilentes.netlify.app' });
  vi.stubEnv('DEV', false);
  // File.text es nativo en Chrome; este adaptador solo cubre el entorno DOM de pruebas.
  vi.stubGlobal(
    'File',
    class {
      constructor(parts) {
        this.content = parts.join('');
        this.size = this.content.length;
      }
      text() {
        return Promise.resolve(this.content);
      }
    },
  );
  try {
    const { result } = renderHook(useLocalModel, { wrapper: RecognitionModelProvider });
    expect(request).not.toHaveBeenCalled();
    await act(() => result.current.loadDemo());
    expect(result.current.model.usage).toBe('EDUCATIONAL_DEMONSTRATION');
    act(() => result.current.predict(samples[0].frames));
    expect(result.current.result.label).toBe('A');
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toBe('/models/lsv-vowels-demo-v1.json');
    expect(request.mock.calls[0][1]).not.toHaveProperty('body');
    expect(result.current.model.metrics).toBeNull();
  } finally {
    vi.unstubAllEnvs();
  }
});

test('fallo de descarga no fabrica modelo ni predicción', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));
  const { result } = renderHook(useLocalModel, { wrapper: RecognitionModelProvider });
  await act(() => result.current.loadDemo());
  expect(result.current.model).toBeNull();
  expect(result.current.result).toBeNull();
  // Un fallo de descarga del modelo se informa aparte; no es un error del intento.
  expect(result.current.loadError).toMatch(/descargar/);
  expect(result.current.error).toBe('');
});
