import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse } from './auth-fixture.jsx';
import { renderStudentRead } from './student-read-fixture.jsx';
import { readDemoSnapshot } from '../features/student/data/student-demo.js';

test('carga/error/reintento usa el mismo lector, sin fallback a demostración', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { user } })));
  let reject;
  const read = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve, failure) => {
          reject = failure;
        }),
    )
    .mockResolvedValue({ source: 'api', modules: [] });
  renderStudentRead(read);
  expect(await screen.findByRole('heading', { name: 'Preparando tus módulos…' })).toBeVisible();
  await waitFor(() => expect(reject).toBeDefined());
  await act(async () => reject(new Error('Mensaje privado del servidor')));
  expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar tus módulos');
  expect(screen.queryByText('Mensaje privado del servidor')).not.toBeInTheDocument();
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('heading', { name: 'Todavía no hay módulos' })).toBeVisible();
  expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  expect(read).toHaveBeenCalledTimes(2);
});

test('desmontaje cancela lectura y descarta datos tardíos', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { user } })));
  let signal;
  let finish;
  const read = (request) => {
    signal = request;
    return new Promise((resolve) => {
      finish = resolve;
    });
  };
  const view = renderStudentRead(read);
  await waitFor(() => expect(signal).toBeDefined());
  view.unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => finish({ source: 'api', modules: [] }));
  expect(screen.queryByText('Todavía no hay módulos')).not.toBeInTheDocument();
});

test.each([
  ['first', '00 / 05'],
  ['progress', '03 / 05'],
  ['completed', '05 / 05'],
])(
  'Inicio %s conserva el nombre de sesión y calcula el resumen de la muestra',
  async (scenario, summary) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { user } })));
    renderStudentRead((signal) => readDemoSnapshot(signal, scenario), '/student');
    expect(await screen.findByRole('heading', { name: 'Hola, Persona.' })).toBeVisible();
    expect(await screen.findByText(summary)).toBeVisible();
    expect(screen.getByText('Demostración: estos datos no son tu progreso real.')).toBeVisible();
    const bars = screen.getAllByRole('progressbar');
    expect(bars[0]).toHaveAttribute(
      'aria-valuenow',
      scenario === 'first' ? '0' : scenario === 'progress' ? '60' : '100',
    );
  },
);

test('falta de integración no muestra catálogo demo ni porcentajes ficticios', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { user } })));
  renderStudentRead(() => Promise.resolve({ source: 'unavailable', modules: [] }));
  expect(
    await screen.findByRole('heading', { name: 'Tu área de aprendizaje estará disponible pronto' }),
  ).toBeVisible();
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
