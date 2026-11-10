import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, test, vi } from 'vitest';
import { SignPracticeWorkspace } from '../features/student/practice/SignPracticeWorkspace.jsx';
import { RecognitionModelProvider } from '../features/student/recognition/RecognitionModelProvider.jsx';

// Aísla el contrato de navegación del detector: solo el callback de un intento logrado hace avanzar.
vi.mock('../features/student/recognition/CameraPracticeLoader.jsx', () => ({
  CameraPracticeLoader: ({ letter, onContinue }) => (
    <button onClick={onContinue}>Continuar intento de prueba {letter}</button>
  ),
}));

test('seleccionar no completa; continuar cuenta una vez y la última vocal ofrece salida y repetición', () => {
  render(
    <MemoryRouter>
      <RecognitionModelProvider>
        <SignPracticeWorkspace />
      </RecognitionModelProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Practicar vocal E' }));
  expect(screen.getByText(/0 pasos logrados/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Continuar intento de prueba E' }));
  expect(screen.getByRole('button', { name: 'Continuar intento de prueba I' })).toBeVisible();
  expect(screen.getByText(/1 paso logrado/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Practicar vocal E' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continuar intento de prueba E' }));
  expect(screen.getByText(/1 paso logrado/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Practicar vocal U' }));
  expect(screen.queryByRole('region', { name: 'Fin de la práctica' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Continuar intento de prueba U' }));
  expect(screen.getByRole('region', { name: 'Fin de la práctica' })).toBeVisible();
  expect(screen.getByText(/2 pasos logrados/)).toBeVisible();
  expect(screen.getByRole('link', { name: 'Ir a la lección de vocales' })).toHaveAttribute(
    'href',
    '/student/modules/vowels',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Practicar otra vez' }));
  expect(screen.getByRole('button', { name: 'Continuar intento de prueba U' })).toBeVisible();
  expect(screen.queryByRole('region', { name: 'Fin de la práctica' })).toBeNull();
});
