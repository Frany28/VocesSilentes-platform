import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, renderAuthApp } from './auth-fixture.jsx';

test('los cinco destinos móviles navegan; perfil usa sesión real y progreso el mismo catálogo demo', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { user } })));
  renderAuthApp('/student');
  await screen.findByRole('heading', { name: 'Hola, Persona.' });
  const nav = screen.getByRole('navigation', { name: 'Navegación inferior de estudiante' });
  expect(within(nav).getAllByRole('link')).toHaveLength(5);
  await userEvent.click(within(nav).getByRole('link', { name: 'Progreso' }));
  expect(await screen.findByRole('heading', { name: 'Mi progreso' })).toBeVisible();
  expect(await screen.findByRole('article', { name: 'Saludos y presentaciones' })).toBeVisible();
  expect(screen.getByText('03 / 05')).toBeVisible();
  await userEvent.click(within(nav).getByRole('link', { name: 'Perfil' }));
  expect(await screen.findByRole('heading', { name: 'Tu perfil, a tu manera.' })).toBeVisible();
  expect(screen.getByLabelText('Correo de acceso')).toHaveValue(user.email);
  expect(screen.getByLabelText('Nombre')).not.toHaveAttribute('readonly');
  expect(screen.getByText('Correo pendiente de verificación')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
});

test('práctica abre vocales reales sin estados simulados ni permisos automáticos de cámara', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { user } }));
  const media = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: media },
  });
  renderAuthApp('/student/practice');
  await screen.findByRole('heading', { name: 'Practicar' });
  expect(screen.queryByRole('combobox', { name: 'Estado de práctica (demostración)' })).toBeNull();
  const selector = screen.getByRole('group', { name: 'Elegir vocal para practicar' });
  expect(within(selector).getAllByRole('button')).toHaveLength(5);
  await userEvent.click(within(selector).getByRole('button', { name: 'Practicar vocal E' }));
  expect(await screen.findByRole('img', { name: /referencia de la letra E/ })).toBeVisible();
  // La fixture no sirve un modelo válido: la carga automática falla y queda el botón de reintento.
  expect(await screen.findByRole('button', { name: 'Reintentar' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: 'Analizar intento' })).toBeNull();
  expect(media).not.toHaveBeenCalled();
  const urls = fetchMock.mock.calls.map(([url]) => url);
  expect(
    urls.every((url) => url.endsWith('/me') || url === '/models/lsv-vowels-demo-v1.json'),
  ).toBe(true);
  expect(urls.filter((url) => url.startsWith('/models/'))).toHaveLength(1);
  await userEvent.click(screen.getByRole('link', { name: 'Mi progreso' }));
  expect(await screen.findByText('03 / 05')).toBeVisible();
});

test('guía abre y cierra instrucciones accesibles; volver a módulos conserva navegación', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { user } })));
  renderAuthApp('/student/practice');
  await screen.findByRole('heading', { name: 'Practicar' });
  const trigger = screen.getByRole('button', { name: 'Ver instrucciones' });
  trigger.focus();
  await userEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Instrucciones de práctica' });
  expect(within(dialog).getByRole('button', { name: 'Volver a practicar' })).toHaveFocus();
  expect(within(dialog).getByRole('heading', { name: 'Prepara tu próximo intento' })).toBeVisible();
  fireEvent(dialog, new Event('cancel', { bubbles: true, cancelable: true }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(trigger).toHaveFocus();
  await userEvent.click(screen.getByRole('link', { name: 'Mis módulos', exact: true }));
  expect(await screen.findByRole('heading', { name: 'Mis módulos' })).toBeVisible();
});
