import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { renderAdmin } from './admin-fixture.jsx';

test('foto: valida tipo/tamaño y encuadre; permite guardar y libera URLs al cancelar sin enviar', async () => {
  const create = vi.fn(() => 'blob:photo-preview');
  const revoke = vi.fn();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = create;
      static revokeObjectURL = revoke;
    },
  );
  const { fetchMock } = renderAdmin('/admin/profile');
  await screen.findByDisplayValue('Persona');
  expect(screen.getByRole('button', { name: 'Quitar foto' })).toBeDisabled();
  const trigger = screen.getByRole('button', { name: 'Agregar foto' });
  trigger.focus();
  fireEvent.click(trigger);
  const input = screen.getByLabelText('Elegir foto de perfil');
  for (const file of [
    new File(['svg'], 'no.svg', { type: 'image/svg+xml' }),
    new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' }),
  ]) {
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos usar esta imagen.');
    expect(create).not.toHaveBeenCalled();
  }
  fireEvent.change(input, {
    target: { files: [new File(['valid'], 'foto.png', { type: 'image/png' })] },
  });
  expect(screen.getByRole('img', { name: 'Vista previa local de tu foto' })).toBeInTheDocument();
  for (let step = 0; step < 7; step++)
    fireEvent.click(screen.getByRole('button', { name: 'Ampliar encuadre' }));
  expect(screen.getByLabelText('Encuadre actual')).toHaveTextContent('135%');
  expect(screen.getByRole('button', { name: 'Ampliar encuadre' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Usar esta foto' })).toBeEnabled();
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
  expect(revoke).toHaveBeenCalledWith('blob:photo-preview');
  expect(trigger).toHaveFocus();
  expect(fetchMock.mock.calls.every(([url]) => url.endsWith('/auth/me'))).toBe(true);
});
