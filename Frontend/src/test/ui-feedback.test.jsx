import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { NavigationItem } from '../components/ui/NavigationItem.jsx';
import { Progress } from '../components/ui/Progress.jsx';
import { Alert } from '../components/ui/Alert.jsx';

test('navegación expone destino y página actual y se alcanza por teclado', async () => {
  render(
    <NavigationItem href="/account" active>
      Mi cuenta
    </NavigationItem>,
  );
  await userEvent.tab();
  const link = screen.getByRole('link', { name: 'Mi cuenta' });
  expect(link).toHaveFocus();
  expect(link).toHaveAttribute('href', '/account');
  expect(link).toHaveAttribute('aria-current', 'page');
});

test('progress anuncia descripción y limita valores fuera de rango', () => {
  const { rerender } = render(<Progress value={60} label="Aprendizaje" valueText="3 de 5" />);
  expect(screen.getByRole('progressbar', { name: 'Aprendizaje' })).toHaveAttribute(
    'aria-valuenow',
    '60',
  );
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '3 de 5');
  rerender(<Progress value={140} label="Aprendizaje" valueText="Completo" />);
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  rerender(<Progress value={NaN} label="Aprendizaje" valueText="Sin iniciar" />);
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
});

test('alertas urgentes y estados informativos tienen roles diferenciados', () => {
  render(
    <>
      <Alert tone="error" title="Fallo">
        Inténtalo de nuevo
      </Alert>
      <Alert tone="success" title="Listo">
        Acción completada
      </Alert>
    </>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Fallo');
  expect(screen.getByRole('status')).toHaveTextContent('Acción completada');
});
