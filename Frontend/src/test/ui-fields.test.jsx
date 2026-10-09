import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Input } from '../components/ui/Input.jsx';
import { PasswordInput } from '../components/ui/PasswordInput.jsx';

test('asocia label y ayudas únicas, conserva descripciones externas y cambia a error', async () => {
  const ref = createRef();
  const { rerender } = render(
    <>
      <p id="external">Información adicional</p>
      <Input ref={ref} label="Correo" help="Ayuda" aria-describedby="external" />
      <Input label="Nombre" help="Otra ayuda" />
    </>,
  );
  const input = screen.getByLabelText('Correo');
  expect(ref.current).toBe(input);
  expect(input).toHaveAccessibleDescription('Información adicional Ayuda');
  expect(input.id).not.toBe(screen.getByLabelText('Nombre').id);
  await userEvent.click(screen.getByText('Correo'));
  expect(input).toHaveFocus();
  await userEvent.type(input, 'correo incorrecto');
  rerender(
    <>
      <p id="external">Información adicional</p>
      <Input
        ref={ref}
        label="Correo"
        help="Ayuda"
        error="Revisa el correo"
        aria-describedby="external"
      />
      <Input label="Nombre" help="Otra ayuda" />
    </>,
  );
  expect(input).toHaveValue('correo incorrecto');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('Información adicional Revisa el correo');
});

test('mostrar/ocultar conserva valor, nombre, autocomplete y ref sin enviar el formulario', async () => {
  const submit = vi.fn((event) => event.preventDefault());
  const ref = createRef();
  render(
    <form onSubmit={submit}>
      <PasswordInput ref={ref} label="Contraseña" name="password" autoComplete="new-password" />
    </form>,
  );
  const input = screen.getByLabelText('Contraseña');
  expect(ref.current).toBe(input);
  await userEvent.type(input, 'solo una contraseña de prueba');
  await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
  expect(input).toHaveAttribute('type', 'text');
  expect(input).toHaveAttribute('name', 'password');
  expect(input).toHaveAttribute('autocomplete', 'new-password');
  expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute(
    'aria-controls',
    input.id,
  );
  await userEvent.keyboard('{Enter}');
  expect(input).toHaveAttribute('type', 'password');
  expect(input).toHaveValue('solo una contraseña de prueba');
  expect(submit).not.toHaveBeenCalled();
});

test('disabled deshabilita contraseña y control; fieldset disabled también se respeta', () => {
  render(
    <>
      <PasswordInput label="Bloqueada" disabled />
      <fieldset disabled>
        <PasswordInput label="Dentro de fieldset" />
      </fieldset>
    </>,
  );
  expect(screen.getByLabelText('Bloqueada')).toBeDisabled();
  expect(screen.getByLabelText('Dentro de fieldset')).toBeDisabled();
  for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
});
