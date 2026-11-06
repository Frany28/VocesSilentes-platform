import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin } from './admin-fixture.jsx';
import { jsonResponse } from './auth-fixture.jsx';
import { metricsResponse } from './admin-metrics.fixture.js';

test('métricas: valores del servicio, habilitación distinta de actividad y gráficos con alternativa tabular', async () => {
  renderAdmin('/admin', () => jsonResponse({ data: metricsResponse() }));
  expect(await screen.findByText('8 habilitadas · 4 deshabilitadas')).toBeVisible();
  expect(screen.getByText('33,33%')).toBeVisible();
  expect(screen.getByRole('img', { name: 'Actividad de usuarios' })).toBeVisible();
  expect(screen.getByRole('img', { name: 'Progreso educativo' })).toBeVisible();
  const activity = screen.getByRole('region', { name: 'Actividad de usuarios' });
  fireEvent.click(within(activity).getByText('Ver datos por fecha'));
  expect(within(activity).getByRole('table')).toHaveTextContent('Usuarios con actividad');
  expect(
    screen.getByRole('progressbar', { name: 'Finalizaciones de Módulo sintético de prueba' }),
  ).toHaveAttribute('value', '2');
});

test('filtros y actualización: consulta servidor con fechas, conserva AbortSignal y muestra respuesta nueva', async () => {
  const { fetchMock } = renderAdmin('/admin', (url, options) => {
    expect(options.signal).toBeInstanceOf(AbortSignal);
    const data = metricsResponse();
    if (url.includes('period=custom')) data.users = 19;
    return jsonResponse({ data });
  });
  await screen.findByText('12');
  fireEvent.change(screen.getByLabelText('Período'), { target: { value: 'custom' } });
  fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-01' } });
  fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-10-31' } });
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar período' }));
  expect(await screen.findByText('19')).toBeVisible();
  const [url] = fetchMock.mock.calls.find(([value]) => value.includes('period=custom'));
  expect(new URL(url).searchParams.get('from')).toBe('2026-10-01');
  expect(new URL(url).searchParams.get('to')).toBe('2026-10-31');
  const count = fetchMock.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
  await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(count));
  expect(await screen.findByText('19')).toBeVisible();
});

test('vacío y falta de denominador: conserva cero y explica porcentaje no disponible', async () => {
  const data = metricsResponse();
  data.education.completionPercentage = null;
  data.education.completionUnavailableReason = 'No hay lecciones iniciadas en el período.';
  data.education.byModule = [];
  data.activity.daily = data.activity.daily.map((item) => ({ ...item, users: 0 }));
  renderAdmin('/admin', () => jsonResponse({ data }));
  expect(await screen.findByText('No disponible')).toBeVisible();
  expect(screen.getByText('No hay lecciones iniciadas en el período.')).toBeVisible();
  expect(screen.getByText('Sin actividad registrada en el período seleccionado.')).toBeVisible();
  expect(screen.getByText('No hay módulos publicados.')).toBeVisible();
});

test('error y reintento: no presenta ceros o datos de demostración ante un fallo del backend', async () => {
  let failed = true;
  renderAdmin('/admin', () =>
    failed
      ? jsonResponse(
          { error: { code: 'INTERNAL_ERROR', message: 'No se pudieron consultar métricas' } },
          500,
        )
      : jsonResponse({ data: metricsResponse() }),
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar la información');
  expect(screen.queryByText('Usuarios registrados')).not.toBeInTheDocument();
  failed = false;
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByText('12')).toBeVisible();
});
