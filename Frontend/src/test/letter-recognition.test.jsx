import { act, render, renderHook, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { cameraStage } from '../features/student/recognition/camera-stage.js';
import { useLetterRecognizer } from '../features/student/recognition/use-letter-recognizer.js';
import { WorkspaceAttempt } from '../features/student/recognition/WorkspaceAttempt.jsx';
import { letterSequence, trackerPackets } from '../../../Backend/tests/fixtures/synthetic-hand.js';

// Geometría SINTÉTICA para probar la integración del motor con la interfaz; no son señas reales.

function sources({ camera = {}, attempt = {}, operation = {}, capture = {}, live = null } = {}) {
  return {
    camera: {
      state: 'live',
      hands: 1,
      error: '',
      detection: null,
      subscribe: () => () => {},
      start: vi.fn(),
      stop: vi.fn(),
      ...camera,
    },
    attempt: {
      busy: false,
      live: true,
      supported: true,
      ready: true,
      shown: false,
      countdown: { count: null },
      automatic: { rearm: vi.fn() },
      manual: vi.fn(),
      ...attempt,
    },
    operation: {
      model: null,
      ready: true,
      geometric: true,
      loadError: '',
      result: null,
      error: '',
      clear: vi.fn(),
      ...operation,
    },
    capture: { frames: null, error: '', clear: vi.fn(), ...capture },
    target: 'L',
    live,
  };
}

const shown = (result, target = 'L') => ({
  ...sources({ attempt: { shown: true }, operation: { result }, capture: { frames: [{}] } }),
  target,
});

test('una letra sin modelo DTW (consonante) no queda bloqueada en «preparando»', () => {
  expect(cameraStage(sources({ camera: { hands: 0 } })).id).toBe('searching');
});

test('la guía en vivo distingue ajuste, mantener posición y seña no reconocida', () => {
  const adjust = cameraStage(
    sources({ live: { state: 'ADJUST', message: 'Separa el pulgar del índice.' } }),
  );
  expect(adjust.id).toBe('adjusting');
  expect(adjust.title).toBe('Ajuste necesario');
  expect(adjust.guidance).toBe('Separa el pulgar del índice.');
  expect(cameraStage(sources({ live: { state: 'HOLD', message: 'Mantén la posición.' } })).id).toBe(
    'holding',
  );
  expect(
    cameraStage(sources({ live: { state: 'UNRECOGNIZED', message: 'No reconocemos…' } })).title,
  ).toBe('Seña no reconocida');
});

test('resultado compatible con la mano izquierda, sin presentarse como certificación', () => {
  const stage = cameraStage(
    shown({
      label: null,
      reason: 'GEOMETRY_ONLY',
      geometry: { verdict: 'MATCH', hand: 'Left', status: 'DOCUMENTED' },
      evidence: { verdict: 'MATCH', source: 'GEOMETRY' },
    }),
  );
  expect(stage.id).toBe('match');
  expect(stage.title).toBe('Configuración compatible');
  expect(stage.guidance).toMatch(/mano izquierda/);
  expect(stage.guidance).toMatch(/no una certificación/);
});

test('la geometría veta una coincidencia del modelo y explica la corrección', () => {
  const stage = cameraStage(
    shown(
      {
        label: 'U',
        reason: 'CANDIDATE',
        geometry: { verdict: 'ADJUST', hint: 'Junta los dedos índice y medio.' },
        evidence: { verdict: 'ADJUST', hint: 'Junta los dedos índice y medio.' },
      },
      'U',
    ),
  );
  expect(stage.id).toBe('adjust');
  expect(stage.guidance).toMatch(/^Junta los dedos índice y medio\./);
});

test('una letra parecida se nombra como rival; un movimiento incompleto se pide completar', () => {
  const rival = cameraStage(
    shown(
      {
        geometry: { verdict: 'CONFUSED', rival: 'V' },
        evidence: { verdict: 'DIFFERENT', rival: 'V', hint: 'Junta los dedos índice y medio.' },
      },
      'U',
    ),
  );
  expect(rival.title).toBe('Se parece más a la V');
  const motion = cameraStage(
    shown(
      {
        geometry: { verdict: 'INCOMPLETE_MOTION' },
        evidence: { verdict: 'ADJUST', motion: 'INCOMPLETE_MOTION' },
      },
      'J',
    ),
  );
  expect(motion.guidance).toMatch(/completa el movimiento/);
});

test('las letras con fuentes en revisión lo indican al estudiante', () => {
  const stage = cameraStage(
    shown(
      {
        geometry: { verdict: 'MATCH', hand: 'Right', status: 'SOURCE_CONFLICT' },
        evidence: { verdict: 'MATCH' },
      },
      'S',
    ),
  );
  expect(stage.guidance).toMatch(/ficha del curso/);
});

test('el panel muestra el resultado de ajuste junto a la cámara y permite repetir', () => {
  render(
    <WorkspaceAttempt
      {...shown({
        geometry: { verdict: 'ADJUST', hint: 'Extiende el dedo índice.' },
        evidence: { verdict: 'ADJUST', hint: 'Extiende el dedo índice.' },
      })}
    />,
  );
  expect(screen.getByRole('status')).toHaveTextContent('Ajuste necesario');
  expect(screen.getByRole('status')).toHaveTextContent('Extiende el dedo índice.');
  expect(screen.getByRole('button', { name: 'Repetir intento' })).toBeEnabled();
});

test('el hook en vivo recorre analizar → mantener → compatible con fotogramas reales del motor', () => {
  const listeners = new Set();
  const camera = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  const { result } = renderHook(() => useLetterRecognizer(camera, 'L'));
  const packets = trackerPackets(letterSequence(() => ({ pose: 'L' }), { hand: 'Left' }));
  const seen = new Set();
  for (const tracking of packets) {
    act(() => listeners.forEach((listener) => listener({ tracking }, { time: tracking.t })));
    seen.add(result.current?.state);
  }
  expect([...seen]).toEqual(expect.arrayContaining(['ANALYZING', 'HOLD', 'MATCH']));
  expect(result.current.hand).toBe('Left');
  act(() => listeners.forEach((listener) => listener(null)));
  expect(result.current).toBeNull();
});

test('el hook no se activa para letras sin rasgos verificables (Q, T)', () => {
  const camera = { subscribe: vi.fn(() => () => {}) };
  const { result } = renderHook(() => useLetterRecognizer(camera, 'Q'));
  expect(result.current).toBeNull();
  expect(camera.subscribe).not.toHaveBeenCalled();
});
