import { screen, render } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import { renderAuthApp, user, jsonResponse } from './auth-fixture.jsx';
import { ManualReference } from '../features/student/recognition/ManualReference.jsx';
import {
  alphabetLessonIds,
  alphabetModuleId,
} from '../features/student/resources/lesson-videos.js';

vi.mock('../lib/config.js', async (original) => ({
  ...(await original()),
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

const module = {
  id: alphabetModuleId,
  title: 'Abecedario LSV',
  order: 1,
  contentKey: 'modulo-01-alfabeto-manual-lsv',
  publicationStatus: 'PUBLISHED',
  access: 'available',
  lessons: [
    {
      id: alphabetLessonIds['m1-l02'],
      title: 'Las cinco vocales: A, E, I, O y U',
      order: 2,
      description: 'Objetivo: estudiar las vocales.\n\nTeoría de la fixture API.',
      publicationStatus: 'PUBLISHED',
      status: 'NOT_STARTED',
      exercises: [],
      content: {
        objectives: ['Reconocer y comparar A, E, I, O y U.'],
        letterCards: ['A', 'E', 'I', 'O', 'U'].map((letter) => ({ letter })),
      },
    },
  ],
};

function serve(modules) {
  const fetchMock = vi.fn(async (url) =>
    jsonResponse({
      data: url.endsWith('/learning') ? { source: 'api', modules } : { user },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

test('el enlace original abre la lección real unificada sin activar recursos de cámara', async () => {
  const fetchMock = serve([module]);
  renderAuthApp('/student/modules/vowels');
  expect(
    await screen.findByRole('heading', { name: 'Aprendamos las cinco vocales' }),
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'Comenzar lección' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Activar cámara' })).toBeNull();
  expect(document.querySelector('.learning-shell')).not.toBeNull();
  expect(screen.queryByText('Video de referencia · pendiente')).toBeNull();
  expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/learning'))).toBe(true);
  expect(
    fetchMock.mock.calls.every(([, options]) => !options?.method || options.method === 'GET'),
  ).toBe(true);
});

test('el enlace original no sustituye con fixtures una lección que la API no publica', async () => {
  serve([{ ...module, access: 'upcoming', publicationStatus: 'DRAFT', lessons: [] }]);
  renderAuthApp('/student/modules/vowels');
  expect(await screen.findByText('Lección no disponible')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Comenzar lección' })).toBeNull();
});

test('runtime normal muestra también la ficha VocesSilentes de las consonantes autorizadas', () => {
  render(<ManualReference letter="B" />);
  expect(screen.getByRole('img', { name: /referencia de la letra B/ })).toBeVisible();
  expect(screen.getByText(/Revisión lingüística pendiente\./)).toBeVisible();
  expect(screen.queryByText(/Vista previa de desarrollo/)).toBeNull();
});

test('runtime normal muestra las vocales autorizadas sin ocultar la revisión LSV pendiente', () => {
  render(<ManualReference letter="A" />);
  expect(screen.getByRole('img', { name: /referencia de la letra A/ })).toBeVisible();
  expect(screen.getByText(/Revisión lingüística pendiente\./)).toBeVisible();
  expect(screen.queryByText(/Vista previa de desarrollo/)).toBeNull();
});
