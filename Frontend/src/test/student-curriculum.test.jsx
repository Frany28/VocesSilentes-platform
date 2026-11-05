import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { jsonResponse, renderAuthApp } from './auth-fixture.jsx';
import { lessonPath } from './student-lesson-fixture.jsx';
import { mockCurriculumApi, questionId } from './student-curriculum-fixture.jsx';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test('lectura estructurada y tarjetas pendientes conservan objetivos, teclado y navegación por ID', async () => {
  const { fetchMock } = mockCurriculumApi(vi.fn());
  renderAuthApp(lessonPath);
  // La ruta Student se importa de forma diferida también en la primera ejecución de la suite completa.
  expect(
    await screen.findByRole('heading', { name: 'Objetivos de aprendizaje' }, { timeout: 5000 }),
  ).toBeVisible();
  expect(screen.getByText(/Vista previa local · Borrador/)).toBeVisible();
  expect(screen.getByText('Distinguir la LSV del alfabeto manual.')).toBeVisible();
  const card = screen.getByRole('article', { name: 'Letra Ñ' });
  expect(within(card).getByText('Imagen original o autorizada pendiente')).toBeVisible();
  expect(document.querySelector('video, iframe, .alphabet-card-grid img')).toBeNull();
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Continuar aprendiendo' }));
  expect(await screen.findByText('Texto anterior sin objetivo separado.')).toBeVisible();
});

test('usa opciones opacas y resultado backend; oculta tarjetas al responder y no declara preguntas pendientes como aciertos', async () => {
  const answer = vi.fn((options, snapshot) => {
    expect(JSON.parse(options.body)).toEqual({ optionId: 'opt2' });
    snapshot.modules[0].lessons[0].exercises[0].status = 'COMPLETED';
    return jsonResponse({
      data: {
        isCorrect: true,
        progress: { status: 'COMPLETED' },
        feedback: {
          tone: 'success',
          title: 'Confirmación del servidor',
          explanation: 'Explicación recibida del servidor.',
        },
      },
    });
  });
  const { fetchMock } = mockCurriculumApi(answer);
  renderAuthApp(lessonPath);
  await userEvent.click(
    await screen.findByRole('button', { name: 'Ir a los ejercicios' }, { timeout: 5000 }),
  );
  expect(screen.queryByRole('article', { name: 'Letra Ñ' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Comprobar respuesta' })).toBeDisabled();
  screen.getByRole('radio', { name: 'Primera alternativa' }).focus();
  await userEvent.keyboard('[Space][ArrowDown]');
  expect(screen.getByRole('radio', { name: 'Segunda alternativa' })).toBeChecked();
  await userEvent.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
  expect(await screen.findByText('Explicación recibida del servidor.')).toBeVisible();
  expect(answer).toHaveBeenCalledTimes(1);
  const submission = fetchMock.mock.calls.find(([url]) => url.endsWith('/answer'));
  expect(submission[0]).toContain(questionId);
  expect(submission[1].headers.get('X-CSRF-Token')).toBe('test-csrf');
  await userEvent.click(screen.getByRole('button', { name: 'Siguiente pregunta' }));
  expect(screen.getByRole('heading', { name: 'Pregunta pendiente' })).toBeVisible();
  expect(screen.queryByRole('radio')).toBeNull();
  expect(screen.getByRole('button', { name: 'Comprobar respuesta' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Ver siguiente pregunta' }));
  expect(screen.getByRole('progressbar', { name: 'Preguntas resueltas' })).toHaveAttribute(
    'aria-valuenow',
    '50',
  );
  expect(screen.getByText('50% · 1 de 2 preguntas resueltas')).toBeVisible();
  expect(screen.getByText('Preguntas pendientes de material o revisión: 1.')).toBeVisible();
});
