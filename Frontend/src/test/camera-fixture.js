import { vi } from 'vitest';

/**
 * Sustituye únicamente hardware/tiempo del navegador para probar ciclo de vida; no simula reconocimiento LSV.
 * @returns {object} Stream, motor numérico de prueba, canvas y control manual de frames.
 */
export function cameraFixture() {
  const track = new EventTarget();
  track.readyState = 'live';
  track.stop = vi.fn(() => {
    track.readyState = 'ended';
  });
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] };
  const getUserMedia = vi.fn().mockResolvedValue(stream);
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } });
  Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  const context = { clearRect: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  let videoTime = 0;
  Object.defineProperties(video, {
    readyState: { value: 2 },
    videoWidth: { value: 640 },
    videoHeight: { value: 480 },
    currentTime: { get: () => videoTime },
  });
  const frames = new Map();
  let id = 0;
  vi.stubGlobal('requestAnimationFrame', (callback) => {
    frames.set(++id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (token) => frames.delete(token));
  const engine = {
    detect: vi.fn(() => ({ landmarks: [], handedness: [] })),
    draw: vi.fn(),
    close: vi.fn(),
  };
  return {
    track,
    stream,
    getUserMedia,
    context,
    video,
    canvas,
    engine,
    createEngine: vi.fn().mockResolvedValue(engine),
    pendingFrames: frames,
    tick(now) {
      videoTime = now / 1000;
      const scheduled = [...frames.values()];
      frames.clear();
      scheduled.forEach((callback) => callback(now));
    },
  };
}
