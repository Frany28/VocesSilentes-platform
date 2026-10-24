import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin, account } from './admin-fixture.jsx';
import { jsonResponse } from './auth-fixture.jsx';

test('resumen: consulta recuentos globales e ignora filtros del listado en URL', async () => {
  const { fetchMock } = renderAdmin('/admin?q=ana&filter=ADMIN&page=2', () =>
    jsonResponse({
      data: {
        users: 8,
        activeUsers: 5,
        inactiveUsers: 3,
        pendingReports: 4,
        resolvedReports: 2,
        reports: [],
      },
    }),
  );
  expect(await screen.findByText('8')).toBeVisible();
  const [url] = fetchMock.mock.calls.find(([url]) => url.endsWith('/admin/summary'));
  const params = new URL(url).searchParams;
  expect(params.get('q')).toBeNull();
  expect(params.get('role')).toBeNull();
  expect(params.get('page')).toBeNull();
  expect(screen.getByText('5 activas · 3 desactivadas')).toBeVisible();
  expect(screen.getByText('4')).toBeVisible();
  expect(screen.getByText('2')).toBeVisible();
});

test('desactivación: pide confirmación y permite cambiar estado; cancelar no envía escrituras', async () => {
  const { fetchMock } = renderAdmin('/admin/users/' + account.id);
  await screen.findByRole('heading', { name: 'Persona' });
  fireEvent.click(screen.getByRole('button', { name: 'Desactivar cuenta' }));
  const dialog = screen.getByRole('dialog', { name: '¿Desactivar esta cuenta?' });
  expect(dialog).toHaveTextContent('Sus datos y progreso se conservarán');
  expect(within(dialog).getByRole('button', { name: 'Desactivar cuenta' })).toBeEnabled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
  expect(fetchMock.mock.calls.every(([, options]) => !options.method)).toBe(true);
});
