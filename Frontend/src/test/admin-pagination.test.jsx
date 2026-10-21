import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin, account } from './admin-fixture.jsx';
import { jsonResponse } from './auth-fixture.jsx';

test('página fuera de rango: conserva el total real y permite volver a la primera sin afirmar vacío global', async () => {
  const { fetchMock } = renderAdmin('/admin/users?page=9', (url) => {
    const page = Number(new URL(url).searchParams.get('page'));
    return jsonResponse({
      data: { items: page === 1 ? [account] : [], total: 4, pageSize: 3, page, pages: 2 },
    });
  });
  expect(await screen.findByText('No hay cuentas en esta página')).toBeVisible();
  expect(screen.queryByText('Todavía no hay cuentas')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Primera página' }));
  expect(await screen.findByText('Persona')).toBeVisible();
  const [url] = fetchMock.mock.calls.at(-1);
  expect(new URL(url).searchParams.get('page')).toBe('1');
});
