import { expect, test, vi } from 'vitest';
import { manualReference } from '../features/student/recognition/manual-reference.js';

vi.mock('../lib/config.js', () => ({
  publicConfig: { studentDemo: false },
}));

test('el laboratorio local puede consultar una consonante sin ampliar las imágenes publicadas', () => {
  const resource = manualReference('B', true);
  expect(resource.url).toContain('/src/assets/lsv-manual/');
  expect(resource.validationStatus).toBe('PENDING_LSV_REVIEW');
  expect(manualReference('B')).toBeNull();
  expect(manualReference('NONE', true)).toBeNull();
});

test('producción no expone las otras fichas aunque se solicite una vista de laboratorio', () => {
  vi.stubEnv('DEV', false);
  expect(manualReference('B', true)).toBeNull();
  vi.unstubAllEnvs();
});
