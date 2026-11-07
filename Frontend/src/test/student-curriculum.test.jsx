import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { jsonResponse, renderAuthApp } from './auth-fixture.jsx';
import { lessonPath } from './student-lesson-fixture.jsx';
import { mockCurriculumApi, questionId } from './student-curriculum-fixture.jsx';
import { reachQuestion } from './student-journey-fixture.js';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test('presenta un paso por pantalla sin sidebar ni selector; avanzar y volver no escriben progreso académico', async () => {
  const { fetchMock } = mockCurriculumApi(vi.fn());
  renderAuthApp(lessonPath);
  expect(await screen.findByRole('heading', { name: 'Tu objetivo en esta lección' })).toBeVisible();
  expect(screen.getByText(/Vista previa local · Borrador/)).toBeVisible();
  expect(screen.queryByText('Texto recibido de la API de prueba.')).toBeNull();
  expect(screen.queryByRole('article', { name: 'Letra Ñ' })).toBeNull();
  expect(document.querySelector('.student-sidebar,.student-bottom')).toBeNull();
  expect(screen.queryByRole('combobox')).toBeNull();
  expect(screen.getByRole('progressbar', { name: 'Tu recorrido' })).toHaveAttribute(
    'aria-valuenow',
    '0',
  );
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(screen.getByText('Texto recibido de la API de prueba.')).toBeVisible();
  const completed = screen
    .getByRole('progressbar', { name: 'Tu recorrido' })
    .getAttribute('aria-valuenow');
  await userEvent.click(screen.getByRole('button', { name: 'Volver' }));
  expect(screen.getByRole('heading', { name: 'Tu objetivo en esta lección' })).toBeVisible();
  expect(screen.getByRole('progressbar', { name: 'Tu recorrido' })).toHaveAttribute(
    'aria-valuenow',
    completed,
  );
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});

test('el teclado selecciona opciones opacas; el feedback backend precede al avance y pendientes no cuentan como aciertos', async () => {
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
  await reachQuestion();
  expect(screen.queryByRole('article', { name: 'Letra Ñ' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Comprobar respuesta' })).toBeDisabled();
  screen.getByRole('radio', { name: 'Primera alternativa' }).focus();
  await userEvent.keyboard('[Space][ArrowDown]');
  expect(screen.getByRole('radio', { name: 'Segunda alternativa' })).toBeChecked();
  await userEvent.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
  expect(await screen.findByText('Explicación recibida del servidor.')).toBeVisible();
  expect(screen.queryByRole('region', { name: 'Resumen de la lección' })).toBeNull();
  const submission = fetchMock.mock.calls.find(([url]) => url.endsWith('/answer'));
  expect(submission[0]).toContain(questionId);
  expect(submission[1].headers.get('X-CSRF-Token')).toBe('test-csrf');
  // La evaluación es la última etapa: tras responder se llega al repaso (resumen).
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  // El porcentaje se calcula sobre las preguntas disponibles; las pendientes se informan aparte.
  expect(screen.getByRole('progressbar', { name: 'Preguntas resueltas' })).toHaveAttribute(
    'aria-valuenow',
    '100',
  );
  expect(screen.getByText('100% · 1 de 1 preguntas resueltas')).toBeVisible();
  expect(screen.getByText(/Hay 1 ejercicio que se habilitará/)).toBeVisible();
  expect(screen.getByRole('progressbar', { name: 'Tu recorrido' })).toHaveAttribute(
    'aria-valuenow',
    '100',
  );
  expect(answer).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/^Siguiente: Lección 2 · /)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Guardar y continuar' })).toBeEnabled();
});
