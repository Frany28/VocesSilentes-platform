import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { jsonResponse, renderAuthApp } from './auth-fixture.jsx';
import { prepareIntroduction } from './introduction-experience.fixture.js';
import { lessonPath } from './student-lesson-fixture.jsx';
import { mockCurriculumApi } from './student-curriculum-fixture.jsx';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test('ofrece seis etapas, actividad cotidiana con feedback y acceso a la comprobación real', async () => {
  const answer = vi.fn((options, current) => {
    current.modules[0].lessons[0].exercises[0].status = 'COMPLETED';
    return jsonResponse({
      data: {
        isCorrect: true,
        progress: { status: 'COMPLETED' },
        feedback: {
          tone: 'success',
          title: 'Comprensión confirmada',
          explanation: 'El alfabeto manual es un recurso dentro de la LSV.',
        },
      },
    });
  });
  const { fetchMock, snapshot } = mockCurriculumApi(answer);
  prepareIntroduction(snapshot);
  renderAuthApp(lessonPath);

  expect(
    await screen.findByRole('heading', {
      level: 2,
      name: 'Conozcamos la LSV y su alfabeto manual',
    }),
  ).toBeVisible();
  expect(screen.getAllByRole('list', { name: 'Etapas de la lección' })[0].children).toHaveLength(6);
  expect(screen.queryByRole('button', { name: 'Activar cámara' })).toBeNull();

  await userEvent.click(screen.getByRole('button', { name: 'Comenzar lección' }));
  expect(
    screen.getByRole('heading', { name: '¿Qué es la Lengua de Señas Venezolana?' }),
  ).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(screen.getByRole('heading', { name: '¿Qué es el alfabeto manual?' })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(
    screen.getByRole('heading', { name: '¿Cuándo puede ayudarnos el alfabeto manual?' }),
  ).toBeVisible();

  const reveals = screen.getAllByRole('button', { name: 'Descubrir explicación' });
  expect(reveals).toHaveLength(3);
  for (const reveal of reveals) await userEvent.click(reveal);
  expect(screen.getByText(/La configuración, la orientación y el movimiento/)).toBeVisible();
  const progressKey = Object.keys(localStorage).find((key) =>
    key.startsWith('vs:introduction-progress:'),
  );
  expect(JSON.parse(localStorage.getItem(progressKey)).explored).toEqual([
    'name',
    'conversation',
    'visual',
  ]);

  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(screen.getByRole('group', { name: 'Pregunta de comprensión' })).toBeVisible();
  expect(
    fetchMock.mock.calls.every(([, options = {}]) => (options.method ?? 'GET') === 'GET'),
  ).toBe(true);
  await userEvent.click(screen.getByRole('radio', { name: 'Segunda alternativa' }));
  await userEvent.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
  expect(
    await screen.findByText('El alfabeto manual es un recurso dentro de la LSV.'),
  ).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(screen.getByRole('region', { name: 'Resumen de la lección' })).toBeVisible();
  expect(
    screen.getByRole('heading', { name: 'Situaciones exploradas' }).closest('section'),
  ).toHaveTextContent('3 de 3 situaciones cotidianas revisadas.');
  expect(screen.getByRole('progressbar', { name: 'Preguntas resueltas' })).toHaveAttribute(
    'aria-valuenow',
    '100',
  );
  expect(answer).toHaveBeenCalledTimes(1);
});
