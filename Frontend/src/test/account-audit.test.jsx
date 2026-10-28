import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, renderAuthApp } from './auth-fixture.jsx';

test('perfil Student anuncia validación y enfoca el primer error sin enviar cambios', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { user } }));
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/student/profile');
  const name = await screen.findByLabelText('Nombre');
  fireEvent.change(name, { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Revisa los campos indicados');
  expect(name).toHaveFocus();
  expect(name).toHaveAccessibleDescription('Introduce tu nombre.');
  expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/account/profile'))).toBe(false);
});

test.each(['USER', 'ADMIN'])(
  '%s: quitar foto enfoca conservar y cancelar no envía eliminación',
  async (role) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ data: { user: { ...user, role, profileImagePath: 'photo' } } }),
      );
    vi.stubGlobal('fetch', fetchMock);
    renderAuthApp(role === 'ADMIN' ? '/admin/profile' : '/student/profile');
    fireEvent.click(await screen.findByRole('button', { name: 'Quitar foto' }));
    const dialog = screen.getByRole('dialog', { name: '¿Quitar tu foto?' });
    const keep = within(dialog).getByRole('button', { name: 'Conservar foto' });
    expect(keep).toHaveFocus();
    fireEvent.click(keep);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, options]) => options.method === 'DELETE')).toBe(false);
  },
);
