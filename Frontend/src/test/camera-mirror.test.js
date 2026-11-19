import { expect, test, vi } from 'vitest';
import { startCameraSession } from '../features/student/recognition/camera-session.js';
import { cameraFixture } from './camera-fixture.js';

test('el espejo CSS no sustituye el vídeo ni invierte los puntos o etiquetas entregados al detector', async () => {
  const fixture = cameraFixture();
  fixture.video.style.transform = 'scaleX(-1)';
  const result = {
    landmarks: [[{ x: 0.2, y: 0.3, z: -0.1 }]],
    handedness: [[{ categoryName: 'Left' }]],
  };
  fixture.engine.detect.mockReturnValue(result);
  const onFrame = vi.fn();
  const controller = new AbortController();
  await startCameraSession({
    ...fixture,
    signal: controller.signal,
    onFrame,
    onState: vi.fn(),
    onError: vi.fn(),
  });
  fixture.tick(100);
  expect(fixture.engine.detect).toHaveBeenCalledWith(fixture.video, 100);
  expect(onFrame.mock.calls[0][0]).toBe(result);
  expect(onFrame.mock.calls[0][0].landmarks[0][0].x).toBe(0.2);
  expect(onFrame.mock.calls[0][0].handedness[0][0].categoryName).toBe('Left');
  controller.abort();
});
