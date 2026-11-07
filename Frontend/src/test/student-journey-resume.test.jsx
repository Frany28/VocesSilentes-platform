import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { renderAuthApp } from './auth-fixture.jsx';
import { lessonPath } from './student-lesson-fixture.jsx';
import { mockCurriculumApi } from './student-curriculum-fixture.jsx';
import { reachQuestion, reachReadingSummary } from './student-journey-fixture.js';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test('recargar recupera el paso sin respuestas locales y salir devuelve la navegación normal', async () => {
  const { fetchMock } = mockCurriculumApi(vi.fn());
  const view = renderAuthApp(lessonPath);
  await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
  view.unmount();
  renderAuthApp(lessonPath);
  expect(await screen.findByText('Texto recibido de la API de prueba.')).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Tu objetivo en esta lección' })).toBeNull();
  const checkpoints = Object.keys(localStorage).filter((key) =>
    key.startsWith('vs:lesson-journey:'),
  );
  expect(checkpoints).toHaveLength(1);
  const saved = JSON.parse(localStorage.getItem(checkpoints[0]));
  expect(Object.keys(saved).sort()).toEqual(['completed', 'position', 'signature']);
  expect(JSON.stringify(saved)).not.toMatch(/opt[1-4]|isCorrect|feedback|COMPLETED/);
  await userEvent.click(screen.getByRole('link', { name: 'Salir de la lección' }));
  expect(await screen.findByRole('heading', { name: 'Mis módulos' })).toBeVisible();
  expect(document.querySelector('.student-sidebar')).not.toBeNull();
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});

test('una pregunta se recupera desde avance confirmado por API y permite repasar sin enviar otra respuesta', async () => {
  const { snapshot } = mockCurriculumApi(vi.fn());
  const view = renderAuthApp(lessonPath);
  await reachQuestion();
  view.unmount();
  snapshot.modules[0].lessons[0].exercises[0].status = 'COMPLETED';
  renderAuthApp(lessonPath);
  expect(await screen.findByText('Esta pregunta ya está resuelta')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Responder de nuevo' }));
  expect(screen.getAllByRole('radio')).toHaveLength(4);
  expect(screen.getByRole('button', { name: 'Comprobar respuesta' })).toBeDisabled();
});

test('las vocales se recorren en grupos pequeños y concluyen con cero aciertos en las cinco preguntas pendientes', async () => {
  const { snapshot, fetchMock } = mockCurriculumApi(vi.fn());
  const lesson = snapshot.modules[0].lessons[0];
  const card = lesson.content.letterCards[0];
  lesson.content.letterCards = ['A', 'E', 'I', 'O', 'U'].map((letter) => ({ ...card, letter }));
  lesson.exercises = Array.from({ length: 5 }, (_, index) => ({
    ...lesson.exercises[1],
    id: `pending-${index}`,
  }));
  renderAuthApp(lessonPath);
  await reachReadingSummary();
  // Sin preguntas disponibles no se muestra un «0 de 5» desalentador, sino el aviso de pendientes.
  expect(screen.getByText(/Hay 5 ejercicios que se habilitarán/)).toBeVisible();
  expect(screen.getByText(/No cuentan como fallos/)).toBeVisible();
  expect(screen.queryByRole('progressbar', { name: 'Preguntas resueltas' })).toBeNull();
  expect(screen.getByRole('heading', { name: '¡Muy bien, terminaste la lección!' })).toBeVisible();
  expect(screen.getByRole('progressbar', { name: 'Tu recorrido' })).toHaveAttribute(
    'aria-valuenow',
    '100',
  );
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});
