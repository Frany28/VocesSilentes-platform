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
  expect(await screen.findByRole('heading', { name: 'Mi perfil' })).toBeVisible();
  expect(screen.getByLabelText('Correo electrónico')).toHaveValue(user.email);
  expect(screen.getByLabelText('Nombre')).toHaveAttribute('readonly');
  expect(screen.getByText('Correo pendiente de verificación')).toBeVisible();
  expect(screen.queryByRole('button', { name: /Guardar/ })).toBeNull();
});

test('práctica representa ocho estados elegidos manualmente sin cámara, red educativa ni progreso guardado', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { user } }));
  const media = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: media },
  });
  renderAuthApp('/student/practice');
  await screen.findByRole('heading', { name: 'Practicar' });
  const selector = screen.getByRole('combobox', { name: 'Estado de práctica (demostración)' });
  expect(within(selector).getAllByRole('option')).toHaveLength(8);
  await userEvent.click(screen.getByRole('button', { name: 'Activar cámara (demo)' }));
  expect(screen.getByRole('button', { name: 'Esperando permiso…' })).toBeDisabled();
  await userEvent.selectOptions(selector, 'ready');
  await userEvent.click(screen.getByRole('button', { name: 'Ver estado de análisis (demo)' }));
  expect(screen.getByRole('button', { name: 'Analizando…' })).toBeDisabled();
  await userEvent.selectOptions(selector, 'success');
  expect(screen.getByText(/No es una evaluación de tu seña/)).toBeVisible();
  expect(media).not.toHaveBeenCalled();
  expect(fetchMock.mock.calls.every(([url]) => url.endsWith('/me'))).toBe(true);
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
  await userEvent.click(screen.getByRole('button', { name: 'Volver a mis módulos' }));
  expect(await screen.findByRole('heading', { name: 'Mis módulos' })).toBeVisible();
});
