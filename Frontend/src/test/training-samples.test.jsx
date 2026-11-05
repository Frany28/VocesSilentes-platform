import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useTrainingSamples } from '../features/student/recognition/use-training-samples.js';
import { syntheticRecording } from '../../../Backend/tests/fixtures/lsv-synthetic.js';

test('recopilación: exige consentimiento y deja la etiqueta pendiente hasta una revisión humana declarada', () => {
  const { result } = renderHook(useTrainingSamples);
  const sample = syntheticRecording('A', 'train');
  act(() => result.current.add({ ...sample, consent: false }, sample.frames, sample.sessionId));
  expect(result.current.samples).toHaveLength(0);
  expect(result.current.error).toMatch(/consentimiento/);
  act(() => result.current.add(sample, sample.frames, sample.sessionId));
  expect(result.current.samples).toHaveLength(1);
  expect(result.current.samples[0].reviewStatus).toBe('PENDING_LSV_REVIEW');
  const id = result.current.samples[0].id;
  act(() => result.current.review(id, ''));
  expect(result.current.samples[0].reviewStatus).toBe('PENDING_LSV_REVIEW');
  act(() => result.current.review(id, 'test_reviewer'));
  expect(result.current.samples[0].reviewStatus).toBe('APPROVED_LSV');
  expect(result.current.dirty).toBe(true);
  act(() => result.current.remove(id));
  expect(result.current.samples).toHaveLength(0);
});

test('exportación local contiene puntos consentidos y no envía vídeo, imágenes ni peticiones HTTP', async () => {
  let blob;
  vi.stubGlobal('fetch', vi.fn());
  URL.createObjectURL = vi.fn((value) => {
    blob = value;
    return 'blob:software-test';
  });
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  const { result } = renderHook(useTrainingSamples);
  const sample = syntheticRecording('A', 'train');
  act(() => result.current.add(sample, sample.frames, sample.sessionId));
  act(() => result.current.download());
  const text = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsText(blob);
  });
  const data = JSON.parse(text);
  expect(data.samples).toHaveLength(1);
  expect(data.samples[0].frames).toHaveLength(20);
  expect(text).not.toMatch(/video|image|password|token/);
  expect(fetch).not.toHaveBeenCalled();
  expect(result.current.dirty).toBe(false);
});
