import { expect, test, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { startCameraSession } from '../features/student/recognition/camera-session.js';
import { cameraFixture } from './camera-fixture.js';

test('cámara: activa audio=false por llamada explícita, procesa frames reales del motor y libera tarea/pistas al abortar', async () => {
  const fixture = cameraFixture();
  const controller = new AbortController();
  const onFrame = vi.fn();
  await startCameraSession({
    ...fixture,
    signal: controller.signal,
    onState: vi.fn(),
    onError: vi.fn(),
    onFrame,
  });
  expect(fixture.getUserMedia).toHaveBeenCalledWith(expect.objectContaining({ audio: false }));
  fixture.tick(100);
  expect(onFrame).toHaveBeenCalledWith(
    { landmarks: [], handedness: [] },
    { time: 100, width: 640, height: 480 },
  );
  controller.abort();
  fixture.tick(200);
  expect(fixture.engine.detect).toHaveBeenCalledTimes(1);
  expect(fixture.engine.close).toHaveBeenCalledTimes(1);
  expect(fixture.track.stop).toHaveBeenCalledTimes(1);
  expect(fixture.video.srcObject).toBeNull();
});

test('cancelar mientras llega el permiso detiene el stream tardío y conserva el vídeo de una sesión nueva', async () => {
  const fixture = cameraFixture();
  let finish;
  fixture.getUserMedia.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const controller = new AbortController();
  const start = startCameraSession({
    ...fixture,
    signal: controller.signal,
    onState: vi.fn(),
    onError: vi.fn(),
    onFrame: vi.fn(),
  });
  const rejected = expect(start).rejects.toHaveProperty('name', 'AbortError');
  controller.abort();
  const newStream = {};
  fixture.video.srcObject = newStream;
  finish(fixture.stream);
  await rejected;
  expect(fixture.track.stop).toHaveBeenCalledTimes(1);
  expect(fixture.video.srcObject).toBe(newStream);
  expect(fixture.createEngine).not.toHaveBeenCalled();
});

test('cancelar durante carga del modelo cierra una tarea tardía sin reiniciar la inferencia', async () => {
  const fixture = cameraFixture();
  let finish;
  fixture.createEngine.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const controller = new AbortController();
  const start = startCameraSession({
    ...fixture,
    signal: controller.signal,
    onState: vi.fn(),
    onError: vi.fn(),
    onFrame: vi.fn(),
  });
  const rejected = expect(start).rejects.toHaveProperty('name', 'AbortError');
  await waitFor(() => expect(finish).toBeDefined());
  controller.abort();
  finish(fixture.engine);
  await rejected;
  expect(fixture.engine.close).toHaveBeenCalledTimes(1);
  expect(fixture.track.stop).toHaveBeenCalledTimes(1);
  expect(fixture.pendingFrames.size).toBe(0);
});

test('un fallo de inferencia detiene cámara y modelo y comunica el error una vez', async () => {
  const fixture = cameraFixture();
  fixture.engine.detect.mockImplementation(() => {
    throw new Error('fixture interno');
  });
  const onError = vi.fn();
  await startCameraSession({
    ...fixture,
    signal: new AbortController().signal,
    onState: vi.fn(),
    onError,
    onFrame: vi.fn(),
  });
  fixture.tick(100);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(fixture.track.stop).toHaveBeenCalledTimes(1);
  expect(fixture.engine.close).toHaveBeenCalledTimes(1);
  expect(fixture.pendingFrames.size).toBe(0);
});
