import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, unauthorized, renderAuthApp } from './auth-fixture.jsx';

test('protege acceso directo y vuelve a Mis módulos tras login con sesión real del proveedor', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url) =>
      Promise.resolve(
        url.endsWith('/me')
          ? unauthorized()
          : jsonResponse({
              data: url.endsWith('/csrf')
                ? { csrfToken: 'test-csrf' }
                : { user, csrfToken: 'test-rotated' },
            }),
      ),
    ),
  );
  renderAuthApp('/student/modules');
  expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
  fireEvent.change(screen.getByLabelText('Correo electrónico'), {
    target: { value: 'person@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'valid password' } });
  fireEvent.submit(screen.getByRole('form', { name: 'Inicia sesión' }));
  expect(await screen.findByRole('heading', { name: 'Mis módulos' })).toBeVisible();
  expect(await screen.findByRole('article', { name: 'Saludos y presentaciones' })).toBeVisible();
});

test('filtra por nombre/estado y abre la práctica demostrativa desde el catálogo', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { user } })));
  renderAuthApp('/student');
  expect(await screen.findByRole('heading', { name: 'Hola, Persona.' })).toBeVisible();
  await screen.findByRole('article', { name: 'Saludos y presentaciones' });
  await userEvent.click(screen.getByRole('link', { name: 'Mis módulos' }));
  const field = await screen.findByRole('searchbox', { name: 'Buscar módulo' });
  await userEvent.type(field, 'SALUDOS');
  expect(screen.getAllByRole('article')).toHaveLength(1);
  await userEvent.click(screen.getByRole('button', { name: 'Bloqueados · 2' }));
  expect(screen.getByRole('heading', { name: 'No encontramos ese módulo' })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Ver todos los módulos' }));
  expect(screen.getAllByRole('article')).toHaveLength(3);
  await userEvent.click(screen.getByRole('button', { name: 'En progreso · 1' }));
  expect(screen.getAllByRole('article')).toHaveLength(1);
  await userEvent.click(
    within(screen.getByRole('article')).getByRole('button', { name: 'Seguir aprendiendo' }),
  );
  expect(await screen.findByRole('heading', { name: 'Practicar' })).toBeVisible();
  expect(screen.getByText(/Demostración de práctica/)).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Cómo presentarme' })).toBeVisible();
});
