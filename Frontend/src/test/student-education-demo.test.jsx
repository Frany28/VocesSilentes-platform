import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { renderAuthApp } from './auth-fixture.jsx';
import { mockLessonApi } from './student-lesson-fixture.jsx';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

const path = '/student/modules/education-demo';

test('el recorrido de ejemplo continúa del primer ejercicio al visual y después al resultado', async () => {
  mockLessonApi();
  renderAuthApp(path);
  // La importación diferida inicial puede superar 1 s al ejecutar toda la suite en paralelo.
  await userEvent.click(
    await screen.findByRole('button', { name: 'Continuar al ejercicio' }, { timeout: 5000 }),
  );
  await userEvent.click(screen.getByRole('radio', { name: 'Saludar y luego presentarte' }));
  await userEvent.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
  await userEvent.click(screen.getByRole('button', { name: 'Continuar al ejercicio visual' }));
  expect(screen.getByText('Clip de la seña · pendiente')).toBeVisible();
  await userEvent.click(screen.getByRole('radio', { name: 'Saludar' }));
  await userEvent.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
  await userEvent.click(screen.getByRole('button', { name: 'Continuar al resultado' }));
  expect(screen.getByRole('heading', { level: 1, name: '¡Clase completada!' })).toBeVisible();
});

test('demo identificada: cuatro radios, comprobación deshabilitada sin selección y teclado nativo', async () => {
  mockLessonApi();
  renderAuthApp(path);
  const controls = await screen.findByRole('combobox', { name: 'Vista de demostración' });
  expect(screen.getByText('Demostración: estos datos no son tu progreso real.')).toBeVisible();
  await userEvent.selectOptions(controls, 'choice');
  const group = screen.getByRole('group', {
    name: '¿Cuál es el orden para iniciar una presentación?',
  });
  const radios = within(group).getAllByRole('radio');
  expect(radios).toHaveLength(4);
  expect(radios.every((radio) => !radio.checked)).toBe(true);
  expect(screen.getByRole('button', { name: 'Comprobar respuesta' })).toBeDisabled();
  radios[0].focus();
  await userEvent.keyboard('[Space][ArrowDown]');
  expect(radios[1]).toBeChecked();
  expect(radios[1]).toHaveFocus();
  expect(screen.getByRole('button', { name: 'Comprobar respuesta' })).toBeEnabled();
  await userEvent.click(screen.getByRole('button', { name: 'Quitar selección' }));
  expect(radios.every((radio) => !radio.checked)).toBe(true);
});

test('retroalimentación elegida por control, reintento y avance local sin llamadas de escritura', async () => {
  const fetchMock = mockLessonApi();
  renderAuthApp(path);
  const controls = await screen.findByRole('combobox', { name: 'Vista de demostración' });
  await userEvent.selectOptions(controls, 'visual');
  expect(screen.getByText('Clip de la seña · pendiente')).toBeVisible();
  expect(document.querySelector('video, iframe')).toBeNull();
  await userEvent.selectOptions(screen.getByLabelText('Retroalimentación de muestra'), 'incorrect');
  await userEvent.click(screen.getByRole('radio', { name: 'Saludar' }));
  await userEvent.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Respuesta incorrecta');
  expect(screen.getByRole('alert')).toHaveTextContent('Vuelve a observar');
  expect(document.getElementById('student-content')).toHaveFocus();
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar ejercicio' }));
  expect(screen.getAllByRole('radio').every((radio) => !radio.checked)).toBe(true);
  await userEvent.selectOptions(screen.getByLabelText('Retroalimentación de muestra'), 'correct');
  await userEvent.click(screen.getByRole('radio', { name: 'Pedir ayuda' }));
  await userEvent.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
  expect(screen.getByText('Respuesta correcta')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Continuar al resultado' }));
  expect(screen.getByRole('heading', { level: 1, name: '¡Clase completada!' })).toBeVisible();
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});

test('resultado fijo muestra 4/5, 80% en texto, aria-valuenow y ancho de barra, y vuelve al catálogo', async () => {
  mockLessonApi();
  const view = renderAuthApp(path);
  await userEvent.selectOptions(await screen.findByLabelText('Vista de demostración'), 'result');
  const bar = screen.getByRole('progressbar', { name: 'Progreso del módulo' });
  expect(bar).toHaveAttribute('aria-valuenow', '80');
  expect(bar.firstElementChild).toHaveStyle({ width: '80%' });
  expect(screen.getByText('80% · 4 de 5 lecciones')).toBeVisible();
  expect(screen.getByText('2 / 2')).toBeVisible();
  expect(screen.getByText('4 / 5')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Continuar aprendiendo' }));
  expect(await screen.findByRole('heading', { level: 1, name: 'Mis módulos' })).toBeVisible();
  view.unmount();
  renderAuthApp(path);
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Presentarte en LSV' }),
  ).toBeVisible();
});
