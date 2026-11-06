import { screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { renderStudentRead } from './student-read-fixture.jsx';
import { user, jsonResponse } from './auth-fixture.jsx';

const alphabet = {
  id: 'alphabet-fixture',
  title: 'Abecedario LSV',
  order: 1,
  access: 'available',
  publicationStatus: 'PUBLISHED',
  contentKey: 'modulo-01-alfabeto-manual-lsv',
  description: 'Fixture explícita del contrato API',
  lessons: Array.from({ length: 7 }, (_, index) => ({
    id: `lesson-${index}`,
    title: `Lección ${index + 1}`,
    publicationStatus: 'PUBLISHED',
    status: index < 3 ? 'COMPLETED' : 'NOT_STARTED',
  })),
};
const planned = {
  id: 'numbers-fixture',
  title: 'Números',
  order: 2,
  access: 'upcoming',
  publicationStatus: 'DRAFT',
  lessons: [],
  description: 'Contenido en preparación',
};

test('catálogo API muestra orden real, 3/7=43% y próximos sin progreso ni candados', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { user } })));
  renderStudentRead(async () => ({ source: 'api', modules: [alphabet, planned] }));
  const cards = await screen.findAllByRole('article');
  expect(cards.map((item) => item.getAttribute('aria-label'))).toEqual([
    'Abecedario LSV',
    'Números',
  ]);
  expect(within(cards[0]).getByText('MÓDULO 01 · LSV')).toBeVisible();
  expect(within(cards[0]).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '43');
  expect(within(cards[0]).getByText('3 de 7 lecciones')).toBeVisible();
  expect(within(cards[1]).queryByRole('progressbar')).toBeNull();
  expect(within(cards[1]).getByRole('button', { name: 'Próximamente' })).toBeDisabled();
  expect(screen.queryByText(/Bloqueado|Primeras conversaciones|COMUNICACIÓN COTIDIANA/)).toBeNull();
  expect(screen.queryByRole('link', { name: /Comenzar módulo de vocales/ })).toBeNull();
  for (const title of ['Saludos y presentaciones', 'Personas y relaciones', 'Vida cotidiana'])
    expect(screen.queryByText(title)).toBeNull();
});

test('plan registrado sin publicaciones informa vacío disponible y no inventa porcentajes', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { user } })));
  renderStudentRead(async () => ({
    source: 'api',
    modules: [{ ...planned, title: 'Abecedario LSV', order: 1 }],
  }));
  expect(
    await screen.findByRole('heading', { name: 'Todavía no hay lecciones publicadas' }),
  ).toBeVisible();
  expect(screen.queryByRole('progressbar')).toBeNull();
  expect(screen.getByRole('article', { name: 'Abecedario LSV' })).toBeVisible();
});
