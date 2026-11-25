import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { VowelMicroclass } from '../features/student/microclass/VowelMicroclass.jsx';

// jsdom no reproduce audio: se simulan play/pause del elemento para observar la narración.
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

test('la microclase conserva las ilustraciones accesibles sin mostrar su procedencia', async () => {
  render(<VowelMicroclass />);
  expect(screen.queryByText('Fuentes y límites')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: /^Vocal U, / }));
  expect(screen.getByRole('img', { name: 'Mano realizando la vocal U en LSV' })).toBeVisible();
  expect(screen.queryByText(/Fuentes|Manual básico de LSV/)).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: /^Sigue aprendiendo, / }));
  expect(screen.getByRole('button', { name: 'Ver de nuevo' })).toBeVisible();
  expect(screen.queryByText(/Fuentes|Manual básico de LSV/)).toBeNull();
});

test('la pregunta oculta la letra, da una pista y confirma la respuesta correcta', async () => {
  render(<VowelMicroclass />);
  await userEvent.click(screen.getByRole('button', { name: /^Pregunta: ¿qué vocal es\?, / }));
  const image = screen.getByRole('img', { name: /una vocal por identificar/ });
  expect(image).toBeVisible();
  expect(image.getAttribute('src')).toMatch(/\/ficha-[a-f0-9]{12}\.webp$/);
  expect(image.closest('figure')).not.toHaveTextContent('?');
  await userEvent.click(screen.getByRole('button', { name: 'A' }));
  expect(screen.getByText(/^Todavía no es la A/, { selector: '.mc-captions' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'A' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'E' }));
  expect(screen.getByText(/^¡Correcto! Es la E/, { selector: '.mc-captions' })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('Es la E.');
});
