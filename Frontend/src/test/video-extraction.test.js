import { expect, test, vi } from 'vitest';
import { extractVideoSequence } from '../features/student/recognition/extract-video-sequence.js';
import { syntheticRecording } from '../../../Backend/tests/fixtures/lsv-synthetic.js';

const mocks = vi.hoisted(() => ({ factory: vi.fn(), read: vi.fn() }));
vi.mock('../features/student/recognition/hand-engine.js', () => ({
  createHandEngine: mocks.factory,
}));
vi.mock('../features/student/recognition/video-playback.js', () => ({
  readVideoInterval: mocks.read,
}));

function setup() {
  const points = syntheticRecording('A', 'train').frames[0].points;
  const result = {
    landmarks: [points.map(([x, y, z]) => ({ x, y, z }))],
    handedness: [[{ categoryName: 'Right' }]],
  };
  const engine = { detect: vi.fn(() => result), draw: vi.fn(), close: vi.fn() };
  mocks.factory.mockResolvedValue(engine);
  const clearRect = vi.fn();
  const video = { duration: 6, videoWidth: 640, videoHeight: 480 };
  const options = {
    video,
    canvas: { getContext: () => ({ clearRect }) },
    start: 0,
    end: 6,
    signal: new AbortController().signal,
    onProgress: vi.fn(),
  };
  return { options, engine, result, clearRect };
}

test('extracción procesa todos los frames recibidos y selecciona hasta 60 observaciones reales, una sola muestra', async () => {
  const { options, engine, clearRect } = setup();
  const times = Array.from({ length: 180 }, (_, index) => index / 30);
  mocks.read.mockImplementation(async (video, _range, _signal, observe) => {
    times.forEach((time) => observe(video, time));
  });
  const output = await extractVideoSequence(options);
  expect(output.decodedFrames).toBe(180);
  expect(output.frames).toHaveLength(60);
  expect(output.frames.every((frame) => times.some((time) => frame.t === time * 1000))).toBe(true);
  expect(engine.detect).toHaveBeenCalledTimes(180);
  expect(engine.detect.mock.calls.at(-1)[1]).toBe(times.at(-1) * 1000);
  expect(output.frames[0].points).toEqual(syntheticRecording('A', 'train').frames[0].points);
  expect(engine.close).toHaveBeenCalledTimes(1);
  expect(clearRect).toHaveBeenCalledTimes(1);
});

test('ausencia o varias manos rechazan la ejecución completa y siempre cierran el detector', async () => {
  for (const landmarks of [[], [[], []]]) {
    const { options, engine } = setup();
    engine.detect.mockReturnValue({ landmarks });
    mocks.read.mockImplementation(async (video, _range, _signal, observe) => observe(video, 0));
    await expect(extractVideoSequence(options)).rejects.toThrow(/exactamente una mano/);
    expect(engine.close).toHaveBeenCalledTimes(1);
  }
});

test('interrupciones o cambios de mano no se interpolan; un modelo tardío se libera al cancelar', async () => {
  const { options, engine, result } = setup();
  mocks.read.mockImplementation(async (video, _range, _signal, observe) => {
    observe(video, 0);
    observe(video, 0.5);
  });
  await expect(extractVideoSequence(options)).rejects.toThrow(/interrupción/);
  engine.detect
    .mockReturnValueOnce(result)
    .mockReturnValueOnce({ ...result, handedness: [[{ categoryName: 'Left' }]] });
  mocks.read.mockImplementation(async (video, _range, _signal, observe) => {
    observe(video, 0);
    observe(video, 0.1);
  });
  await expect(extractVideoSequence(options)).rejects.toThrow(/mano cambia/);
  const controller = new AbortController();
  let resolve;
  mocks.factory.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const promise = extractVideoSequence({ ...options, signal: controller.signal });
  const rejected = expect(promise).rejects.toHaveProperty('name', 'AbortError');
  controller.abort();
  resolve(engine);
  await rejected;
  expect(engine.close).toHaveBeenCalledTimes(3);
});
