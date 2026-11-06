import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useVideoProcessing } from '../features/student/recognition/use-video-processing.js';
import { syntheticVideoRecording } from '../../../Backend/tests/fixtures/lsv-video-synthetic.js';

const extract = vi.hoisted(() => vi.fn());
vi.mock('../features/student/recognition/extract-video-sequence.js', () => ({
  extractVideoSequence: extract,
}));

function setup() {
  const hook = renderHook(useVideoProcessing);
  act(() => {
    hook.result.current.videoRef.current = { duration: 5 };
  });
  return hook;
}

test('procesar exige consentimiento/autorización antes de cargar el detector y deja borradores pendientes', async () => {
  const sample = syntheticVideoRecording();
  const hook = setup();
  expect(extract).not.toHaveBeenCalled();
  await act(() => hook.result.current.process({ ...sample, consent: false }, sample.source));
  expect(extract).not.toHaveBeenCalled();
  expect(hook.result.current.preview).toBeNull();
  await act(() => hook.result.current.process(sample, { ...sample.source, authorized: false }));
  expect(extract).not.toHaveBeenCalled();
  extract.mockResolvedValue({ frames: sample.frames, decodedFrames: 20 });
  await act(() => hook.result.current.process(sample, sample.source));
  expect(hook.result.current.preview.sample.reviewStatus).toBe('PENDING_LSV_REVIEW');
  expect(hook.result.current.preview.sample.source).toEqual(sample.source);
  expect(hook.result.current.preview.sample.reviewerId).toBeNull();
});

test('cancelar u ocultar aborta la extracción y descarta resultados tardíos, sin guardar muestras', async () => {
  const sample = syntheticVideoRecording();
  const hook = setup();
  for (const hide of [false, true]) {
    let resolve;
    let pending;
    extract.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    act(() => {
      pending = hook.result.current.process(sample, sample.source);
    });
    act(() => {
      if (!hide) hook.result.current.cancel();
      else {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
        delete document.hidden;
      }
    });
    expect(extract.mock.calls.at(-1)[0].signal.aborted).toBe(true);
    await act(async () => {
      resolve({ frames: sample.frames, decodedFrames: 20 });
      await pending;
    });
    expect(hook.result.current.preview).toBeNull();
    expect(hook.result.current.pending).toBe(false);
  }
});
