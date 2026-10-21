import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin, account } from './admin-fixture.jsx';
import { jsonResponse } from './auth-fixture.jsx';

test('resumen: el censo real ignora filtros/página de URL y no inventa métricas de reportes', async () => {
  const { fetchMock } = renderAdmin('/admin?q=ana&filter=ADMIN&page=2', () =>
    jsonResponse({ data: { items: [account], total: 8, pages: 8, page: 1, pageSize: 1 } }),
  );
  expect(await screen.findByText('8')).toBeVisible();
  const [url] = fetchMock.mock.calls.find(([url]) => url.includes('/admin/users?'));
  const params = new URL(url).searchParams;
  expect(params.get('q')).toBe('');
  expect(params.get('role')).toBeNull();
  expect(params.get('page')).toBe('1');
  expect(params.get('pageSize')).toBe('1');
  expect(screen.getAllByLabelText('Sin datos disponibles')).toHaveLength(2);
});

test('desactivación: muestra la cuenta y la dependencia; no sustituye isActive por DELETE ni PATCH', async () => {
  const { fetchMock } = renderAdmin('/admin/users/' + account.id);
  await screen.findByRole('heading', { name: 'Persona' });
  fireEvent.click(screen.getByRole('button', { name: 'Desactivar cuenta' }));
  const dialog = screen.getByRole('dialog', { name: '¿Desactivar esta cuenta?' });
  expect(dialog).toHaveTextContent('Sus datos y progreso se conservarán');
  expect(dialog).toHaveTextContent('el backend todavía no permite cambiar el estado');
  expect(within(dialog).getByRole('button', { name: 'Desactivar cuenta' })).toBeDisabled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
  expect(fetchMock.mock.calls.every(([, options]) => !options.method)).toBe(true);
});
