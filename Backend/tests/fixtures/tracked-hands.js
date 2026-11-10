import { syntheticExperimental } from './lsv-experimental-synthetic.js';
import { mirrorFrames } from '../../../shared/lsv/handedness.js';
import { createHandTracker } from '../../../shared/lsv/hand-tracker.js';

/**
 * Secuencia numérica exclusivamente para probar tracking/canales; no contiene señas LSV auténticas.
 * @param {{hand?: string, both?: boolean, transform?: Function, label?: string}} [options] Datos de prueba.
 * @returns {object} Captura multimanual de prueba con observaciones explícitas.
 */
export function trackedFixture({
  hand = 'Right',
  both = false,
  transform = (r) => r,
  label = 'A',
} = {}) {
  const original = syntheticExperimental(label).frames;
  const left = mirrorFrames(original);
  const tracker = createHandTracker('software');
  const frames = original.map((frame, index) => {
    const selected = both ? [frame, left[index]] : [hand === 'Left' ? left[index] : frame];
    const raw = {
      landmarks: selected.map((f) => f.points.map(([x, y, z]) => ({ x, y, z }))),
      handedness: selected.map((f) => [{ categoryName: f.hand, score: 0.99 }]),
    };
    return tracker.update(transform(raw, index), { time: frame.t, width: 640, height: 480 });
  });
  return { version: 2, coordinateConvention: 'MEDIAPIPE_UNMIRRORED', frames };
}
