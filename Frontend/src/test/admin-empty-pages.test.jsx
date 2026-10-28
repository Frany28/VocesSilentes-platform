import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin } from './admin-fixture.jsx';
import { jsonResponse } from './auth-fixture.jsx';
import { report } from './admin-report-fixture.js';

test.each([
  ['reports', 'reportes', { reports: [report] }, 'Revisión de prueba'],
  [
    'audit',
    'operaciones',
    { items: [{ id: 'event', operation: 'USER_REGISTERED' }] },
    'Registro de usuario',
  ],
])(
  '%s: distingue página fuera de rango y recupera primera página',
  async (path, noun, data, title) => {
    const { fetchMock } = renderAdmin(`/admin/${path}?page=9`, (url) => {
      const page = Number(new URL(url).searchParams.get('page'));
      return jsonResponse({
        data: {
          reports: [],
          items: [],
          ...(page === 1 ? data : {}),
          total: 4,
          pageSize: 30,
          page,
          pages: 1,
        },
      });
    });
    expect(await screen.findByText(`No hay ${noun} en esta página`)).toBeVisible();
    expect(screen.queryByText(`Todavía no hay ${noun}`)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Primera página' }));
    expect(await screen.findByRole('heading', { name: title })).toBeVisible();
    expect(new URL(fetchMock.mock.calls.at(-1)[0]).searchParams.get('page')).toBe('1');
  },
);
