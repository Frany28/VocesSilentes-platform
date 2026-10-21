import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, test } from 'vitest';
import { AdminReports } from '../features/admin/pages/AdminReports.jsx';
import { report } from './admin-report-fixture.js';

test('colección proporcionada: filtra reportes por estado/asunto, restablece filtros y muestra tarjetas', () => {
  render(
    <MemoryRouter>
      <AdminReports
        status="ready"
        reports={[
          report,
          { ...report, id: 'resolved', title: 'Caso atendido', status: 'RESOLVED' },
        ]}
      />
    </MemoryRouter>,
  );
  expect(screen.getAllByRole('button', { name: /Revisar/ })).toHaveLength(2);
  fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'RESOLVED' } });
  expect(screen.getByRole('heading', { name: 'Caso atendido' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Revisión de prueba' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Buscar reportes'), {
    target: { value: 'sin coincidencias' },
  });
  expect(screen.getByText('No encontramos resultados')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Ver todos' }));
  expect(screen.getAllByRole('button', { name: /Revisar/ })).toHaveLength(2);
});
