import { act, fireEvent, screen } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { trainExperimentalModel } from '../../../shared/lsv/experimental-train.js';
import { createDemoRelease } from '../../../shared/lsv/demo-release.js';
import { syntheticExperimental } from '../../../Backend/tests/fixtures/lsv-experimental-synthetic.js';

// Geometría sintética de prueba (A/NONE): valida el software, no reconoce LSV real.
export const samples = ['A', 'NONE'].map((label) => syntheticExperimental(label));
export const release = createDemoRelease(trainExperimentalModel(samples).model);

/**
 * Sirve el modelo sintético como si fuera el de demostración publicado.
 * @returns {Function} Mock de fetch.
 */
export function serveRelease() {
  const request = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify(release), { headers: { 'Content-Type': 'application/json' } }),
    );
  vi.stubGlobal('fetch', request);
  // File.text es nativo en Chrome; este adaptador cubre el entorno DOM de pruebas.
  vi.stubGlobal(
    'File',
    class {
      constructor(parts) {
        this.content = parts.join('');
        this.size = this.content.length;
      }
      text() {
        return Promise.resolve(this.content);
      }
    },
  );
  return request;
}

/**
 * Cámara simulada que entrega frames manualmente; no simula reconocimiento.
 * @returns {object} Estado live y suscripción.
 */
export function fakeCamera() {
  // Varios suscriptores a la vez, como useHandCamera: captura, captura automática e indicaciones.
  const listeners = new Set();
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  // Igual que useHandCamera: Set.forEach también entrega el frame a quien se suscribe durante el reparto.
  const receive = (result, timing) => listeners.forEach((listener) => listener(result, timing));
  return { state: 'live', sessionId: 'test', subscribe, receive };
}

/**
 * Pulsa capturar, recorre la cuenta atrás y entrega los frames sintéticos de A.
 * @param {object} camera Cámara simulada.
 * @param {string} hand Lateralidad declarada en los frames.
 * @returns {Promise<void>} Intento terminado.
 */
export async function attempt(camera, hand) {
  vi.useFakeTimers();
  try {
    fireEvent.click(screen.getByRole('button', { name: 'Capturar intento' }));
    expect(screen.getByText('Prepárate: la captura empieza en 3…')).toBeVisible();
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('Capturando… mantén la seña quieta.')).toBeVisible();
    const origin = performance.now();
    act(() => {
      for (const frame of samples[0].frames)
        camera.receive(
          {
            landmarks: [frame.points.map(([x, y, z]) => ({ x, y, z }))],
            handedness: [[{ categoryName: hand }]],
          },
          { time: origin + frame.t, width: 640, height: 480 },
        );
      vi.advanceTimersByTime(3000);
    });
  } finally {
    vi.useRealTimers();
  }
}
