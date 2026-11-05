import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { renderAuthApp } from './auth-fixture.jsx';
import {
  lessonId,
  lessonPath,
  lessonTitle,
  mockLessonApi,
  nextId,
} from './student-lesson-fixture.jsx';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test('catálogo → lectura → siguiente/anterior con títulos repetidos → catálogo, sin escribir progreso', async () => {
  const fetchMock = mockLessonApi();
  renderAuthApp('/student/modules');
  const card = await screen.findByRole('article', {
    name: 'Descubriendo la LSV y mis primeras señas',
  });
  await userEvent.click(within(card).getByRole('button', { name: 'Explorar módulo' }));
  expect(await screen.findByRole('heading', { level: 1, name: lessonTitle })).toBeVisible();
  expect(screen.getByRole('region', { name: 'Objetivo de la lección' })).toHaveTextContent(
    'Conocer la LSV.',
  );
  expect(screen.getByRole('region', { name: 'Explicación educativa' })).toHaveTextContent(
    'Primera explicación.',
  );
  expect(screen.queryByRole('link', { name: 'Lección anterior' })).toBeNull();
  expect(screen.getByRole('link', { current: 'page', name: lessonTitle })).toHaveAttribute(
    'href',
    lessonPath,
  );
  await userEvent.click(screen.getByRole('link', { name: 'Lección siguiente' }));
  expect(await screen.findByText('Texto anterior sin objetivo separado.')).toBeVisible();
  expect(screen.getByRole('region', { name: 'Objetivo de la lección' })).toHaveTextContent(
    'todavía no tiene',
  );
  expect(screen.getByRole('link', { current: 'page', name: lessonTitle })).toHaveAttribute(
    'href',
    lessonPath.replace(lessonId, nextId),
  );
  expect(screen.queryByRole('link', { name: 'Lección siguiente' })).toBeNull();
  await userEvent.click(screen.getByRole('link', { name: 'Lección anterior' }));
  expect(await screen.findByText('Primera explicación.')).toBeVisible();
  expect(document.getElementById('student-content')).toHaveFocus();
  await userEvent.click(screen.getByRole('link', { name: 'Volver a Mis módulos' }));
  expect(await screen.findByRole('heading', { level: 1, name: 'Mis módulos' })).toBeVisible();
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});

test('inicio abre la lección sugerida y el enlace directo reconstruye la lectura tras desmontar', async () => {
  mockLessonApi();
  const first = renderAuthApp('/student');
  const preview = await screen.findByRole('button', {
    name: new RegExp(lessonTitle.replaceAll('?', '\\?')),
  });
  await userEvent.click(preview);
  expect(await screen.findByRole('heading', { level: 1, name: lessonTitle })).toBeVisible();
  first.unmount();
  renderAuthApp(lessonPath);
  expect(await screen.findByText('Primera explicación.')).toBeVisible();
});
