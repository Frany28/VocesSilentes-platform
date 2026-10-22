import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, renderAuthApp } from './auth-fixture.jsx';

test('cuenta USER comparte foto/seguridad sin enviar credenciales ni simular cambios guardados', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { user } }));
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:student-photo');
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  renderAuthApp('/student/profile');
  await screen.findByLabelText('Nombre');
  expect(screen.getByText('Rol · Estudiante')).toBeVisible();
  expect(screen.getByLabelText('Nombre')).toHaveAttribute('readonly');
  expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  const trigger = screen.getByRole('button', { name: 'Agregar foto' });
  trigger.focus();
  fireEvent.click(trigger);
  fireEvent.change(screen.getByLabelText('Elegir foto de perfil'), {
    target: { files: [new File(['preview'], 'photo.png', { type: 'image/png' })] },
  });
  expect(screen.getByRole('button', { name: 'Usar esta foto' })).toBeDisabled();
  expect(screen.getByText(/Guardado no disponible/)).toBeVisible();
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
  expect(revoke).toHaveBeenCalledWith('blob:student-photo');
  expect(trigger).toHaveFocus();
  fireEvent.click(
    within(screen.getByRole('navigation', { name: 'Configuración de mi perfil' })).getByRole(
      'link',
      { name: 'Seguridad' },
    ),
  );
  expect(await screen.findByText('Cambio de contraseña no disponible')).toBeVisible();
  expect(screen.getByLabelText('Contraseña actual')).toBeDisabled();
  expect(fetchMock.mock.calls.every(([url]) => url.endsWith('/auth/me'))).toBe(true);
  expect(screen.queryByText('Cambios guardados')).toBeNull();
});
