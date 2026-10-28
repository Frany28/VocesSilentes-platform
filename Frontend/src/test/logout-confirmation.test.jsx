import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, renderAuthApp } from './auth-fixture.jsx';

test.each([
  ['/student', 'USER', 'Hola, Persona.'],
  ['/admin', 'ADMIN', 'Tu comunidad, en perspectiva'],
  ['/account', 'USER', 'Mi cuenta'],
])(
  '%s: confirma, cancela, bloquea duplicados y permite reintento tras fallo',
  async (path, role, title) => {
    let finish;
    const fetchMock = vi.fn((url) => {
      if (url.endsWith('/me'))
        return Promise.resolve(jsonResponse({ data: { user: { ...user, role } } }));
      if (url.endsWith('/csrf'))
        return Promise.resolve(jsonResponse({ data: { csrfToken: 'test-csrf' } }));
      if (url.endsWith('/logout'))
        return new Promise((resolve, reject) => {
          finish = { resolve, reject };
        });
      return Promise.resolve(
        jsonResponse({ data: { reports: [], users: 0, activeUsers: 0, inactiveUsers: 0 } }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    renderAuthApp(path);
    await screen.findByRole('heading', { name: title });
    const trigger = screen.getAllByRole('button', { name: 'Cerrar sesión' })[0];
    const requests = () => fetchMock.mock.calls.filter(([url]) => url.endsWith('/logout'));
    await userEvent.click(trigger);
    let dialog = screen.getByRole('dialog', { name: '¿Cerrar sesión?' });
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus();
    expect(requests()).toHaveLength(0);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: title })).toBeVisible();
    await userEvent.click(trigger);
    dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(requests()).toHaveLength(0);
    await userEvent.click(trigger);
    dialog = screen.getByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Cerrar sesión' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    await waitFor(() => expect(requests()).toHaveLength(1));
    expect(confirm).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(dialog).toBeInTheDocument();
    const options = requests()[0][1];
    expect(options.credentials).toBe('include');
    expect(options.headers.get('X-CSRF-Token')).toBe('test-csrf');
    await act(async () => finish.reject(new TypeError('network')));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'No se pudo contactar con la API',
    );
    expect(screen.getByRole('heading', { name: title })).toBeVisible();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => expect(requests()).toHaveLength(2));
    await act(async () => finish.resolve(new Response(null, { status: 204 })));
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
  },
);
