import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Button } from '../components/ui/Button.jsx';

test('loading conserva contenido de reposo y expone únicamente la etiqueta de carga al lector', () => {
  const view = render(<Button density="compact">Crear usuario</Button>);
  const label = screen.getByText('Crear usuario');
  const icon = view.container.querySelector('.vs-icon');
  view.rerender(
    <Button density="compact" loading loadingLabel="Creando usuario…">
      Crear usuario
    </Button>,
  );
  const button = screen.getByRole('button', { name: 'Creando usuario…' });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
  expect(label).toBeInTheDocument();
  expect(label.parentElement).toHaveAttribute('aria-hidden', 'true');
  expect(view.container.querySelector('.vs-icon')).toBe(icon);
  view.rerender(<Button density="compact">Crear usuario</Button>);
  expect(screen.getByRole('button', { name: 'Crear usuario' })).toBeEnabled();
  expect(label.parentElement).not.toHaveAttribute('aria-hidden');
});
