import { afterEach, expect, test, vi } from 'vitest';
import { createDecodedSequence } from '../features/student/recognition/decoded-sequence.js';
import { syntheticRecording } from '../../../Backend/tests/fixtures/lsv-synthetic.js';

const mocks = vi.hoisted(() => ({ factory: vi.fn() }));
vi.mock('../features/student/recognition/hand-engine.js', () => ({
  createHandEngine: mocks.factory,
}));
afterEach(() => vi.unstubAllGlobals());

function setup() {
  const points = syntheticRecording('A', 'train').frames[0].points;
  const result = {
    landmarks: [points.map(([x, y, z]) => ({ x, y, z }))],
    handedness: [[{ categoryName: 'Right' }]],
  };
  const engine = { detect: vi.fn(() => result), close: vi.fn() };
  const close = vi.fn();
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async () => ({ width: 640, height: 480, close })),
  );
  mocks.factory.mockResolvedValue(engine);
  return { result, engine, close };
}

test('PNG/PTS: procesa cada observación original y no fabrica frames al reducir una secuencia', async () => {
  const { engine, close } = setup();
  const sequence = await createDecodedSequence(10, 13);
  const times = Array.from({ length: 90 }, (_, index) => 10 + index / 30);
  try {
    for (const time of times) await sequence.append('AA==', time);
    const output = sequence.finish();
    expect(output.error).toBeUndefined();
    expect(output.decodedFrames).toBe(90);
    expect(output.frames).toHaveLength(60);
    expect(
      output.frames.every((frame) => times.some((time) => (time - 10) * 1000 === frame.t)),
    ).toBe(true);
    expect(output.diagnostics.map((item) => item.sourceTimeMs)).toEqual(
      times.map((time) => time * 1000),
    );
    expect(engine.detect).toHaveBeenCalledTimes(90);
    expect(close).toHaveBeenCalledTimes(90);
  } finally {
    sequence.close();
  }
  expect(engine.close).toHaveBeenCalledTimes(1);
});

test('cuarentena: rechaza manos ausentes/múltiples, lateralidad y puntos inválidos incluso antes del remuestreo', async () => {
  for (const fault of ['absent', 'multiple', 'hand', 'coordinates']) {
    const { result, engine, close } = setup();
    const broken = structuredClone(result);
    if (fault === 'absent') broken.landmarks = [];
    if (fault === 'multiple') broken.landmarks.push(result.landmarks[0]);
    if (fault === 'hand') broken.handedness[0][0].categoryName = 'Left';
    if (fault === 'coordinates') broken.landmarks[0][0].x = NaN;
    // El frame 1 no pertenece a los 60 seleccionados desde 180: el fallo no debe desaparecer.
    engine.detect.mockReturnValueOnce(result).mockReturnValueOnce(broken);
    const sequence = await createDecodedSequence(0, 6);
    try {
      for (let index = 0; index < 180; index += 1) await sequence.append('AA==', index / 30);
      const output = sequence.finish();
      expect(output.error).toBeTruthy();
      expect(output.frames).toEqual([]);
      expect(output.decodedFrames).toBe(180);
      expect(close).toHaveBeenCalledTimes(180);
    } finally {
      sequence.close();
    }
    expect(engine.close).toHaveBeenCalledTimes(1);
  }
});

test('continuidad: no estira demostraciones cortas ni interpola huecos', async () => {
  for (const times of [Array.from({ length: 30 }, (_, i) => i / 30), [0, 0.5, 1, 1.5]]) {
    setup();
    const sequence = await createDecodedSequence(0, 2);
    try {
      for (const time of times) await sequence.append('AA==', time);
      expect(sequence.finish().error).toBeTruthy();
    } finally {
      sequence.close();
    }
  }
});
