import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Button } from '../components/ui/Button.jsx';
import { Checkbox } from '../components/ui/Checkbox.jsx';
import { Radio } from '../components/ui/Radio.jsx';
import { ThemeSwitch } from '../components/ui/ThemeSwitch.jsx';

test('disabled y loading impiden clic, teclado y envíos repetidos; ref apunta al botón', async () => {
  const submit = vi.fn((event) => event.preventDefault());
  const ref = createRef();
  const { rerender } = render(
    <form onSubmit={submit}>
      <Button ref={ref} type="submit">
        Guardar
      </Button>
    </form>,
  );
  const button = screen.getByRole('button', { name: 'Guardar' });
  expect(ref.current).toBe(button);
  await userEvent.click(button);
  expect(submit).toHaveBeenCalledTimes(1);
  rerender(
    <form onSubmit={submit}>
      <Button type="submit" loading>
        Guardar
      </Button>
    </form>,
  );
  const loading = screen.getByRole('button', { name: 'Cargando…' });
  expect(loading).toBeDisabled();
  expect(loading).toHaveAttribute('aria-busy', 'true');
  await userEvent.click(loading);
  await userEvent.keyboard('{Enter} ');
  expect(submit).toHaveBeenCalledTimes(1);
  rerender(
    <form onSubmit={submit}>
      <Button type="submit" disabled>
        Guardar
      </Button>
    </form>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  expect(submit).toHaveBeenCalledTimes(1);
});

test('checkbox responde a Espacio, emite cambios y respeta disabled', async () => {
  const change = vi.fn();
  render(
    <>
      <Checkbox onChange={change}>Aceptar</Checkbox>
      <Checkbox disabled>Bloqueada</Checkbox>
    </>,
  );
  const checkbox = screen.getByRole('checkbox', { name: 'Aceptar' });
  await userEvent.tab();
  expect(checkbox).toHaveFocus();
  await userEvent.keyboard(' ');
  expect(checkbox).toBeChecked();
  expect(change).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByText('Bloqueada'));
  expect(screen.getByRole('checkbox', { name: 'Bloqueada' })).not.toBeChecked();
});

test('radios agrupados cambian con flechas y excluyen opciones deshabilitadas', async () => {
  render(
    <>
      <Radio name="answer" defaultChecked>
        Primera
      </Radio>
      <Radio name="answer">Segunda</Radio>
      <Radio name="answer" disabled>
        Tercera
      </Radio>
    </>,
  );
  await userEvent.tab();
  await userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('radio', { name: 'Segunda' })).toBeChecked();
  expect(screen.getByRole('radio', { name: 'Primera' })).not.toBeChecked();
  await userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('radio', { name: 'Primera' })).toBeChecked();
});

test('selector de tema anuncia selección y admite activación por teclado', async () => {
  const click = vi.fn();
  const { rerender } = render(<ThemeSwitch dark={false} onClick={click} />);
  await userEvent.tab();
  await userEvent.keyboard(' ');
  expect(click).toHaveBeenCalledTimes(1);
  rerender(<ThemeSwitch dark onClick={click} />);
  expect(screen.getByRole('button', { name: 'Tema oscuro' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
