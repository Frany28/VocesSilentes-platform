import { expect, test, vi } from 'vitest';
import {
  readVideoInterval,
  seekLocalVideo,
} from '../features/student/recognition/video-playback.js';

function player() {
  const video = new EventTarget();
  const callbacks = new Map();
  let id = 0;
  Object.assign(video, {
    currentTime: 0,
    readyState: 2,
    playbackRate: 1,
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(),
    requestVideoFrameCallback: vi.fn((callback) => {
      callbacks.set(++id, callback);
      return id;
    }),
    cancelVideoFrameCallback: vi.fn((key) => callbacks.delete(key)),
  });
  return {
    video,
    emit: (mediaTime, presentedFrames) => {
      const [key, callback] = [...callbacks][0];
      callbacks.delete(key);
      callback(0, { mediaTime, presentedFrames });
    },
    callbacks,
  };
}

test('reproducción usa tiempos reales, omite callbacks repetidos y libera frames/restaura velocidad', async () => {
  const fixture = player();
  const observe = vi.fn();
  const promise = readVideoInterval(
    fixture.video,
    { start: 0, end: 2 },
    new AbortController().signal,
    observe,
  );
  await Promise.resolve();
  fixture.emit(0, 1);
  fixture.emit(0, 1);
  fixture.emit(1, 2);
  fixture.emit(2.1, 3);
  await promise;
  expect(observe.mock.calls.map((call) => call[1])).toEqual([0, 1]);
  expect(fixture.callbacks.size).toBe(0);
  expect(fixture.video.playbackRate).toBe(1);
  expect(fixture.video.pause).toHaveBeenCalled();
});

test('reproducción rechaza frames perdidos y abortar cancela incluso una espera sin nuevos frames', async () => {
  const fixture = player();
  const controller = new AbortController();
  const promise = readVideoInterval(
    fixture.video,
    { start: 0, end: 2 },
    controller.signal,
    vi.fn(),
  );
  const rejected = expect(promise).rejects.toThrow(/perdieron/);
  await Promise.resolve();
  fixture.emit(0, 1);
  fixture.emit(0.1, 3);
  await rejected;
  const another = readVideoInterval(
    fixture.video,
    { start: 0, end: 2 },
    controller.signal,
    vi.fn(),
  );
  const aborted = expect(another).rejects.toHaveProperty('name', 'AbortError');
  await Promise.resolve();
  controller.abort();
  await aborted;
  expect(fixture.callbacks.size).toBe(0);
});

test('seek cancelable y falta de soporte no producen una muestra ni dejan callbacks activos', async () => {
  const fixture = player();
  const controller = new AbortController();
  const promise = seekLocalVideo(fixture.video, 1, controller.signal);
  const rejected = expect(promise).rejects.toHaveProperty('name', 'AbortError');
  controller.abort();
  await rejected;
  fixture.video.requestVideoFrameCallback = undefined;
  await expect(
    readVideoInterval(fixture.video, { start: 0, end: 2 }, new AbortController().signal, vi.fn()),
  ).rejects.toThrow(/navegador/);
});
