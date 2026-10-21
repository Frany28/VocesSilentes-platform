import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin, account } from './admin-fixture.jsx';
import { jsonResponse } from './auth-fixture.jsx';

const pageResponse = (items, page = 1, total = 4) =>
  jsonResponse({
    data: {
      items,
      total,
      page,
      pageSize: 3,
      pages: Math.max(1, Math.ceil(total / 3)),
    },
  });

test('listado real: envía páginas, búsqueda y rol a la API y reinicia página al filtrar', async () => {
  const { fetchMock } = renderAdmin('/admin/users', (url) => {
    const params = new URL(url).searchParams;
    const page = Number(params.get('page'));
    const name = params.get('q')
      ? 'Encontrado'
      : params.get('role')
        ? 'Admin remoto'
        : `Página ${page}`;
    return pageResponse([{ ...account, firstName: name }], page);
  });
  await screen.findByText('Página 1');
  expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  await screen.findByText('Página 2');
  fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'ADMIN' } });
  await screen.findByText('Admin remoto');
  fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'remoto' } });
  await screen.findByText('Encontrado');
  const [url, options] = fetchMock.mock.calls.at(-1);
  expect(new URL(url).searchParams.get('page')).toBe('1');
  expect(new URL(url).searchParams.get('role')).toBe('ADMIN');
  expect(new URL(url).searchParams.get('q')).toBe('remoto');
  expect(options.credentials).toBe('include');
});

test('listado: carga, error y reintento sin demo; vacío permite quitar filtros', async () => {
  let finish;
  let attempts = 0;
  renderAdmin('/admin/users', () => {
    attempts += 1;
    if (attempts === 1)
      return new Promise((resolve) => {
        finish = resolve;
      });
    return pageResponse([], 1, 0);
  });
  await screen.findByText('Preparando usuarios…');
  await waitFor(() => expect(finish).toBeDefined());
  await act(async () =>
    finish(jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'Error interno' } }, 500)),
  );
  await screen.findByText('No pudimos cargar usuarios');
  expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  await screen.findByText('No encontramos resultados');
  fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'nadie' } });
  await screen.findByText('No encontramos resultados');
  fireEvent.click(screen.getByRole('button', { name: 'Ver todos' }));
  expect(screen.getByLabelText('Buscar')).toHaveValue('');
});

test('listado: cancela y descarta una respuesta tardía al cambiar búsqueda', async () => {
  let finish;
  const { fetchMock } = renderAdmin('/admin/users', (url) =>
    new URL(url).searchParams.get('q')
      ? pageResponse([{ ...account, firstName: 'Actual' }])
      : new Promise((resolve) => {
          finish = resolve;
        }),
  );
  await screen.findByText('Preparando usuarios…');
  await waitFor(() => expect(finish).toBeDefined());
  const signal = fetchMock.mock.calls.find(([url]) => url.includes('/admin/users?'))[1].signal;
  fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'actual' } });
  await screen.findByText('Actual');
  expect(signal.aborted).toBe(true);
  await act(async () => finish(pageResponse([{ ...account, firstName: 'Obsoleto' }])));
  expect(screen.queryByText('Obsoleto')).not.toBeInTheDocument();
});
